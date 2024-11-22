import { CircuitId } from '../../circuits/models';
import { IProofService } from '../../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { BasicMessage, IPackageManager, ZeroKnowledgeProofResponse } from '../types';
import { ContractInvokeRequest, ContractInvokeResponse } from '../types/protocol/contract-request';
import { DID, ChainIds } from '@iden3/js-iden3-core';
import { FunctionSignatures, IOnChainZKPVerifier } from '../../storage';
import { Signer } from 'ethers';
import { processZeroKnowledgeProofRequests, verifyExpiresTime } from './common';
import { AbstractMessageHandler, IProtocolMessageHandler } from './message-handler';

/**
 * Interface that allows the processing of the contract request
 *
 * @beta
 * @interface IContractRequestHandler
 */
export interface IContractRequestHandler {
  /**
   * unpacks contract invoke request
   * @beta
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<ContractInvokeRequest>`
   */
  parseContractInvokeRequest(request: Uint8Array): Promise<ContractInvokeRequest>;

  /**
   * handle contract invoke request
   * @beta
   * @param {did} did  - sender DID
   * @param {Uint8Array} request - raw byte message
   * @param {ContractInvokeHandlerOptions} opts - handler options
   * @returns {Map<string, ZeroKnowledgeProofResponse>}` -  map of transaction hash - ZeroKnowledgeProofResponse
   */
  handleContractInvokeRequest(
    did: DID,
    request: Uint8Array,
    opts?: ContractInvokeHandlerOptions
  ): Promise<Map<string, ZeroKnowledgeProofResponse>>;
}

/** ContractInvokeHandlerOptions represents contract invoke handler options */
export type ContractInvokeHandlerOptions = {
  ethSigner: Signer;
  challenge?: bigint;
  allowExpiredMessages?: boolean;
};

export type ContractMessageHandlerOptions = {
  senderDid: DID;
  ethSigner: Signer;
  challenge?: bigint;
};

/**
 *
 * Allows to process ContractInvokeRequest protocol message
 *
 * @beta

 * @class ContractRequestHandler
 * @implements implements IContractRequestHandler interface
 */
