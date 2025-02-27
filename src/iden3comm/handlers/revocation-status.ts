import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { MediaType } from '../constants';
import {
  BasicMessage,
  getIden3CommSingleRecipient,
  Iden3DIDcommCompatibilityOptions,
  IPackageManager,
  JWSPackerParams,
  RevocationStatusRequestMessage,
  RevocationStatusResponseMessage
} from '../types';

import { DID } from '@iden3/js-iden3-core';
import * as uuid from 'uuid';
import { RevocationStatus } from '../../verifiable';
import { TreeState } from '../../circuits';
import { byteEncoder } from '../../utils';
import { proving } from '@iden3/js-jwz';
import { IIdentityWallet } from '../../identity';
import {
  AbstractMessageHandler,
  BasicHandlerOptions,
  IProtocolMessageHandler
} from './message-handler';
import { verifyExpiresTime } from './common';

/**
 * Defines the options for a RevocationStatusMessageHandler.
 * @property senderDid - The DID (Decentralized Identifier) to be used.
 * @property mediaType - The media type to be used.
 * @property packerOptions - Optional parameters for the JWS packer.
 * @property treeState - Optional tree state to be used.
 */
export type RevocationStatusMessageHandlerOptions = {
  senderDid: DID;
  mediaType: MediaType;
  packerOptions?: JWSPackerParams;
  treeState?: TreeState;
} & Iden3DIDcommCompatibilityOptions;

/**
 * Interface that allows the processing of the revocation status
 *
 * @interface IRevocationStatusHandler
 */
export interface IRevocationStatusHandler {
  /**
   * unpacks revocation status request
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<RevocationStatusRequestMessage>`
   */
  parseRevocationStatusRequest(request: Uint8Array): Promise<RevocationStatusRequestMessage>;

  /**
   * handle revocation status request
   * @param {did} did  - sender DID
   * @param {Uint8Array} request - raw byte message
   * @param {RevocationStatusHandlerOptions} opts - handler options
   * @returns {Promise<Uint8Array>}` - revocation status response message
   */
  handleRevocationStatusRequest(
    did: DID,
    request: Uint8Array,
    opts?: RevocationStatusHandlerOptions
  ): Promise<Uint8Array>;
}

/** RevocationStatusHandlerOptions represents revocation status handler options */
export type RevocationStatusHandlerOptions = BasicHandlerOptions & {
  mediaType: MediaType;
  packerOptions?: JWSPackerParams;
  treeState?: TreeState;
} & Iden3DIDcommCompatibilityOptions;

/**
 *
 * Allows to process RevocationStatusRequest protocol message
 *

 * @class RevocationStatusHandler
 * @implements implements IRevocationStatusHandler interface
 */
export class RevocationStatusHandler
  extends AbstractMessageHandler
  implements IRevocationStatusHandler, IProtocolMessageHandler
{
  /**
   * Creates an instance of RevocationStatusHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IIdentityWallet} _identityWallet - identity wallet
   *
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _identityWallet: IIdentityWallet
  ) {
    super();
  }

  public handle(
    message: BasicMessage,
    context: RevocationStatusMessageHandlerOptions
  ): Promise<BasicMessage | null> {
    if (!context.senderDid) {
      throw new Error('DID is required');
    }

    if (!context.mediaType) {
      throw new Error('mediaType is required');
    }

    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_REQUEST_MESSAGE_TYPE:
        return this.handleRevocationStatusRequestMessage(
          message as RevocationStatusRequestMessage,
          context
        );
      default:
        return super.handle(message, context);
    }
  }

  private async handleRevocationStatusRequestMessage(
    rsRequest: RevocationStatusRequestMessage,
    context: RevocationStatusMessageHandlerOptions
  ): Promise<BasicMessage | null> {
    const recipient = getIden3CommSingleRecipient(rsRequest);
    if (!recipient) {
      throw new Error(`failed request. empty 'to' field`);
    }

    if (!rsRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }

    if (!rsRequest.body?.revocation_nonce) {
      throw new Error(`failed request. empty 'revocation_nonce' field`);
    }

    const mtpWithTreeState = await this._identityWallet.generateNonRevocationMtpWithNonce(
      recipient,
      BigInt(rsRequest.body.revocation_nonce),
      context.treeState
    );
    const treeState = mtpWithTreeState.treeState;
    const revStatus: RevocationStatus = {
      issuer: {
        state: treeState?.state.string(),
        claimsTreeRoot: treeState.claimsRoot.string(),
        revocationTreeRoot: treeState.revocationRoot.string(),
        rootOfRoots: treeState.rootOfRoots.string()
      },
      mtp: mtpWithTreeState.proof
    };

    const guid = uuid.v4();

    const response: RevocationStatusResponseMessage = {
      id: guid,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_RESPONSE_MESSAGE_TYPE,
      thid: rsRequest.thid ?? guid,
      body: revStatus,
      from: recipient.string(),
      to: context.multipleRecipientsFormat ? [rsRequest.from] : rsRequest.from
    };

    return response as BasicMessage;
  }

  /**
   * @inheritdoc IRevocationStatusHandler#parseRevocationStatusRequest
   */
  async parseRevocationStatusRequest(request: Uint8Array): Promise<RevocationStatusRequestMessage> {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const ciRequest = message as unknown as RevocationStatusRequestMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    return ciRequest;
  }

  /**
   * @inheritdoc IRevocationStatusHandler#handleRevocationStatusRequest
   */
  async handleRevocationStatusRequest(
    did: DID,
    request: Uint8Array,
    opts?: RevocationStatusHandlerOptions
  ): Promise<Uint8Array> {
    if (!opts) {
      opts = {
        mediaType: MediaType.PlainMessage
      };
    }

    if (opts.mediaType === MediaType.SignedMessage && !opts.packerOptions) {
      throw new Error(`jws packer options are required for ${MediaType.SignedMessage}`);
    }

    const rsRequest = await this.parseRevocationStatusRequest(request);
    if (!opts.allowExpiredMessages) {
      verifyExpiresTime(rsRequest);
    }
    const response = await this.handleRevocationStatusRequestMessage(rsRequest, {
      senderDid: did,
      mediaType: opts.mediaType,
      packerOptions: opts.packerOptions,
      treeState: opts.treeState,
      multipleRecipientsFormat: opts.multipleRecipientsFormat
    });

    const packerOpts =
      opts.mediaType === MediaType.SignedMessage
        ? opts.packerOptions
        : {
            provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
          };

    if (!response) {
      throw new Error(`fail to get revocation status `);
    }
    const senderDID = response.from;
    return this._packerMgr.pack(opts.mediaType, byteEncoder.encode(JSON.stringify(response)), {
      senderDID,
      ...packerOpts
    });
  }
}
