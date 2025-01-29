import { JsonRpcProvider, Signer, Contract, TransactionRequest, ethers } from 'ethers';
import { EthConnectionConfig } from './state';
import {
  AuthProofResponse,
  ContractInvokeTransactionData,
  JsonDocumentObjectValue,
  ZeroKnowledgeProofResponse
} from '../../iden3comm';
import abi from './abi/UniversalVerifier.json';
import { TransactionService } from '../../blockchain';
import { DID } from '@iden3/js-iden3-core';
import {
  AtomicQueryMTPV2OnChainPubSignals,
  AtomicQuerySigV2OnChainPubSignals,
  AtomicQueryV3OnChainPubSignals,
  CircuitId,
  StatesInfo
} from '../../circuits';
import { byteEncoder, DIDDocumentSignature, resolveDidDocument } from '../../utils';
import { GlobalStateUpdate, IdentityStateUpdate } from '../entities/state';
import { poseidon } from '@iden3/js-crypto';
import { Hash } from '@iden3/js-merkletree';
import { IOnChainVerifierMultiQuery } from '../interfaces/onchain-verifier-multi-query';

const maxGasLimit = 10000000n;

/**
 * Supported function signature for SubmitResponse
 */
export enum FunctionSignaturesMultiQuery {
  //function submitResponse(tuple(string authType,bytes proof),tuple[](uint256 requestId,bytes proof,bytes metadata),bytes crossChainProof)
  SubmitResponse = '06c86a91'
}
/**
 * OnChainVerifierMultiQueryOptions represents OnChainVerifierMultiQuery options
 */
export type OnChainVerifierMultiQueryOptions = {
  didResolverUrl?: string;
};

/**
 * OnChainVerifierMultiQuery is a class that allows to interact with the OnChainVerifierMultiQuery contract
 * and submitResponse.
 *
 * @beta
 * @class OnChainVerifierMultiQuery
 */
export class OnChainVerifierMultiQuery implements IOnChainVerifierMultiQuery {
  /**
   * supported circuits
   */
  private static readonly _supportedCircuits = [
    CircuitId.AtomicQueryMTPV2OnChain,
    CircuitId.AtomicQuerySigV2OnChain,
    CircuitId.AtomicQueryV3OnChain
  ];

  /**
   *
   * Creates an instance of OnChainVerifierMultiQuery.
   * @beta
   * @param {EthConnectionConfig[]} - array of ETH configs
   */

  constructor(
    private readonly _configs: EthConnectionConfig[],
    private readonly _opts?: OnChainVerifierMultiQueryOptions
  ) {}