export class ContractRequestHandler
  extends AbstractMessageHandler
  implements IContractRequestHandler, IProtocolMessageHandler
{
  private readonly _supportedCircuits = [
    CircuitId.AtomicQueryMTPV2OnChain,
    CircuitId.AtomicQuerySigV2OnChain,
    CircuitId.AtomicQueryV3OnChain
  ];

  /**
   * Creates an instance of ContractRequestHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IProofService} _proofService -  proof service to verify zk proofs
   * @param {IOnChainZKPVerifier} _zkpVerifier - zkp verifier to submit response
   *
   */

  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _proofService: IProofService,
    private readonly _zkpVerifier: IOnChainZKPVerifier
  ) {
    super();
  }

  async handle(
    message: BasicMessage,
    ctx: ContractMessageHandlerOptions
  ): Promise<BasicMessage | null> {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE: {
        const ciMessage = message as ContractInvokeRequest;
        const txHashResponsesMap = await this.handleContractInvoke(ciMessage, ctx);
        return this.createContractInvokeResponse(ciMessage, txHashResponsesMap);
      }
      default:
        return super.handle(message, ctx);
    }
  }

  private async handleContractInvoke(
    message: ContractInvokeRequest,
    ctx: ContractMessageHandlerOptions
  ): Promise<Map<string, ZeroKnowledgeProofResponse[]>> {
    if (message.type !== PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid message type for contract invoke request');
    }

    const { senderDid: did, ethSigner, challenge } = ctx;
    if (!ctx.ethSigner) {
      throw new Error("Can't sign transaction. Provide Signer in options.");
    }

    const { chain_id } = message.body.transaction_data;
    const networkFlag = Object.keys(ChainIds).find((key) => ChainIds[key] === chain_id);

    if (!networkFlag) {
      throw new Error(`Invalid chain id ${chain_id}`);
    }
    const verifierDid = message.from ? DID.parse(message.from) : undefined;
    const zkpResponses = await processZeroKnowledgeProofRequests(
      did,
      message?.body?.scope,
      verifierDid,
      this._proofService,
      { ethSigner, challenge, supportedCircuits: this._supportedCircuits }
    );

    const methodId = message.body.transaction_data.method_id.replace('0x', '');
    switch (methodId) {
      case FunctionSignatures.SubmitZKPResponseV2:
        return this._zkpVerifier.submitZKPResponseV2(
          ethSigner,
          message.body.transaction_data,
          zkpResponses
        );
      case FunctionSignatures.SubmitZKPResponseV1: {
        const txHashZkpResponseMap = await this._zkpVerifier.submitZKPResponse(
          ethSigner,
          message.body.transaction_data,
          zkpResponses
        );
        const response = new Map<string, ZeroKnowledgeProofResponse[]>();
        for (const [txHash, zkpResponse] of txHashZkpResponseMap) {
          response.set(txHash, [zkpResponse]);
        }
        return response;
      }
      default:
        throw new Error(
          `Not supported method id. Only '${FunctionSignatures.SubmitZKPResponseV1} and ${FunctionSignatures.SubmitZKPResponseV2} are supported.'`
        );
    }
  }

  /**
   * unpacks contract-invoke request
   * @beta
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<ContractInvokeRequest>`
   */
  async parseContractInvokeRequest(request: Uint8Array): Promise<ContractInvokeRequest> {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const ciRequest = message as unknown as ContractInvokeRequest;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    ciRequest.body.scope = ciRequest.body.scope || [];
    return ciRequest;
  }

  /**
   * creates contract invoke response
   * @private
   * @beta
   * @param {ContractInvokeRequest} request - ContractInvokeRequest
   * @param { Map<string, ZeroKnowledgeProofResponse[]>} responses - map tx hash to array of ZeroKnowledgeProofResponses
   * @returns `Promise<ContractInvokeResponse>`
   */
  private async createContractInvokeResponse(
    request: ContractInvokeRequest,
    txHashToZkpResponseMap: Map<string, ZeroKnowledgeProofResponse[]>
  ): Promise<ContractInvokeResponse> {
    const contractInvokeResponse: ContractInvokeResponse = {
      id: request.id,
      thid: request.thid,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_RESPONSE_MESSAGE_TYPE,
      from: request.to,
      to: request.from,
      body: {
        transaction_data: request.body.transaction_data,
        scope: []
      },
      created_time: Math.floor(Date.now() / 1000)
    };
    for (const [txHash, zkpResponses] of txHashToZkpResponseMap) {
      for (const zkpResponse of zkpResponses) {
        contractInvokeResponse.body.scope.push({
          txHash,
          ...zkpResponse
        });
      }
    }
    return contractInvokeResponse;
  }

  /**
   * handle contract invoke request
   * supports only 0xb68967e2 method id
   * @beta
   * @deprecated
   * @param {did} did  - sender DID
   * @param {ContractInvokeRequest} request  - contract invoke request
   * @param {ContractInvokeHandlerOptions} opts - handler options
   * @returns {Map<string, ZeroKnowledgeProofResponse>}` - map of transaction hash - ZeroKnowledgeProofResponse
   */
  async handleContractInvokeRequest(
    did: DID,
    request: Uint8Array,
    opts: ContractInvokeHandlerOptions
  ): Promise<Map<string, ZeroKnowledgeProofResponse>> {
    const ciRequest = await this.parseContractInvokeRequest(request);
    if (!opts.allowExpiredMessages) {
      verifyExpiresTime(ciRequest);
    }
    if (ciRequest.body.transaction_data.method_id !== FunctionSignatures.SubmitZKPResponseV1) {
      throw new Error(`please use handle method to work with other method ids`);
    }

    if (ciRequest.type !== PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid message type for contract invoke request');
    }

    const { ethSigner, challenge } = opts;
    if (!ethSigner) {
      throw new Error("Can't sign transaction. Provide Signer in options.");
    }

    const { chain_id } = ciRequest.body.transaction_data;
    const networkFlag = Object.keys(ChainIds).find((key) => ChainIds[key] === chain_id);

    if (!networkFlag) {
      throw new Error(`Invalid chain id ${chain_id}`);
    }
    const verifierDid = ciRequest.from ? DID.parse(ciRequest.from) : undefined;
    const zkpResponses = await processZeroKnowledgeProofRequests(
      did,
      ciRequest?.body?.scope,
      verifierDid,
      this._proofService,
      { ethSigner, challenge, supportedCircuits: this._supportedCircuits }
    );
    return this._zkpVerifier.submitZKPResponse(
      ethSigner,
      ciRequest.body.transaction_data,
      zkpResponses
    );
  }
}
