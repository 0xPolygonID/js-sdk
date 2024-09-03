import { JsonRpcProvider, Signer, Contract, TransactionRequest, ethers } from 'ethers';
import { EthConnectionConfig } from './state';
import { IOnChainZKPVerifier } from '../interfaces/onchain-zkp-verifier';
import {
  ContractInvokeTransactionData,
  JsonDocumentObjectValue,
  ZeroKnowledgeProofResponse
} from '../../iden3comm';
import abi from './abi/ZkpVerifier.json';
import { TransactionService } from '../../blockchain';
import { DID } from '@iden3/js-iden3-core';
import {
  AtomicQueryMTPV2OnChainPubSignals,
  AtomicQuerySigV2OnChainPubSignals,
  AtomicQueryV3OnChainPubSignals,
  CircuitId,
  StatesInfo
} from '../../circuits';
import { byteEncoder, resolveDidDocumentEip712MessageAndSignature } from '../../utils';
import { GlobalStateUpdate, IdentityStateUpdate } from '../entities/state';
import { poseidon } from '@iden3/js-crypto';

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
  SumbitZKPResponseV1 = 'b68967e2',
  //function submitZKPResponseV2(tuple[](uint64 requestId,bytes zkProof,bytes data),bytes crossChainProof)
  SumbitZKPResponseV2 = 'ade09fcd'
}
/**
 * OnChainZKPVerifierOptions represents OnChainZKPVerifier options
 */
