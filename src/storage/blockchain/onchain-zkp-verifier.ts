import { JsonRpcProvider, Signer, Contract, TransactionRequest, ethers } from 'ethers';
import { EthConnectionConfig } from './state';
import { IOnChainZKPVerifier } from '../interfaces/onchain-zkp-verifier';
import { ContractInvokeTransactionData, ZeroKnowledgeProofResponse } from '../../iden3comm';
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

// Cache for resolved gists and states
const gistCache = new Map<string, GlobalStateUpdate>();
const stateCache = new Map<string, IdentityStateUpdate>();

/**
 * OnChainZKPVerifier is a class that allows to interact with the OnChainZKPVerifier contract
 * and submitZKPResponse.
 *
 * @beta
 * @class OnChainZKPVerifier
 */
export class OnChainZKPVerifier implements IOnChainZKPVerifier {
  /**
   * solidity identifier for function signature:
   * function submitZKPResponse(uint64 requestId, uint256[] calldata inputs,
   * uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c) public
   */
  public static readonly SupportedMethodId = 'b68967e2';

  /**
   * solidity identifier for function signature:
   * struct ZKPResponse {
        uint64 requestId;
        bytes zkProof;
        bytes data;
    }
   * function submitZKPResponseV2(
        ZKPResponse[] memory responses,
        bytes memory crossChainProof
    ) public
   */
  //function submitZKPResponseV2(tuple[](uint64 requestId,bytes zkProof,bytes data),bytes crossChainProof)
  public static readonly SupportedMethodIdV2 = 'ade09fcd';

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
    private readonly _didResolverUrl?: string
  ) {}

  /**
   * {@inheritDoc IOnChainZKPVerifier.prepareZKPResponseTxData}
   */
  public async prepareZKPResponseTxData(
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<number, string>> {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id.replace('0x', '') !== OnChainZKPVerifier.SupportedMethodId) {
      throw new Error(
        `submit doesn't implement requested method id. Only '0x${OnChainZKPVerifier.SupportedMethodId}' is supported.`
      );
    }
    const verifierContract = new Contract(txData.contract_address, abi);
    const response = new Map<number, string>();
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

      const txData = await verifierContract.submitZKPResponse.populateTransaction(...payload);
      response.set(requestID, txData.data);
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
    if (txData.method_id.replace('0x', '') !== OnChainZKPVerifier.SupportedMethodId) {
      throw new Error(
        `submit doesn't implement requested method id. Only '0x${OnChainZKPVerifier.SupportedMethodId}' is supported.`
      );
    }
    const provider = new JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    ethSigner = ethSigner.connect(provider);

    const txDataMap = await this.prepareZKPResponseTxData(txData, zkProofResponses);
    const response = new Map<string, ZeroKnowledgeProofResponse>();

    const feeData = await provider.getFeeData();
    const maxFeePerGas = chainConfig.maxFeePerGas
      ? BigInt(chainConfig.maxFeePerGas)
      : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas
      ? BigInt(chainConfig.maxPriorityFeePerGas)
      : feeData.maxPriorityFeePerGas;

    for (const zkProof of zkProofResponses) {
      const payload = txDataMap.get(zkProof.id);

      const request: TransactionRequest = {
        to: txData.contract_address,
        data: payload,
        maxFeePerGas,
        maxPriorityFeePerGas
      };

      const gasLimit = await ethSigner.estimateGas(request);
      request.gasLimit = gasLimit;

      const transactionService = new TransactionService(provider);
      const { txnHash } = await transactionService.sendTransactionRequest(ethSigner, request);
      response.set(txnHash, zkProof);
    }

    return response;
  }

  /**
   * {@inheritDoc IOnChainZKPVerifier.prepareZKPResponseV2TxData}
   */
  public async prepareZKPResponseV2TxData(
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<number, string>> {
    if (txData.method_id.replace('0x', '') !== OnChainZKPVerifier.SupportedMethodIdV2) {
      throw new Error(
        `submit cross chain doesn't implement requested method id. Only '0x${OnChainZKPVerifier.SupportedMethodIdV2}' is supported.`
      );
    }
    if (!this._didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    const verifierContract = new Contract(txData.contract_address, abi);

    const response = new Map<number, string>();
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
        gistUpdateResolutions.push(
          resolveDidDocumentEip712MessageAndSignature(
            DID.parseFromId(gist.id),
            this._didResolverUrl,
            { gist: gist.root }
          )
        );
      }

      const stateUpdateResolutions = [];
      for (const state of stateInfo.states) {
        stateUpdateResolutions.push(
          resolveDidDocumentEip712MessageAndSignature(
            DID.parseFromId(state.id),
            this._didResolverUrl,
            { state: state.state }
          )
        );
      }

      const gistUpdateArr = (await Promise.all(gistUpdateResolutions)) as GlobalStateUpdate[];
      const stateUpdateArr = (await Promise.all(stateUpdateResolutions)) as IdentityStateUpdate[];

      const crossChainProofs = this.packCrossChainProofs(gistUpdateArr, stateUpdateArr);

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
      const payload = [
        {
          requestId: requestID,
          zkProof: zkProofEncoded,
          data: metadata
        }
      ];

      const txData = await verifierContract.submitZKPResponseV2.populateTransaction(
        payload,
        crossChainProofs
      );

      response.set(requestID, txData.data);
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
  ): Promise<Map<string, ZeroKnowledgeProofResponse>> {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id.replace('0x', '') !== OnChainZKPVerifier.SupportedMethodIdV2) {
      throw new Error(
        `submit cross chain doesn't implement requested method id. Only '0x${OnChainZKPVerifier.SupportedMethodIdV2}' is supported.`
      );
    }
    if (!this._didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    const provider = new JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    ethSigner = ethSigner.connect(provider);

    const txDataMap = await this.prepareZKPResponseV2TxData(txData, zkProofResponses);
    const feeData = await provider.getFeeData();
    const maxFeePerGas = chainConfig.maxFeePerGas
      ? BigInt(chainConfig.maxFeePerGas)
      : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas
      ? BigInt(chainConfig.maxPriorityFeePerGas)
      : feeData.maxPriorityFeePerGas;

    const response = new Map<string, ZeroKnowledgeProofResponse>();
    for (const zkProof of zkProofResponses) {
      const payload = txDataMap.get(zkProof.id);
      const request: TransactionRequest = {
        to: txData.contract_address,
        data: payload,
        maxFeePerGas,
        maxPriorityFeePerGas
      };

      const gasLimit = await ethSigner.estimateGas(request);
      request.gasLimit = gasLimit;

      const transactionService = new TransactionService(provider);
      const { txnHash } = await transactionService.sendTransactionRequest(ethSigner, request);
      response.set(txnHash, zkProof);
    }

    return response;
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
