import { PROTOCOL_MESSAGE_TYPE, MediaType } from '../constants';
import {
  BasicMessage,
  CredentialOffer,
  CredentialsOfferMessage,
  DIDDocument,
  IPackageManager,
  JsonDocumentObject,
  PackerParams
} from '../types';

import { DID } from '@iden3/js-iden3-core';
import * as uuid from 'uuid';
import { proving } from '@iden3/js-jwz';
import {
  Proposal,
  ProposalRequestCredential,
  ProposalRequestMessage,
  ProposalMessage
} from '../types/protocol/proposal-request';
import { IIdentityWallet } from '../../identity';
import { byteEncoder } from '../../utils';
import { W3CCredential } from '../../verifiable';
import { AbstractMessageHandler, IProtocolMessageHandler } from './message-handler';
import { verifyExpiresTime } from './common';

/** @beta ProposalRequestCreationOptions represents proposal-request creation options */
export type ProposalRequestCreationOptions = {
  credentials: ProposalRequestCredential[];
  metadata?: { type: string; data?: JsonDocumentObject };
  did_doc?: DIDDocument;
};

/**
 * @beta
 * createProposalRequest is a function to create protocol proposal-request protocol message
 * @param {DID} sender - sender did
 * @param {DID} receiver - receiver did
 * @param {ProposalRequestCreationOptions} opts - creation options
 * @returns `Promise<ProposalRequestMessage>`
 */
export function createProposalRequest(
  sender: DID,
  receiver: DID,
  opts: ProposalRequestCreationOptions
): ProposalRequestMessage {
  const uuidv4 = uuid.v4();
  const request: ProposalRequestMessage = {
    id: uuidv4,
    thid: uuidv4,
    from: sender.string(),
    to: receiver.string(),
    typ: MediaType.PlainMessage,
    type: PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE,
    body: opts,
    created_time: Math.floor(Date.now() / 1000)
  };
  return request;
}

/**
 * @beta
 * createProposal is a function to create protocol proposal protocol message
 * @param {DID} sender - sender did
 * @param {DID} receiver - receiver did
 * @param {Proposal[]} proposals - proposals
 * @returns `Promise<ProposalRequestMessage>`
 */
export function createProposal(
  sender: DID,
  receiver: DID,
  proposals?: Proposal[]
): ProposalMessage {
  const uuidv4 = uuid.v4();
  const request: ProposalMessage = {
    id: uuidv4,
    thid: uuidv4,
    from: sender.string(),
    to: receiver.string(),
    typ: MediaType.PlainMessage,
    type: PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE,
    body: {
      proposals: proposals || []
    },
    created_time: Math.floor(Date.now() / 1000)
  };
  return request;
}

/**
 * @beta
 * Interface that allows the processing of the proposal-request
 *
 * @interface ICredentialProposalHandler
 */
