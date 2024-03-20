import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { MediaType } from '../constants';
import {
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
export type RevocationStatusHandlerOptions = {
  mediaType: MediaType;
  packerOptions?: JWSPackerParams;
  treeState?: TreeState;
};

/**
 *
 * Allows to process RevocationStatusRequest protocol message
 *

 * @class RevocationStatusHandler
 * @implements implements IRevocationStatusHandler interface
 */
export class RevocationStatusHandler implements IRevocationStatusHandler {
  /**
   * Creates an instance of RevocationStatusHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IIdentityWallet} _identityWallet - identity wallet
   *
   */

  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _identityWallet: IIdentityWallet
  ) {}

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

    if (!rsRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }

    if (!rsRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }

    if (!rsRequest.body?.revocation_nonce) {
      throw new Error(`failed request. empty 'revocation_nonce' field`);
    }

    const issuerDID = DID.parse(rsRequest.to);

    const mtpWithTreeState = await this._identityWallet.generateNonRevocationMtpWithNonce(
      issuerDID,
      BigInt(rsRequest.body.revocation_nonce),
      opts?.treeState
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

    const packerOpts =
      opts.mediaType === MediaType.SignedMessage
        ? opts.packerOptions
        : {
            provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
          };

    const senderDID = DID.parse(rsRequest.to);
    const guid = uuid.v4();

    const response: RevocationStatusResponseMessage = {
      id: guid,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_RESPONSE_MESSAGE_TYPE,
      thid: rsRequest.thid ?? guid,
      body: revStatus,
      from: did.string(),
      to: rsRequest.from
    };

    return this._packerMgr.pack(opts.mediaType, byteEncoder.encode(JSON.stringify(response)), {
      senderDID,
      ...packerOpts
    });
  }
}
