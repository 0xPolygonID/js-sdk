import { JsonRpcProvider, Signer, Contract, TransactionRequest, ethers } from 'ethers';
import { EthConnectionConfig } from './state';
import { IOnChainZKPVerifier } from '../interfaces/onchain-zkp-verifier';
import {
  AuthMethod,
  AuthProof,
  AuthProofEthIdentity,
  AuthProofZKP,
  ContractInvokeTransactionData,
  CrossChainProof,
  JsonDocumentObjectValue,
  processProofResponse,
  ZeroKnowledgeInvokeResponse,
  ZeroKnowledgeProofResponse
} from '../../iden3comm';
import abi from './abi/ZkpVerifier.json';
//import { UniversalVerifier } from '@iden3/universal-verifier-v2-abi';
import { IVerifierABI } from '@iden3/universal-verifier-v2-abi';
import { TransactionService } from '../../blockchain';
import { BytesHelper, chainIDfromDID, DID, Id } from '@iden3/js-iden3-core';
import {
  AtomicQueryMTPV2OnChainPubSignals,
  AtomicQuerySigV2OnChainPubSignals,
  AtomicQueryV3OnChainPubSignals,
  AuthV2PubSignals,
  CircuitId,
  StatesInfo
} from '../../circuits';
import { byteEncoder, bytesToHex, DIDDocumentSignature, resolveDidDocument } from '../../utils';
import { GlobalStateUpdate, IdentityStateUpdate } from '../entities/state';
import { Hash } from '@iden3/js-merkletree';
import { packZkpProof, prepareZkpProof } from './common';

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
type ProofPreparationResult = {
  requestId: string | number;
  proof: ZeroKnowledgeProofResponse;
  encoded: string;
  metadata: string;
};
export type TxPreparationResultSubmitResponse = {
  authProof: { raw: AuthProof; encoded: string };
  crossChainProof: { raw: CrossChainProof; encoded: string };
  proofs: ProofPreparationResult[];
};

