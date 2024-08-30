import { CircuitId } from '../../circuits/models';
import { IProofService } from '../../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { BasicMessage, IPackageManager, ZeroKnowledgeProofResponse } from '../types';
import { ContractInvokeRequest } from '../types/protocol/contract-request';
import { DID, ChainIds } from '@iden3/js-iden3-core';
import { IOnChainZKPVerifier, OnChainZKPVerifier } from '../../storage';
import { Signer } from 'ethers';
import { processZeroKnowledgeProofRequests } from './common';
import { AbstractMessageHandler, IProtocolMessageHandler } from './message-handler';

/**
 * Interface that allows the processing of the contract request
 *
 * @beta
 * @interface IContractRequestHandler
 */
export interface IContractRequestHandler {
  /**
   * unpacks contract invoker request
   * @beta
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<ContractInvokeRequest>`
   */
  parseContractInvokeRequest(request: Uint8Array): Promise<ContractInvokeRequest>;

  /**
   * handle contract invoker request
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
  ): Promise<Map<string, ZeroKnowledgeProofResponse> | string>;
}

/** ContractInvokeHandlerOptions represents contract invoke handler options */
export type ContractInvokeHandlerOptions = {
  ethSigner: Signer;
  challenge?: bigint;
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
      case PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE:
        await this.handleContractInvoke(message as ContractInvokeRequest, ctx);
        return null;
      default:
        return super.handle(message, ctx);
    }
  }

  private async handleContractInvoke(
    message: ContractInvokeRequest,
    ctx: ContractMessageHandlerOptions
  ): Promise<Map<string, ZeroKnowledgeProofResponse> | string> {
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
      case OnChainZKPVerifier.SupportedMethodIdV2:
        return this._zkpVerifier.submitZKPResponseV2(
          ethSigner,
          message.body.transaction_data,
          zkpResponses
        );
      case OnChainZKPVerifier.SupportedMethodId:
        return this._zkpVerifier.submitZKPResponse(
          ethSigner,
          message.body.transaction_data,
          zkpResponses
        );
      default:
        throw new Error(
          `Not supported method id. Only '${OnChainZKPVerifier.SupportedMethodIdV2} and ${OnChainZKPVerifier.SupportedMethodId} are supported.'`
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
   * handle contract invoker request
   * @beta
   * @param {did} did  - sender DID
   * @param {ContractInvokeRequest} request  - contract invoke request
   * @param {ContractInvokeHandlerOptions} opts - handler options
   * @returns {Map<string, ZeroKnowledgeProofResponse>}` - map of transaction hash - ZeroKnowledgeProofResponse
   */
  async handleContractInvokeRequest(
    did: DID,
    request: Uint8Array,
    opts: ContractInvokeHandlerOptions
  ): Promise<Map<string, ZeroKnowledgeProofResponse> | string> {
    const ciRequest = await this.parseContractInvokeRequest(request);

    return this.handleContractInvoke(ciRequest, {
      senderDid: did,
      ethSigner: opts.ethSigner,
      challenge: opts.challenge
    });
  }

  /**
   * prepare contract invoker request transaction data
   * @beta
   * @param {did} did  - sender DID
   * @param {ContractInvokeRequest} request  - contract invoke request
   * @param {ContractInvokeHandlerOptions} opts - handler options
   * @returns {Map<string, ZeroKnowledgeProofResponse>}` - map of transaction hash - ZeroKnowledgeProofResponse
   */
  async prepareContractInvokeRequestTxData(
    did: DID,
    request: Uint8Array,
    opts?: {
      challenge?: bigint;
    }
  ): Promise<Map<number, string> | string> {
    const message = await this.parseContractInvokeRequest(request);

    if (message.type !== PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid message type for contract invoke request');
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
      { challenge: opts?.challenge, supportedCircuits: this._supportedCircuits }
    );

    const methodId = message.body.transaction_data.method_id.replace('0x', '');
    switch (methodId) {
      case OnChainZKPVerifier.SupportedMethodIdV2:
        return this._zkpVerifier.prepareZKPResponseV2TxData(
          message.body.transaction_data,
          zkpResponses
        );
      case OnChainZKPVerifier.SupportedMethodId:
        return this._zkpVerifier.prepareZKPResponseTxData(
          message.body.transaction_data,
          zkpResponses
        );
      default:
        throw new Error(
          `Not supported method id. Only '${OnChainZKPVerifier.SupportedMethodIdV2} and ${OnChainZKPVerifier.SupportedMethodId} are supported.'`
        );
    }
  }
}
