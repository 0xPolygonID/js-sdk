import { JsonRpcProvider, Signer, Contract, TransactionRequest, ethers } from 'ethers';
import { EthConnectionConfig } from './state';
import { IOnChainZKPVerifier } from '../interfaces/onchain-zkp-verifier';
import {
  AuthProofResponse,
  ContractInvokeTransactionData,
  JsonDocumentObjectValue,
  ZeroKnowledgeInvokeResponse,
  ZeroKnowledgeProofResponse
} from '../../iden3comm';
import abi from './abi/ZkpVerifier.json';
//import { UniversalVerifier } from '@iden3/universal-verifier-v2-abi';
import UniversalVerifierAbi from './abi/UniversalVerifier.json';
import { TransactionService } from '../../blockchain';
import { chainIDfromDID, DID, Id } from '@iden3/js-iden3-core';
import {
  AtomicQueryMTPV2OnChainPubSignals,
  AtomicQuerySigV2OnChainPubSignals,
  AtomicQueryV3OnChainPubSignals,
  AuthV2PubSignals,
  CircuitId,
  StatesInfo
} from '../../circuits';
import { byteEncoder, DIDDocumentSignature, resolveDidDocument } from '../../utils';
import { GlobalStateUpdate, IdentityStateUpdate } from '../entities/state';
import { poseidon } from '@iden3/js-crypto';
import { Hash } from '@iden3/js-merkletree';

const maxGasLimit = 10000000n;

/**
 * Supported function signature for SubmitZKPResponse
 */
export enum FunctionSignatures {
  /**
   * solidity identifier for function signature:
   * function submitZKPResponse(uint64 requestId, uint256[] calldata inputs,
   * uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c) public
   */
  SubmitZKPResponseV1 = 'b68967e2',
  //function submitZKPResponseV2(tuple[](uint64 requestId,bytes zkProof,bytes data),bytes crossChainProof)
  SubmitZKPResponseV2 = 'ade09fcd',
  //function submitResponse(tuple(string authMethod,bytes proof),tuple(uint256 requestId,bytes proof,bytes metadata)[],bytes crossChainProof)
  SubmitResponse = '06c86a91'
}
/**
 * OnChainZKPVerifierOptions represents OnChainZKPVerifier options
 */
export type OnChainZKPVerifierOptions = {
  didResolverUrl?: string;
};

type OnChainZKPVerifierCircuitId =
  | CircuitId.AuthV2
  | CircuitId.AtomicQueryMTPV2OnChain
  | CircuitId.AtomicQuerySigV2OnChain
  | CircuitId.AtomicQueryV3OnChain;

/**
 * OnChainZKPVerifier is a class that allows to interact with the OnChainZKPVerifier contract
 * and submitZKPResponse.
 *
 * @beta
 * @class OnChainZKPVerifier
 */
export class OnChainZKPVerifier implements IOnChainZKPVerifier {
  /**
   * supported circuits
   */
  private static readonly _supportedCircuits: OnChainZKPVerifierCircuitId[] = [
    CircuitId.AuthV2,
    CircuitId.AtomicQueryMTPV2OnChain,
    CircuitId.AtomicQuerySigV2OnChain,
    CircuitId.AtomicQueryV3OnChain
  ];

  private static readonly _supportedCircuitsPubSignalsMap = {
    [CircuitId.AtomicQueryMTPV2OnChain]: AtomicQueryMTPV2OnChainPubSignals,
    [CircuitId.AtomicQuerySigV2OnChain]: AtomicQuerySigV2OnChainPubSignals,
    [CircuitId.AtomicQueryV3OnChain]: AtomicQueryV3OnChainPubSignals,
    [CircuitId.AuthV2]: AuthV2PubSignals
  };

  /**
   *
   * Creates an instance of OnChainZKPVerifier.
   * @beta
   * @param {EthConnectionConfig[]} - array of ETH configs
   */

  constructor(
    private readonly _configs: EthConnectionConfig[],
    private readonly _opts?: OnChainZKPVerifierOptions
  ) {}

  public static async prepareTxArgsSubmitV1(
    txData: ContractInvokeTransactionData,
    zkProofResponse: ZeroKnowledgeProofResponse
  ): Promise<JsonDocumentObjectValue[]> {
    if (txData.method_id.replace('0x', '') !== FunctionSignatures.SubmitZKPResponseV1) {
      throw new Error(
        `prepareTxArgsSubmitV1 function doesn't implement requested method id. Only '0x${FunctionSignatures.SubmitZKPResponseV1}' is supported.`
      );
    }
    const requestID = zkProofResponse.id;
    const inputs = zkProofResponse.pub_signals;

    const payload = [
      requestID,
      inputs,
      zkProofResponse.proof.pi_a.slice(0, 2),
      [
        [zkProofResponse.proof.pi_b[0][1], zkProofResponse.proof.pi_b[0][0]],
        [zkProofResponse.proof.pi_b[1][1], zkProofResponse.proof.pi_b[1][0]]
      ],
      zkProofResponse.proof.pi_c.slice(0, 2)
    ];

    return payload;
  }
  /**
   * {@inheritDoc IOnChainZKPVerifier.prepareTxArgsSubmitV1}
   */
  public async prepareTxArgsSubmitV1(
    txData: ContractInvokeTransactionData,
    zkProofResponse: ZeroKnowledgeProofResponse
  ): Promise<JsonDocumentObjectValue[]> {
    return OnChainZKPVerifier.prepareTxArgsSubmitV1(txData, zkProofResponse);
  }