export const toTxDataArgs = function (res: TxPreparationResultSubmitResponse) {
  return [
    {
      authMethod: res.authProof.raw.authMethod,
      proof: res.authProof.encoded
    },
    res.proofs.map((p) => {
      return {
        requestId: p.requestId,
        proof: p.encoded,
        metadata: p.metadata
      };
    }),
    res.crossChainProof.encoded
  ];
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

    const preparedZkpProof = prepareZkpProof(zkProofResponse.proof);
    const payload = [requestID, inputs, preparedZkpProof.a, preparedZkpProof.b, preparedZkpProof.c];

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
  ): Promise<Map<string, ZeroKnowledgeProofResponse[]>> {
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

    return new Map<string, ZeroKnowledgeProofResponse[]>().set(txnHash, zkProofResponses);
  }

  /**
   * {@inheritDoc IOnChainVerifierMultiQuery.submitResponse}
   */
  public async submitResponse(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    responses: ZeroKnowledgeProofResponse[],
    authProof: AuthProof
  ): Promise<{ txHash: string; responsesMap: Map<string, ZeroKnowledgeInvokeResponse> }> {
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

    const txPreparationResult = await this.prepareTxArgsSubmit(txData, responses, authProof);

    const feeData = await provider.getFeeData();
    const maxFeePerGas = chainConfig.maxFeePerGas
      ? BigInt(chainConfig.maxFeePerGas)
      : feeData.maxFeePerGas;
    const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas
      ? BigInt(chainConfig.maxPriorityFeePerGas)
      : feeData.maxPriorityFeePerGas;

    const verifierContract = new Contract(txData.contract_address, IVerifierABI);
    const txRequestData = await verifierContract.submitResponse.populateTransaction(
      ...txPreparationResult.txDataArgs
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

    // return multiple responses for all the responses (single and grouped)
    return {
      txHash: txnHash,
      responsesMap: new Map<string, ZeroKnowledgeInvokeResponse>().set(txnHash, {
        authProof: txPreparationResult.result.authProof.raw,
        crossChainProof: txPreparationResult.result.crossChainProof.raw,
        responses: txPreparationResult.result.proofs.map((m) => m.proof)
      })
    };
  }

  public static async prepareTxArgsSubmit(
    resolverUrl: string,
    txData: ContractInvokeTransactionData,
    responses: ZeroKnowledgeProofResponse[],
    authProof: AuthProof
  ): Promise<{ result: TxPreparationResultSubmitResponse; txDataArgs: JsonDocumentObjectValue[] }> {
    if (txData.method_id.replace('0x', '') !== FunctionSignatures.SubmitResponse) {
      throw new Error(
        `submit cross chain doesn't implement requested method id. Only '0x${FunctionSignatures.SubmitResponse}' is supported.`
      );
    }
    const gistUpdatesArr: GlobalStateUpdate[] = [];
    const stateUpdatesArr: IdentityStateUpdate[] = [];
    const payloadResponses = [];
    const emptyBytes = '0x';

    let encodedAuthProof = '';

    switch (authProof.authMethod) {
      case AuthMethod.AUTHV2: {
        const preparedZkpProof = prepareZkpProof((authProof as AuthProofZKP).zkp.proof);
        encodedAuthProof = packZkpProof(
          (authProof as AuthProofZKP).zkp.pub_signals,
          preparedZkpProof.a,
          preparedZkpProof.b,
          preparedZkpProof.c
        );
        break;
      }
      case AuthMethod.ETH_IDENTITY: {
        encodedAuthProof = packEthIdentityProof((authProof as AuthProofEthIdentity).userDid);
        break;
      }
      default:
        throw new Error('auth proof must use method AuthV2 or ethIdentity');
    }

    // Process all the responses
    for (const zkProof of responses) {
      this.checkSupportedCircuit(zkProof.circuitId as CircuitId);
      const { requestId, zkProofEncoded, metadata } = processProofResponse(zkProof);

      payloadResponses.push({
        proof: zkProof,
        requestId: requestId,
        encoded: zkProofEncoded,
        metadata: metadata
      });
    }

    // Process all zkProofs and prepare cross chain proofs
    const allZkProofs = responses.map((zkProof) => ({
      circuitId: zkProof.circuitId as OnChainZKPVerifierCircuitId,
      pub_signals: zkProof.pub_signals
    }));

    if (authProof.authMethod == AuthMethod.AUTHV2) {
      allZkProofs.push({
        circuitId: (authProof as AuthProofZKP).zkp.circuitId as OnChainZKPVerifierCircuitId,
        pub_signals: (authProof as AuthProofZKP).zkp.pub_signals
      });
    }

    for (const zkProof of allZkProofs) {
      const { gistUpdateResolutions, stateUpdateResolutions } = this.getUpdateResolutions(
        resolverUrl,
        txData.chain_id,
        zkProof.circuitId,
        zkProof.pub_signals
      );

      if (gistUpdateResolutions.length > 0) {
        gistUpdatesArr.push(...((await Promise.all(gistUpdateResolutions)) as GlobalStateUpdate[]));
      }
      if (stateUpdateResolutions.length > 0) {
        stateUpdatesArr.push(
          ...((await Promise.all(stateUpdateResolutions)) as IdentityStateUpdate[])
        );
      }
    }

    const encodedCrossChainProof =
      gistUpdatesArr.length || stateUpdatesArr.length
        ? this.packCrossChainProofs(gistUpdatesArr, stateUpdatesArr)
        : emptyBytes;

    const preparationResult = {
      authProof: { raw: authProof, encoded: encodedAuthProof },
      proofs: payloadResponses,
      crossChainProof: {
        raw: {
          globalStateProofs: gistUpdatesArr || [],
          identityStateProofs: stateUpdatesArr || []
        },
        encoded: encodedCrossChainProof
      }
    };
    return { result: preparationResult, txDataArgs: toTxDataArgs(preparationResult) };
  }

  public async prepareTxArgsSubmit(
    txData: ContractInvokeTransactionData,
    responses: ZeroKnowledgeProofResponse[],
    authProof: AuthProof
  ): Promise<{ result: TxPreparationResultSubmitResponse; txDataArgs: JsonDocumentObjectValue[] }> {
    if (!this._opts?.didResolverUrl) {
      throw new Error(`did resolver url required for crosschain verification`);
    }
    return OnChainZKPVerifier.prepareTxArgsSubmit(
      this._opts.didResolverUrl,
      txData,
      responses,
      authProof
    );
  }

  private static checkSupportedCircuit(circuitId: CircuitId) {
    if (!this._supportedCircuits.includes(circuitId as OnChainZKPVerifierCircuitId)) {
      throw new Error(`Circuit ${circuitId} not supported by OnChainZKPVerifier`);
    }
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

    const gistUpdatesArr = [];
    const stateUpdatesArr = [];
    const payloadResponses = [];
    const emptyBytes = '0x';

    for (const zkProof of zkProofResponses) {
      this.checkSupportedCircuit(zkProof.circuitId as CircuitId);
      const { requestId, zkProofEncoded, metadata } = processProofResponse(zkProof);

      payloadResponses.push({
        requestId: requestId,
        zkProof: zkProofEncoded,
        data: metadata
      });

      const { gistUpdateResolutions, stateUpdateResolutions } = this.getUpdateResolutions(
        resolverUrl,
        txData.chain_id,
        zkProof.circuitId as OnChainZKPVerifierCircuitId,
        zkProof.pub_signals
      );

      if (gistUpdateResolutions.length > 0) {
        gistUpdatesArr.push(...((await Promise.all(gistUpdateResolutions)) as GlobalStateUpdate[]));
      }
      if (stateUpdateResolutions.length > 0) {
        stateUpdatesArr.push(
          ...((await Promise.all(stateUpdateResolutions)) as IdentityStateUpdate[])
        );
      }
    }

    const crossChainProofEncoded =
      gistUpdatesArr.length || stateUpdatesArr.length
        ? this.packCrossChainProofs(gistUpdatesArr, stateUpdatesArr)
        : emptyBytes;
    return [payloadResponses, crossChainProofEncoded];
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

  private static getUpdateResolutions(
    resolverUrl: string,
    chainId: number,
    proofCircuitId: OnChainZKPVerifierCircuitId,
    inputs: string[]
  ) {
    const stateInfo = this.getOnChainGistRootStatePubSignals(proofCircuitId, inputs);

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

    return { gistUpdateResolutions, stateUpdateResolutions };
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

/**
 * Packs an Ethereum identity proof from a Decentralized Identifier (DID).
 * @param did - Decentralized Identifier (DID) to pack.
 * @returns A hexadecimal string representing the packed DID identity proof.
 */
export const packEthIdentityProof = (did: DID): string => {
  return `0x${bytesToHex(BytesHelper.intToBytes(DID.idFromDID(did).bigInt()))}`;
};