export interface ICredentialProposalHandler {
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
   * @param {ProposalRequestHandlerOptions} opts - handler options
   * @returns {Promise<Uint8Array>}` - proposal response message
   */
  handleProposalRequest(
    request: Uint8Array,
    opts?: ProposalRequestHandlerOptions
  ): Promise<Uint8Array>;

  /**
     * @beta
     * handle proposal protocol message
     * @param {ProposalMessage} proposal  - proposal message
     * @param {ProposalHandlerOptions} opts - options
     * @returns `Promise<{
      proposal: ProposalMessage;
    }>`
     */
  handleProposal(
    proposal: ProposalMessage,
    opts?: ProposalHandlerOptions
  ): Promise<{
    proposal: ProposalMessage;
  }>;
}

/** @beta ProposalRequestHandlerOptions represents proposal-request handler options */
export type ProposalRequestHandlerOptions = {
  allowExpiredMessages?: boolean;
};

/** @beta ProposalHandlerOptions represents proposal handler options */
export type ProposalHandlerOptions = {
  proposalRequest?: ProposalRequestMessage;
  allowExpiredMessages?: boolean;
};

/** @beta CredentialProposalHandlerParams represents credential proposal handler params */
export type CredentialProposalHandlerParams = {
  agentUrl: string;
  proposalResolverFn: (context: string, type: string) => Promise<Proposal>;
  packerParams: PackerParams;
};

/**
 *
 * Allows to process ProposalRequest protocol message
 * @beta
 * @class CredentialProposalHandler
 * @implements implements ICredentialProposalHandler interface
 */
export class CredentialProposalHandler
  extends AbstractMessageHandler
  implements ICredentialProposalHandler, IProtocolMessageHandler
{
  /**
   * @beta Creates an instance of CredentialProposalHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IIdentityWallet} _identityWallet - identity wallet
   * @param {CredentialProposalHandlerParams} _params - credential proposal handler params
   *
   */

  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _identityWallet: IIdentityWallet,
    private readonly _params: CredentialProposalHandlerParams
  ) {
    super();
  }

  public async handle(
    message: BasicMessage,
    context: ProposalRequestHandlerOptions
  ): Promise<BasicMessage | null> {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE:
        return (await this.handleProposalRequestMessage(
          message as unknown as ProposalRequestMessage,
          context
        )) as BasicMessage;
      default:
        return super.handle(message, context as { [key: string]: unknown });
    }
  }

  /**
   * @inheritdoc ICredentialProposalHandler#parseProposalRequest
   */
  async parseProposalRequest(request: Uint8Array): Promise<ProposalRequestMessage> {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const proposalRequest = message as unknown as ProposalRequestMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    return proposalRequest;
  }

  private async handleProposalRequestMessage(
    proposalRequest: ProposalRequestMessage,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ctx?: ProposalRequestHandlerOptions
  ): Promise<ProposalMessage | CredentialsOfferMessage | undefined> {
    if (!proposalRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }

    if (!proposalRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }

    if (!proposalRequest.body?.credentials?.length) {
      throw new Error(`failed request. no 'credentials' in body`);
    }

    let credOfferMessage: CredentialsOfferMessage | undefined = undefined;
    let proposalMessage: ProposalMessage | undefined = undefined;

    for (let i = 0; i < proposalRequest.body.credentials.length; i++) {
      const cred = proposalRequest.body.credentials[i];

      // check if there is credentials in the wallet
      let credsFromWallet: W3CCredential[] = [];

      try {
        credsFromWallet = await this._identityWallet.credentialWallet.findByQuery({
          credentialSubject: {
            id: {
              $eq: proposalRequest.from
            }
          },
          type: cred.type,
          context: cred.context,
          allowedIssuers: [proposalRequest.to]
        });
      } catch (e) {
        if ((e as Error).message !== 'no credential satisfied query') {
          throw e;
        }
      }

      if (credsFromWallet.length) {
        const guid = uuid.v4();
        if (!credOfferMessage) {
          credOfferMessage = {
            id: guid,
            typ: this._params.packerParams.mediaType,
            type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE,
            thid: proposalRequest.thid ?? guid,
            body: {
              url: this._params.agentUrl,
              credentials: []
            },
            from: proposalRequest.to,
            to: proposalRequest.from
          };
        }

        credOfferMessage.body.credentials.push(
          ...credsFromWallet.map<CredentialOffer>((c) => ({
            id: c.id,
            description: ''
          }))
        );
        continue;
      }

      // credential not found in the wallet, prepare proposal protocol message
      const proposal = await this._params.proposalResolverFn(cred.context, cred.type);
      if (!proposal) {
        throw new Error(`can't resolve Proposal for type: ${cred.type}, context: ${cred.context}`);
      }
      if (!proposalMessage) {
        const guid = uuid.v4();
        proposalMessage = {
          id: guid,
          typ: this._params.packerParams.mediaType,
          type: PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE,
          thid: proposalRequest.thid ?? guid,
          body: {
            proposals: []
          },
          from: proposalRequest.to,
          to: proposalRequest.from
        };
      }
      proposalMessage.body?.proposals.push(proposal);
    }

    return proposalMessage ?? credOfferMessage;
  }

  /**
   * @inheritdoc ICredentialProposalHandler#handleProposalRequest
   */
  async handleProposalRequest(
    request: Uint8Array,
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    opts?: ProposalRequestHandlerOptions
  ): Promise<Uint8Array> {
    if (
      this._params.packerParams.mediaType === MediaType.SignedMessage &&
      !this._params.packerParams.packerOptions
    ) {
      throw new Error(`jws packer options are required for ${MediaType.SignedMessage}`);
    }

    const proposalRequest = await this.parseProposalRequest(request);
    if (!proposalRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(proposalRequest);
    }

    const senderDID = DID.parse(proposalRequest.from);
    const message = await this.handleProposalRequestMessage(proposalRequest);
    const response = byteEncoder.encode(JSON.stringify(message));

    const packerOpts =
      this._params.packerParams.mediaType === MediaType.SignedMessage
        ? this._params.packerParams.packerOptions
        : {
            provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
          };

    return this._packerMgr.pack(this._params.packerParams.mediaType, response, {
      senderDID,
      ...packerOpts
    });
  }

  /**
   * @inheritdoc ICredentialProposalHandler#handleProposal
   */
  async handleProposal(proposal: ProposalMessage, opts?: ProposalHandlerOptions) {
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(proposal);
    }
    if (opts?.proposalRequest && opts.proposalRequest.from !== proposal.to) {
      throw new Error(
        `sender of the request is not a target of response - expected ${opts.proposalRequest.from}, given ${proposal.to}`
      );
    }
    return { proposal };
  }
}