  /**
   * {@inheritDoc IOnChainZKPVerifier.submitZKPResponse}
   */
  public async submitZKPResponse(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<string, ZeroKnowledgeProofResponse>> {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id.replace('0x', '') !== FunctionSignatures.SubmitZKPResponseV1) {
      throw new Error(
        `submitZKPResponse function doesn't implement requested method id. Only '0x${FunctionSignatures.SubmitZKPResponseV1}' is supported.`
      );
    }
    const provider = new JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    ethSigner = ethSigner.connect(provider);
    const response = new Map<string, ZeroKnowledgeProofResponse>();

    const feeData = await provider.getFeeData();
    const maxFeePerGas = chainConfig.maxFeePerGas
      ? BigInt(chainConfig.maxFeePerGas)
      : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas
      ? BigInt(chainConfig.maxPriorityFeePerGas)
      : feeData.maxPriorityFeePerGas;

    const verifierContract = new Contract(txData.contract_address, abi);

    for (const zkProofResponse of zkProofResponses) {
      const txArgs = await this.prepareTxArgsSubmitV1(txData, zkProofResponse);
      const payload = await verifierContract.submitZKPResponse.populateTransaction(...txArgs);
      const request: TransactionRequest = {
        to: txData.contract_address,
        data: payload.data,
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
      response.set(txnHash, zkProofResponse);
    }

    return response;
  }

  /**
   * {@inheritDoc IOnChainZKPVerifier.submitZKPResponseV2}
   */
  public async submitZKPResponseV2(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<string, ZeroKnowledgeInvokeResponse>> {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id.replace('0x', '') !== FunctionSignatures.SubmitZKPResponseV2) {
      throw new Error(
        `submitZKPResponseV2 function doesn't implement requested method id. Only '0x${FunctionSignatures.SubmitZKPResponseV2}' is supported.`
      );
    }
    if (!this._opts?.didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    const provider = new JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    ethSigner = ethSigner.connect(provider);

    const txDataArgs = await this.prepareTxArgsSubmitV2(txData, zkProofResponses);
    const feeData = await provider.getFeeData();
    const maxFeePerGas = chainConfig.maxFeePerGas
      ? BigInt(chainConfig.maxFeePerGas)
      : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas
      ? BigInt(chainConfig.maxPriorityFeePerGas)
      : feeData.maxPriorityFeePerGas;

    const verifierContract = new Contract(txData.contract_address, abi);
    const txRequestData = await verifierContract.submitZKPResponseV2.populateTransaction(
      ...txDataArgs
    );

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

    return new Map<string, ZeroKnowledgeInvokeResponse>().set(txnHash, {
      responses: zkProofResponses
    });
  }

  /**
   * {@inheritDoc IOnChainVerifierMultiQuery.submitResponse}
   */
  public async submitResponse(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    authResponse: AuthProofResponse,
    responses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<string, ZeroKnowledgeInvokeResponse>> {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id.replace('0x', '') !== FunctionSignatures.SubmitResponse) {
      throw new Error(
        `submitResponse function doesn't implement requested method id. Only '0x${FunctionSignatures.SubmitResponse}' is supported.`
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

    const verifierContract = new Contract(txData.contract_address, UniversalVerifierAbi);
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
    return new Map<string, ZeroKnowledgeInvokeResponse>().set(txnHash, {
      responses: responses,
      authProofs: [authResponse],
      crossChainProofs: [txDataArgs[2] as string]
    });
  }

  public static async prepareTxArgsSubmit(
    resolverUrl: string,
    txData: ContractInvokeTransactionData,
    authResponse: AuthProofResponse,
    responses: ZeroKnowledgeProofResponse[]
  ): Promise<JsonDocumentObjectValue[]> {
    if (txData.method_id.replace('0x', '') !== FunctionSignatures.SubmitResponse) {
      throw new Error(
        `submit cross chain doesn't implement requested method id. Only '0x${FunctionSignatures.SubmitResponse}' is supported.`
      );
    }
    const gistUpdateArr: any[] = [];
    const stateUpdateArr: any[] = [];
    const payloadResponses = [];

    // 1. Process auth response
    const { authMethod, zkProofEncoded } = await this._processAuthProof(authResponse);
    const payloadAuthResponse = { authMethod: authMethod, proof: zkProofEncoded };

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
    return OnChainZKPVerifier.prepareTxArgsSubmit(
      this._opts.didResolverUrl,
      txData,
      authResponse,
      responses
    );
  }

  private static getCrossChainResolvers(
    source: {
      id: Id;
      root?: Hash;
      state?: Hash;
    }[],
    txDataChainId: number,
    type: 'gist' | 'state',
    didResolverUrl: string
  ) {
    return [
      ...new Set(
        source.map((info) =>
          JSON.stringify({
            id: info.id.string(),
            [type]: type === 'gist' ? info.root?.string() : info.state?.string()
          })
        )
      )
    ].reduce((acc: Promise<unknown>[], s: string) => {
      const info = JSON.parse(s);
      const id = Id.fromString(info.id);
      const chainId = chainIDfromDID(DID.parseFromId(id));

      if (txDataChainId === chainId) {
        return acc;
      }
      const promise = this.resolveDidDocumentEip712MessageAndSignature(
        DID.parseFromId(Id.fromString(info.id)),
        didResolverUrl,
        {
          [type]: Hash.fromString(info[type])
        }
      );
      return [...acc, promise];
    }, []);
  }

  public static async prepareTxArgsSubmitV2(
    resolverUrl: string,
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<JsonDocumentObjectValue[]> {
    if (txData.method_id.replace('0x', '') !== FunctionSignatures.SubmitZKPResponseV2) {
      throw new Error(
        `submit cross chain doesn't implement requested method id. Only '0x${FunctionSignatures.SubmitZKPResponseV2}' is supported.`
      );
    }

    const gistUpdates = [];
    const stateUpdates = [];
    const payload = [];
    const emptyBytes = '0x';

    for (const zkProof of zkProofResponses) {
      const { id: requestId, pub_signals: inputs } = zkProof;
      const proofCircuitId = zkProof.circuitId as OnChainZKPVerifierCircuitId;

      if (!this._supportedCircuits.includes(proofCircuitId)) {
        throw new Error(`Circuit ${zkProof.circuitId} not supported by OnChainZKPVerifier`);
      }

      if (inputs.length === 0) {
        payload.push({
          requestId: requestId,
          zkProof: emptyBytes,
          data: emptyBytes
        });
        continue;
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

      const stateInfo = this.getOnChainGistRootStatePubSignals(proofCircuitId, inputs);

      const chainId = txData.chain_id;
      const gistUpdateResolutions = this.getCrossChainResolvers(
        stateInfo.gists,
        chainId,
        'gist',
        resolverUrl
      );

      const stateUpdateResolutions = this.getCrossChainResolvers(
        stateInfo.states,
        chainId,
        'state',
        resolverUrl
      );

      if (gistUpdateResolutions.length > 0) {
        gistUpdates.push(...((await Promise.all(gistUpdateResolutions)) as GlobalStateUpdate[]));
      }
      if (stateUpdateResolutions.length > 0) {
        stateUpdates.push(
          ...((await Promise.all(stateUpdateResolutions)) as IdentityStateUpdate[])
        );
      }

      const metadataArr: { key: string; value: Uint8Array }[] = [];
      if (zkProof.vp) {
        for (const key in zkProof.vp.verifiableCredential.credentialSubject) {
          if (key === '@type') {
            continue;
          }
          const metadataValue = poseidon.hashBytes(
            byteEncoder.encode(
              JSON.stringify(zkProof.vp.verifiableCredential.credentialSubject[key])
            )
          );
          const bytesValue = byteEncoder.encode(metadataValue.toString());
          metadataArr.push({
            key,
            value: bytesValue
          });
        }
      }

      const metadata = metadataArr.length ? this.packMetadatas(metadataArr) : emptyBytes;
      payload.push({
        requestId: requestId,
        zkProof: zkProofEncoded,
        data: metadata
      });
    }

    const crossChainProofs =
      gistUpdates.length || stateUpdates.length
        ? this.packCrossChainProofs(gistUpdates, stateUpdates)
        : emptyBytes;
    return [payload, crossChainProofs];
  }

  public async prepareTxArgsSubmitV2(
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<JsonDocumentObjectValue[]> {
    if (!this._opts?.didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    return OnChainZKPVerifier.prepareTxArgsSubmitV2(
      this._opts.didResolverUrl,
      txData,
      zkProofResponses
    );
  }

  private static async _processAuthProof(authProof: AuthProofResponse) {
    const authMethod = authProof.authMethod;
    const inputs = authProof.pub_signals;

    if (!this._supportedCircuits.includes(authProof.circuitId as OnChainZKPVerifierCircuitId)) {
      throw new Error(`Circuit ${authProof.circuitId} not supported by OnChainZKPVerifier`);
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

    return { authMethod, zkProofEncoded };
  }

  private static async _processProof(zkProof: ZeroKnowledgeProofResponse) {
    const requestID = zkProof.id;
    const inputs = zkProof.pub_signals;

    if (!this._supportedCircuits.includes(zkProof.circuitId as OnChainZKPVerifierCircuitId)) {
      throw new Error(`Circuit ${zkProof.circuitId} not supported by OnChainZKPVerifier`);
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
    onChainCircuitId: OnChainZKPVerifierCircuitId,
    inputs: string[]
  ): StatesInfo {
    const PubSignals = this._supportedCircuitsPubSignalsMap[onChainCircuitId];
    if (!PubSignals) {
      throw new Error(`Circuit ${onChainCircuitId} not supported by OnChainZKPVerifier`);
    }
    const atomicQueryPubSignals = new PubSignals();
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