  /**
   * {@inheritDoc IOnChainVerifierMultiQuery.submitResponse}
   */
  public async submitResponse(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    authResponse: AuthProofResponse,
    responses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<string, ZeroKnowledgeProofResponse[]>> {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id.replace('0x', '') !== FunctionSignaturesMultiQuery.SubmitResponse) {
      throw new Error(
        `submitResponse function doesn't implement requested method id. Only '0x${FunctionSignaturesMultiQuery.SubmitResponse}' is supported.`
      );
    }
    if (!this._opts?.didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    const provider = new JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    ethSigner = ethSigner.connect(provider);

    const txDataArgs = await this.prepareTxArgsSubmit(txData, authResponse, responses);
    const feeData = await provider.getFeeData();
    const maxFeePerGas = chainConfig.maxFeePerGas
      ? BigInt(chainConfig.maxFeePerGas)
      : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas
      ? BigInt(chainConfig.maxPriorityFeePerGas)
      : feeData.maxPriorityFeePerGas;

    const verifierContract = new Contract(txData.contract_address, abi);
    const txRequestData = await verifierContract.submitResponse.populateTransaction(...txDataArgs);

    const request: TransactionRequest = {
      to: txData.contract_address,
      data: txRequestData.data,
      maxFeePerGas,
      maxPriorityFeePerGas
    };

    let gasLimit;
    try {
      gasLimit = await ethSigner.estimateGas(request);
    } catch (e) {
      gasLimit = maxGasLimit;
    }
    request.gasLimit = gasLimit;

    const transactionService = new TransactionService(provider);
    const { txnHash } = await transactionService.sendTransactionRequest(ethSigner, request);
    // return multiple responses for all the responses (single and grouped)
    return new Map<string, ZeroKnowledgeProofResponse[]>().set(txnHash, responses);
  }

  private static async _processAuthProof(authProof: AuthProofResponse) {
    const authType = authProof.authType;
    const inputs = authProof.pub_signals;

    if (!this._supportedCircuits.includes(authProof.circuitId as CircuitId)) {
      throw new Error(`Circuit ${authProof.circuitId} not supported by OnChainVerifierMultiQuery`);
    }

    const zkProofEncoded = this.packZkpProof(
      inputs,
      authProof.proof.pi_a.slice(0, 2),
      [
        [authProof.proof.pi_b[0][1], authProof.proof.pi_b[0][0]],
        [authProof.proof.pi_b[1][1], authProof.proof.pi_b[1][0]]
      ],
      authProof.proof.pi_c.slice(0, 2)
    );

    return { authType, zkProofEncoded };
  }

  private static async _processProof(zkProof: ZeroKnowledgeProofResponse) {
    const requestID = zkProof.id;
    const inputs = zkProof.pub_signals;

    if (!this._supportedCircuits.includes(zkProof.circuitId as CircuitId)) {
      throw new Error(`Circuit ${zkProof.circuitId} not supported by OnChainVerifierMultiQuery`);
    }

    const zkProofEncoded = this.packZkpProof(
      inputs,
      zkProof.proof.pi_a.slice(0, 2),
      [
        [zkProof.proof.pi_b[0][1], zkProof.proof.pi_b[0][0]],
        [zkProof.proof.pi_b[1][1], zkProof.proof.pi_b[1][0]]
      ],
      zkProof.proof.pi_c.slice(0, 2)
    );

    const metadataArr: { key: string; value: Uint8Array }[] = [];
    if (zkProof.vp) {
      for (const key in zkProof.vp.verifiableCredential.credentialSubject) {
        if (key === '@type') {
          continue;
        }
        const metadataValue = poseidon.hashBytes(
          byteEncoder.encode(JSON.stringify(zkProof.vp.verifiableCredential.credentialSubject[key]))
        );
        const bytesValue = byteEncoder.encode(metadataValue.toString());
        metadataArr.push({
          key,
          value: bytesValue
        });
      }
    }

    const metadata = metadataArr.length ? this.packMetadatas(metadataArr) : '0x';

    return { requestID, zkProofEncoded, metadata };
  }

  public static async prepareTxArgsSubmit(
    resolverUrl: string,
    txData: ContractInvokeTransactionData,
    authResponse: AuthProofResponse,
    responses: ZeroKnowledgeProofResponse[]
  ): Promise<JsonDocumentObjectValue[]> {
    if (txData.method_id.replace('0x', '') !== FunctionSignaturesMultiQuery.SubmitResponse) {
      throw new Error(
        `submit cross chain doesn't implement requested method id. Only '0x${FunctionSignaturesMultiQuery.SubmitResponse}' is supported.`
      );
    }
    const gistUpdateArr: any[] = [];
    const stateUpdateArr: any[] = [];
    const payloadResponses = [];

    // 1. Process auth response
    const { authType, zkProofEncoded } = await this._processAuthProof(authResponse);
    const payloadAuthResponse = { authType: authType, proof: zkProofEncoded };

    // 2. Process all the responses
    for (const zkProof of responses) {
      const { requestID, zkProofEncoded, metadata } = await this._processProof(zkProof);

      payloadResponses.push({
        requestId: requestID,
        proof: zkProofEncoded,
        metadata: metadata
      });
    }

    const crossChainProofs = this.packCrossChainProofs(gistUpdateArr, stateUpdateArr);
    return [payloadAuthResponse, payloadResponses, crossChainProofs];
  }

  public async prepareTxArgsSubmit(
    txData: ContractInvokeTransactionData,
    authResponse: AuthProofResponse,
    responses: ZeroKnowledgeProofResponse[]
  ): Promise<JsonDocumentObjectValue[]> {
    if (!this._opts?.didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    return OnChainVerifierMultiQuery.prepareTxArgsSubmit(
      this._opts.didResolverUrl,
      txData,
      authResponse,
      responses
    );
  }

  private static packZkpProof(inputs: string[], a: string[], b: string[][], c: string[]): string {
    return new ethers.AbiCoder().encode(
      ['uint256[] inputs', 'uint256[2]', 'uint256[2][2]', 'uint256[2]'],
      [inputs, a, b, c]
    );
  }

  private static packCrossChainProofs(
    gistUpdateArr: GlobalStateUpdate[],
    stateUpdateArr: IdentityStateUpdate[]
  ) {
    const proofs = [];
    for (const globalStateUpdate of gistUpdateArr) {
      proofs.push({
        proofType: 'globalStateProof',
        proof: this.packGlobalStateMsg(globalStateUpdate)
      });
    }
    for (const stateUpdate of stateUpdateArr) {
      proofs.push({
        proofType: 'stateProof',
        proof: this.packIdentityStateMsg(stateUpdate)
      });
    }
    return new ethers.AbiCoder().encode(
      ['tuple(' + 'string proofType,' + 'bytes proof' + ')[]'],
      [proofs]
    );
  }

  public static packGlobalStateMsg(msg: GlobalStateUpdate): string {
    return new ethers.AbiCoder().encode(
      [
        'tuple(' +
          'tuple(' +
          'uint256 timestamp,' +
          'bytes2 idType,' +
          'uint256 root,' +
          'uint256 replacedAtTimestamp' +
          ') globalStateMsg,' +
          'bytes signature,' +
          ')'
      ],
      [msg]
    );
  }

  private static packIdentityStateMsg(msg: IdentityStateUpdate): string {
    return new ethers.AbiCoder().encode(
      [
        'tuple(' +
          'tuple(' +
          'uint256 timestamp,' +
          'uint256 id,' +
          'uint256 state,' +
          'uint256 replacedAtTimestamp' +
          ') idStateMsg,' +
          'bytes signature,' +
          ')'
      ],
      [msg]
    );
  }

  private static packMetadatas(
    metas: {
      key: string;
      value: Uint8Array;
    }[]
  ): string {
    return new ethers.AbiCoder().encode(
      ['tuple(' + 'string key,' + 'bytes value' + ')[]'],
      [metas]
    );
  }

  private static getOnChainGistRootStatePubSignals(
    onChainCircuitId:
      | CircuitId.AtomicQueryMTPV2OnChain
      | CircuitId.AtomicQuerySigV2OnChain
      | CircuitId.AtomicQueryV3OnChain,
    inputs: string[]
  ): StatesInfo {
    let atomicQueryPubSignals;
    switch (onChainCircuitId) {
      case CircuitId.AtomicQueryMTPV2OnChain:
        atomicQueryPubSignals = new AtomicQueryMTPV2OnChainPubSignals();
        break;
      case CircuitId.AtomicQuerySigV2OnChain:
        atomicQueryPubSignals = new AtomicQuerySigV2OnChainPubSignals();
        break;
      case CircuitId.AtomicQueryV3OnChain:
        atomicQueryPubSignals = new AtomicQueryV3OnChainPubSignals();
        break;
    }
    const encodedInputs = byteEncoder.encode(JSON.stringify(inputs));
    atomicQueryPubSignals.pubSignalsUnmarshal(encodedInputs);
    return atomicQueryPubSignals.getStatesInfo();
  }

  private static async resolveDidDocumentEip712MessageAndSignature(
    did: DID,
    resolverUrl: string,
    opts?: {
      state?: Hash;
      gist?: Hash;
    }
  ) {
    const didDoc = await resolveDidDocument(did, resolverUrl, {
      ...opts,
      signature: DIDDocumentSignature.EthereumEip712Signature2021
    });
    if (!didDoc.didResolutionMetadata.proof?.length) {
      throw new Error('No proof found in resolved DID document');
    }
    const message = didDoc.didResolutionMetadata.proof[0].eip712.message;
    const signature = didDoc.didResolutionMetadata.proof[0].proofValue;
    const isGistRequest = opts?.gist && !opts.state;
    if (isGistRequest) {
      return {
        globalStateMsg: {
          timestamp: message.timestamp,
          idType: message.idType,
          root: message.root,
          replacedAtTimestamp: message.replacedAtTimestamp
        },
        signature
      };
    }

    return {
      idStateMsg: {
        timestamp: message.timestamp,
        id: message.id,
        state: message.state,
        replacedAtTimestamp: message.replacedAtTimestamp
      },
      signature
    };
  }
}