export type OnChainZKPVerifierOptions = {
  didResolverUrl?: string;
};

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
  private readonly _supportedCircuits = [
    CircuitId.AtomicQueryMTPV2OnChain,
    CircuitId.AtomicQuerySigV2OnChain,
    CircuitId.AtomicQueryV3OnChain
  ];

  /**
   * abi coder to encode/decode structures to solidity bytes
   */
  private readonly _abiCoder = new ethers.AbiCoder();
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

  /**
   * {@inheritDoc IOnChainZKPVerifier.prepareZKPResponseSubmitV1TxData}
   */
  public async prepareZKPResponseSubmitV1TxData(
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<number, JsonDocumentObjectValue[]>> {
    if (txData.method_id.replace('0x', '') !== FunctionSignatures.SumbitZKPResponseV1) {
      throw new Error(
        `prepareZKPResponseSubmitV1TxData function doesn't implement requested method id. Only '0x${FunctionSignatures.SumbitZKPResponseV1}' is supported.`
      );
    }
    const response = new Map<number, JsonDocumentObjectValue[]>();
    for (const zkProof of zkProofResponses) {
      const requestID = zkProof.id;
      const inputs = zkProof.pub_signals;

      const payload = [
        requestID,
        inputs,
        zkProof.proof.pi_a.slice(0, 2),
        [
          [zkProof.proof.pi_b[0][1], zkProof.proof.pi_b[0][0]],
          [zkProof.proof.pi_b[1][1], zkProof.proof.pi_b[1][0]]
        ],
        zkProof.proof.pi_c.slice(0, 2)
      ];

      response.set(requestID, payload);
    }

    return response;
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
    if (txData.method_id.replace('0x', '') !== FunctionSignatures.SumbitZKPResponseV1) {
      throw new Error(
        `submitZKPResponse function doesn't implement requested method id. Only '0x${FunctionSignatures.SumbitZKPResponseV1}' is supported.`
      );
    }
    const provider = new JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    ethSigner = ethSigner.connect(provider);

    const txDataMap = await this.prepareZKPResponseSubmitV1TxData(txData, zkProofResponses);
    const response = new Map<string, ZeroKnowledgeProofResponse>();

    const feeData = await provider.getFeeData();
    const maxFeePerGas = chainConfig.maxFeePerGas
      ? BigInt(chainConfig.maxFeePerGas)
      : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas
      ? BigInt(chainConfig.maxPriorityFeePerGas)
      : feeData.maxPriorityFeePerGas;

    const verifierContract = new Contract(txData.contract_address, abi);

    for (const [requestId, value] of txDataMap) {
      const zkProof = zkProofResponses.find((i) => i.id == requestId);
      if (!zkProof) {
        throw new Error(`zkProof not found for request id ${requestId}`);
      }
      const payload = await verifierContract.submitZKPResponse.populateTransaction(...value);
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
      response.set(txnHash, zkProof);
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
  ): Promise<Map<string, ZeroKnowledgeProofResponse[]>> {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id.replace('0x', '') !== FunctionSignatures.SumbitZKPResponseV2) {
      throw new Error(
        `submitZKPResponseV2 function doesn't implement requested method id. Only '0x${FunctionSignatures.SumbitZKPResponseV2}' is supported.`
      );
    }
    if (!this._opts?.didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    const provider = new JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    ethSigner = ethSigner.connect(provider);

    const txDataArgs = await this.prepareZKPResponseSubmitV2TxData(txData, zkProofResponses);
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
    return new Map<string, ZeroKnowledgeProofResponse[]>().set(txnHash, zkProofResponses);
  }

  public async prepareZKPResponseSubmitV2TxData(
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<JsonDocumentObjectValue[]> {
    if (txData.method_id.replace('0x', '') !== FunctionSignatures.SumbitZKPResponseV2) {
      throw new Error(
        `submit cross chain doesn't implement requested method id. Only '0x${FunctionSignatures.SumbitZKPResponseV2}' is supported.`
      );
    }
    if (!this._opts?.didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    const gistUpdateArr = [];
    const stateUpdateArr = [];
    const payload = [];
    // Resolved gists and states to avoid duplicate requests
    const gistUpdateResolutionsPending: string[] = [];
    const stateUpdateResolutionsPending: string[] = [];

    for (const zkProof of zkProofResponses) {
      const requestID = zkProof.id;
      const inputs = zkProof.pub_signals;

      if (!this._supportedCircuits.includes(zkProof.circuitId as CircuitId)) {
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

      const stateInfo = this.getOnChainGistRootStatePubSignals(
        zkProof.circuitId as
          | CircuitId.AtomicQueryMTPV2OnChain
          | CircuitId.AtomicQuerySigV2OnChain
          | CircuitId.AtomicQueryV3OnChain,
        zkProof.pub_signals
      );

      const gistUpdateResolutions = [];
      for (const gist of stateInfo.gists) {
        const gistResolutionPending = gistUpdateResolutionsPending.find(
          (g) => g == JSON.stringify(gist)
        );

        if (gistResolutionPending) {
          continue;
        }
        gistUpdateResolutionsPending.push(JSON.stringify(gist));

        gistUpdateResolutions.push(
          resolveDidDocumentEip712MessageAndSignature(
            DID.parseFromId(gist.id),
            this._opts.didResolverUrl,
            { gist: gist.root }
          )
        );
      }

      const stateUpdateResolutions = [];
      for (const state of stateInfo.states) {
        const stateResolutionPending = stateUpdateResolutionsPending.find(
          (s) => s == JSON.stringify(state)
        );

        if (stateResolutionPending) {
          continue;
        }
        stateUpdateResolutionsPending.push(JSON.stringify(state));

        stateUpdateResolutions.push(
          resolveDidDocumentEip712MessageAndSignature(
            DID.parseFromId(state.id),
            this._opts.didResolverUrl,
            { state: state.state }
          )
        );
      }

      if (gistUpdateResolutions.length > 0) {
        gistUpdateArr.push(...((await Promise.all(gistUpdateResolutions)) as GlobalStateUpdate[]));
      }
      if (stateUpdateResolutions.length > 0) {
        stateUpdateArr.push(
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

      const metadata = this.packMetadatas(metadataArr);
      payload.push({
        requestId: requestID,
        zkProof: zkProofEncoded,
        data: metadata
      });
    }

    const crossChainProofs = this.packCrossChainProofs(gistUpdateArr, stateUpdateArr);
    return [payload, crossChainProofs];
  }

  private packZkpProof(inputs: string[], a: string[], b: string[][], c: string[]): string {
    return this._abiCoder.encode(
      ['uint256[] inputs', 'uint256[2]', 'uint256[2][2]', 'uint256[2]'],
      [inputs, a, b, c]
    );
  }

  private packCrossChainProofs(
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
    return this._abiCoder.encode(
      ['tuple(' + 'string proofType,' + 'bytes proof' + ')[]'],
      [proofs]
    );
  }

  private packGlobalStateMsg(msg: GlobalStateUpdate): string {
    return this._abiCoder.encode(
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

  private packIdentityStateMsg(msg: IdentityStateUpdate): string {
    return this._abiCoder.encode(
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

  private packMetadatas(
    metas: {
      key: string;
      value: Uint8Array;
    }[]
  ): string {
    return this._abiCoder.encode(['tuple(' + 'string key,' + 'bytes value' + ')[]'], [metas]);
  }

  private getOnChainGistRootStatePubSignals(
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
}
