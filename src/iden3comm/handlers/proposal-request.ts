import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { MediaType } from '../constants';
import { IPackageManager, JSONObject, JWSPackerParams } from '../types';

import { DID } from '@iden3/js-iden3-core';
import * as uuid from 'uuid';
import { proving } from '@iden3/js-jwz';
import {
  Proposal,
  ProposalRequestCredential,
  ProposalRequestMessage,
  ProposalResponseMessage
} from '../types/protocol/proposal-request';

/** @beta ProposalRequestCreationOptions represents proposal-request creation options */
export type ProposalRequestCreationOptions = {
  credentials?: ProposalRequestCredential[];
  metadata?: { type: string; did_doc?: JSONObject };
  did_doc?: JSONObject;
};

/**
 * @beta
 * createProposalRequest is a function to create protocol proposal-request protocol message
 * @param {string} sender - sender did
 * @param {string} receiver - receiver did
 * @param {ProposalRequestCreationOptions} opts - creation options
 * @returns `Promise<ProposalRequestMessage>`
 */
export function createProposalRequest(
  sender: string,
  receiver: string,
  opts?: ProposalRequestCreationOptions
): ProposalRequestMessage {
  const uuidv4 = uuid.v4();
  const request: ProposalRequestMessage = {
    id: uuidv4,
    thid: uuidv4,
    from: sender,
    to: receiver,
    typ: MediaType.PlainMessage,
    type: PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE,
    body: {
      credentials: opts?.credentials,
      metadata: opts?.metadata,
      did_doc: opts?.did_doc
    }
  };
  return request;
}

/**
 * @beta
 * createProposal is a function to create protocol proposal protocol message
 * @param {string} sender - sender did
 * @param {string} receiver - receiver did
 * @param {Proposal[]} proposals - proposals
 * @returns `Promise<ProposalRequestMessage>`
 */
export function createProposal(
  sender: string,
  receiver: string,
  proposals?: Proposal[]
): ProposalResponseMessage {
  const uuidv4 = uuid.v4();
  const request: ProposalResponseMessage = {
    id: uuidv4,
    thid: uuidv4,
    from: sender,
    to: receiver,
    typ: MediaType.PlainMessage,
    type: PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE,
    body: {
      proposals: proposals || []
    }
  };
  return request;
}

/**
 * @beta
 * Interface that allows the processing of the proposal-request
 *
 * @interface IProposalRequestHandler
 */
export interface IProposalRequestHandler {
  /**
   * @beta
   * unpacks proposal-request
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<ProposalRequestMessage>`
   */
  parseProposalRequest(request: Uint8Array): Promise<ProposalRequestMessage>;

  /**
   *  @beta
   * handle proposal-request
   * @param {Uint8Array} request - raw byte message
   * @param {Uint8Array} response - could be offer/proposal or any other protocol message
   * @param {ProposalRequestHandlerOptions} opts - handler options
   * @returns {Promise<Uint8Array>}` - proposal response message
   */
  handleProposalRequest(
    request: Uint8Array,
    response: Uint8Array,
    opts?: ProposalRequestHandlerOptions
  ): Promise<Uint8Array>;

  /**
     * @beta
     * handle proposal response
     * @param {AuthorizationResponseMessage} response  - auth response
     * @param {AuthorizationRequestMessage} request  - auth request
     * @param {AuthResponseHandlerOptions} opts - options
     * @returns `Promise<{
      request: AuthorizationRequestMessage;
      response: AuthorizationResponseMessage;
    }>`
     */
  handleProposalResponse(
    response: ProposalResponseMessage,
    request: ProposalRequestMessage
  ): Promise<{
    request: ProposalRequestMessage;
    response: ProposalResponseMessage;
  }>;
}

/** @beta ProposalRequestHandlerOptions represents proposal-request handler options */
export type ProposalRequestHandlerOptions = {
  mediaType: MediaType;
  packerOptions?: JWSPackerParams;
};

/**
 *
 * Allows to process ProposalRequest protocol message
 * @beta
 * @class ProposalRequestHandler
 * @implements implements IProposalRequestHandler interface
 */
export class ProposalRequestHandler implements IProposalRequestHandler {
  /**
   * @beta Creates an instance of ProposalRequestHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   *
   */

  constructor(private readonly _packerMgr: IPackageManager) {}

  /**
   * @inheritdoc IProposalRequestHandler#parseProposalRequest
   */
  async parseProposalRequest(request: Uint8Array): Promise<ProposalRequestMessage> {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const proposalRequest = message as unknown as ProposalRequestMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    return proposalRequest;
  }

  /**
   * @inheritdoc IProposalRequestHandler#handleProposalRequest
   */
  async handleProposalRequest(
    request: Uint8Array,
    response: Uint8Array,
    opts?: ProposalRequestHandlerOptions
  ): Promise<Uint8Array> {
    if (!opts) {
      opts = {
        mediaType: MediaType.PlainMessage
      };
    }

    if (opts.mediaType === MediaType.SignedMessage && !opts.packerOptions) {
      throw new Error(`jws packer options are required for ${MediaType.SignedMessage}`);
    }

    const proposalRequest = await this.parseProposalRequest(request);

    if (!proposalRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }

    if (!proposalRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }

    const packerOpts =
      opts.mediaType === MediaType.SignedMessage
        ? opts.packerOptions
        : {
            provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
          };

    const senderDID = DID.parse(proposalRequest.to);

    return this._packerMgr.pack(opts.mediaType, response, {
      senderDID,
      ...packerOpts
    });
  }

  /**
   * @inheritdoc IProposalRequestHandler#handleProposalResponse
   */
  async handleProposalResponse(response: ProposalResponseMessage, request: ProposalRequestMessage) {
    if (request.from !== response.to) {
      throw new Error(
        `sender of the request is not a target of response - expected ${request.from}, given ${response.to}`
      );
    }

    return { request, response };
  }
}
