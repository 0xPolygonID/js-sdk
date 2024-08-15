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
  OnChainStateInfo
} from '../../circuits';
import { byteEncoder, resolveDidDocumentEip712MessageAndSignature } from '../../utils';
import { GlobalStateUpdate, IdentityStateUpdate } from '../entities/state';
import { poseidon } from '@iden3/js-crypto';

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
   * function submitZKPResponseCrossChain(
        uint64 requestId,
        bytes calldata zkProof, 
        bytes calldata crossChainProof,
        bytes calldata data
    ) public
   */
  public static readonly SupportedCrossChainMethodId = '1c100d01';

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
    const verifierContract = new Contract(txData.contract_address, abi, provider);
    ethSigner = ethSigner.connect(provider);
    const contract = verifierContract.connect(ethSigner) as Contract;

    const response = new Map<string, ZeroKnowledgeProofResponse>();
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

      const feeData = await provider.getFeeData();
      const maxFeePerGas = chainConfig.maxFeePerGas
        ? BigInt(chainConfig.maxFeePerGas)
        : feeData.maxFeePerGas;
      const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas
        ? BigInt(chainConfig.maxPriorityFeePerGas)
        : feeData.maxPriorityFeePerGas;

      const gasLimit = await contract.submitZKPResponse.estimateGas(...payload);
      const txData = await contract.submitZKPResponse.populateTransaction(...payload);

      const request: TransactionRequest = {
        to: txData.to,
        data: txData.data,
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas
      };

      const transactionService = new TransactionService(provider);
      const { txnHash } = await transactionService.sendTransactionRequest(ethSigner, request);
      response.set(txnHash, zkProof);
    }

    return response;
  }

  /**
   * {@inheritDoc IOnChainZKPVerifier.submitZKPResponseCrossChain}
   */
  public async submitZKPResponseCrossChain(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<string, ZeroKnowledgeProofResponse>> {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id.replace('0x', '') !== OnChainZKPVerifier.SupportedCrossChainMethodId) {
      throw new Error(
        `submit cross chain doesn't implement requested method id. Only '0x${OnChainZKPVerifier.SupportedCrossChainMethodId}' is supported.`
      );
    }
    if (!this._didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    const provider = new JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    const verifierContract = new Contract(txData.contract_address, abi, provider);
    ethSigner = ethSigner.connect(provider);
    const contract = verifierContract.connect(ethSigner) as Contract;

    const response = new Map<string, ZeroKnowledgeProofResponse>();
    for (const zkProof of zkProofResponses) {
      const requestID = zkProof.id;
      const inputs = zkProof.pub_signals;

      if (!this._supportedCircuits.includes(zkProof.circuitId as CircuitId)) {
        throw new Error(`Circuit ${zkProof.circuitId} not supported by OnChainZKPVerifier`);
      }
      const { gist, issuerState, nonRevState, issuerId, userId, operatorOutput } =
        this.getOnChainGistRootStatePubSignals(
          zkProof.circuitId as
            | CircuitId.AtomicQueryMTPV2OnChain
            | CircuitId.AtomicQuerySigV2OnChain
            | CircuitId.AtomicQueryV3OnChain,
          zkProof.pub_signals
        );

      const userDid = DID.parseFromId(userId);
      const issuerDid = DID.parseFromId(issuerId);

      const zkProofEncoded = this.packZkpProof(
        inputs,
        zkProof.proof.pi_a.slice(0, 2),
        [
          [zkProof.proof.pi_b[0][1], zkProof.proof.pi_b[0][0]],
          [zkProof.proof.pi_b[1][1], zkProof.proof.pi_b[1][0]]
        ],
        zkProof.proof.pi_c.slice(0, 2)
      );

      const globalStateUpdate = (await resolveDidDocumentEip712MessageAndSignature(
        userDid,
        this._didResolverUrl,
        { gist }
      )) as GlobalStateUpdate;

      const issuerStateResolution = (await resolveDidDocumentEip712MessageAndSignature(
        issuerDid,
        this._didResolverUrl,
        { state: issuerState }
      )) as IdentityStateUpdate;

      const issuerNonRevResolution = (await resolveDidDocumentEip712MessageAndSignature(
        issuerDid,
        this._didResolverUrl,
        { state: nonRevState }
      )) as IdentityStateUpdate;

      const crossChainProofs = this.packCrossChainProofs(
        globalStateUpdate,
        issuerStateResolution,
        issuerNonRevResolution
      );

      let metadataArr: { key: string; value: string }[] = [];
      if (operatorOutput && operatorOutput !== 0n) {
        const metadataValue = poseidon.hash([operatorOutput]);
        metadataArr = [
          {
            key: 'operator output',
            value: `0x${metadataValue.toString(16)}` // TODO: fix
          }
        ];
      }

      const metadata = this.packMetadatas(metadataArr);
      const payload = [requestID, zkProofEncoded, crossChainProofs, metadata];

      const feeData = await provider.getFeeData();
      const maxFeePerGas = chainConfig.maxFeePerGas
        ? BigInt(chainConfig.maxFeePerGas)
        : feeData.maxFeePerGas;
      const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas
        ? BigInt(chainConfig.maxPriorityFeePerGas)
        : feeData.maxPriorityFeePerGas;

      const gasLimit = await contract.submitZKPResponseCrossChain.estimateGas(...payload);
      const txData = await contract.submitZKPResponseCrossChain.populateTransaction(...payload);

      const request: TransactionRequest = {
        to: txData.to,
        data: txData.data,
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas
      };

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
    globalStateUpdate: GlobalStateUpdate,
    issuerStateResolution: IdentityStateUpdate,
    issuerNonRevResolution: IdentityStateUpdate
  ) {
    const proofs = [
      {
        proofType: 'globalStateProof',
        proof: this.packGlobalStateMsg(globalStateUpdate)
      },
      {
        proofType: 'stateProof',
        proof: this.packIdentityStateMsg(issuerStateResolution)
      },
      {
        proofType: 'stateProof',
        proof: this.packIdentityStateMsg(issuerNonRevResolution)
      }
    ];
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
          'address from,' +
          'uint256 timestamp,' +
          'uint256 root,' +
          'uint256 replacedByRoot,' +
          'uint256 createdAtTimestamp,' +
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
          'address from,' +
          'uint256 timestamp,' +
          'uint256 identity,' +
          'uint256 state,' +
          'uint256 replacedByState,' +
          'uint256 createdAtTimestamp,' +
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
      value: string;
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
  ): OnChainStateInfo {
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
    return atomicQueryPubSignals.getGistRootStatePugSignals();
  }
}
