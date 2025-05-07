import { MediaType } from '../constants';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  BasicMessage,
  CredentialFetchRequestMessage,
  CredentialIssuanceMessage,
  CredentialsOfferMessage,
  CredentialsOnchainOfferMessage,
  getIden3CommSingleRecipient,
  Iden3DIDcommCompatibilityOptions,
  IPackageManager,
  JWSPackerParams,
  MessageFetchRequestMessage
} from '../types';

import { W3CCredential } from '../../verifiable';
import { ICredentialWallet, getUserDIDFromCredential } from '../../credentials';

import { byteDecoder, byteEncoder } from '../../utils';
import { proving } from '@iden3/js-jwz';
import { DID } from '@iden3/js-iden3-core';
import * as uuid from 'uuid';
import {
  AbstractMessageHandler,
  BasicHandlerOptions,
  IProtocolMessageHandler
} from './message-handler';
import { verifyExpiresTime } from './common';
import { IOnchainIssuer } from '../../storage';

/**
 *
 * Options to pass to fetch handler
 *
 * @public
 * @interface FetchHandlerOptions
 */
export type FetchHandlerOptions = BasicHandlerOptions & {
  mediaType: MediaType;
  packerOptions?: JWSPackerParams;
  headers?: {
    [key: string]: string;
  };
} & Iden3DIDcommCompatibilityOptions;

/**
 *
 * Options to pass to fetch request handler
 *
 * @public
 * @interface FetchRequestOptions
 */
export type FetchRequestOptions = BasicHandlerOptions & Iden3DIDcommCompatibilityOptions;

/**
 *
 * Options to pass to issuance response handler
 *
 * @public
 * @interface IssuanceResponseOptions
 */
export type IssuanceResponseOptions = BasicHandlerOptions & Iden3DIDcommCompatibilityOptions;

export type FetchMessageHandlerOptions = FetchHandlerOptions & Iden3DIDcommCompatibilityOptions;

/**
 * Interface that allows the processing of the credential offer in the raw format for given identifier
 *
 * @public
 * @interface IFetchHandler
 */
export interface IFetchHandler {
  /**
   * unpacks authorization request
   * @public
   * @param {Uint8Array} offer - raw byte message
   * @param {FetchHandlerOptions} opts - FetchHandlerOptions
   * @returns `Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }>`
   */
  handleCredentialOffer(offer: Uint8Array, opts?: FetchHandlerOptions): Promise<W3CCredential[]>;

  /**
   * Handles a credential fetch request.
   *
   * @param basicMessage - The basic message containing the fetch request.
   * @returns A promise that resolves to the response message.
   * @throws An error if the request is invalid or if the credential is not found.
   */
  handleCredentialFetchRequest(
    basicMessage: Uint8Array,
    opts?: FetchRequestOptions
  ): Promise<Uint8Array>;

  /**
   * Handles the issuance response message.
   *
   * @param basicMessage - The basic message containing the issuance response.
   * @returns A promise that resolves to a Uint8Array.
   * @throws An error if the credential wallet is not provided in the options or if the credential is missing in the issuance response message.
   */
  handleIssuanceResponseMessage(
    basicMessage: Uint8Array,
    opts?: IssuanceResponseOptions
  ): Promise<Uint8Array>;
}
/**
 *
 * Allows to handle Credential offer protocol message and return fetched credential
 *
 * @public

 * @class FetchHandler
 * @implements implements IFetchHandler interface
 */
export class FetchHandler
  extends AbstractMessageHandler
  implements IFetchHandler, IProtocolMessageHandler
{
  /**
   * Constructs a new instance of the FetchHandler class.
   *
   * @param _packerMgr The package manager used for packing and unpacking data.
   * @param opts Optional configuration options for the FetchHandler.
   * @param opts.credentialWallet The credential wallet used for managing credentials.
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly opts?: {
      credentialWallet: ICredentialWallet;
      onchainIssuer?: IOnchainIssuer;
    }
  ) {
    super();
  }

  async handle(
    message: BasicMessage,
    ctx: FetchMessageHandlerOptions
  ): Promise<BasicMessage | null> {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE: {
        const result = await this.handleOfferMessage(message as CredentialsOfferMessage, ctx);
        if (Array.isArray(result)) {
          const credWallet = this.opts?.credentialWallet;
          if (!credWallet) throw new Error('Credential wallet is not provided');
          await credWallet.saveAll(result);
          return null;
        }
        return result as BasicMessage;
      }
      case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE:
        return this.handleFetchRequest(message as CredentialFetchRequestMessage, ctx);
      case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE:
        return this.handleIssuanceResponseMsg(message as CredentialIssuanceMessage);
      case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ONCHAIN_OFFER_MESSAGE_TYPE: {
        const result = await this.handleOnchainOfferMessage(
          message as CredentialsOnchainOfferMessage
        );
        if (Array.isArray(result)) {
          const credWallet = this.opts?.credentialWallet;
          if (!credWallet) throw new Error('Credential wallet is not provided');
          await credWallet.saveAll(result);
          return null;
        }
        return result as BasicMessage;
      }
      default:
        return super.handle(message, ctx);
    }
  }

  private async handleOnchainOfferMessage(
    offerMessage: CredentialsOnchainOfferMessage
  ): Promise<W3CCredential[]> {
    if (!this.opts?.onchainIssuer) {
      throw new Error('onchain issuer is not provided');
    }
    const credentials: W3CCredential[] = [];
    const issuerDID = DID.parse(offerMessage.from);
    const userDID = getIden3CommSingleRecipient(offerMessage);
    if (!userDID) {
      throw new Error('credential offer must have a recipient');
    }
    for (const credentialInfo of offerMessage.body.credentials) {
      const credential = await this.opts.onchainIssuer.getCredential(
        issuerDID,
        userDID,
        BigInt(credentialInfo.id)
      );
      credentials.push(credential);
    }
    return credentials;
  }

  private async handleOfferMessage(
    offerMessage: CredentialsOfferMessage,
    ctx: {
      mediaType?: MediaType;
      headers?: HeadersInit;
      packerOptions?: JWSPackerParams;
    } & Iden3DIDcommCompatibilityOptions
  ): Promise<W3CCredential[] | BasicMessage> {
    if (!ctx.mediaType) {
      ctx.mediaType = MediaType.ZKPMessage;
    }

    const credentials: W3CCredential[] = [];

    const to = getIden3CommSingleRecipient(offerMessage);
    if (!to) {
      throw new Error('offer must have a recipient');
    }
    for (const credentialInfo of offerMessage.body.credentials) {
      const guid = uuid.v4();
      const fetchRequest: MessageFetchRequestMessage = {
        id: guid,
        typ: ctx.mediaType,
        type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE,
        thid: offerMessage.thid ?? guid,
        body: {
          id: credentialInfo.id
        },
        from: to.string(),
        to: ctx.multipleRecipientsFormat ? [offerMessage.from] : offerMessage.from
      };

      const msgBytes = byteEncoder.encode(JSON.stringify(fetchRequest));

      const packerOpts =
        ctx.mediaType === MediaType.SignedMessage
          ? ctx.packerOptions
          : {
              provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
            };

      const senderDID = to;
      const token = byteDecoder.decode(
        await this._packerMgr.pack(ctx.mediaType, msgBytes, {
          senderDID,
          ...packerOpts
        })
      );
      try {
        if (!offerMessage?.body?.url) {
          throw new Error(`could not fetch W3C credential, body url is missing`);
        }
        const resp = await fetch(offerMessage.body.url, {
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...ctx.headers
          },
          body: token
        });
        const arrayBuffer = await resp.arrayBuffer();
        if (!arrayBuffer.byteLength) {
          throw new Error(`could not fetch , ${credentialInfo?.id}, response is empty`);
        }
        const { unpackedMessage: message } = await this._packerMgr.unpack(
          new Uint8Array(arrayBuffer)
        );
        if (message.type !== PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE) {
          return message;
        }
        credentials.push(
          W3CCredential.fromJSON((message as CredentialIssuanceMessage).body.credential)
        );
      } catch (e: unknown) {
        throw new Error(
          `could not fetch protocol message for credential offer id: , ${
            credentialInfo?.id
          }, error: ${(e as Error).message ?? e}`
        );
      }
    }
    return credentials;
  }

  /**
   * Handles only messages with credentials/1.0/offer type
   *
   * @param {
   *     offer: Uint8Array; offer - raw offer message
   *     opts
   *   }) options how to fetch credential
   * @returns `Promise<W3CCredential[]>`
   */
  async handleCredentialOffer(
    offer: Uint8Array,
    opts?: FetchHandlerOptions
  ): Promise<W3CCredential[]> {
    if (opts?.mediaType === MediaType.SignedMessage && !opts.packerOptions) {
      throw new Error(`jws packer options are required for ${MediaType.SignedMessage}`);
    }

    const offerMessage = await FetchHandler.unpackMessage<CredentialsOfferMessage>(
      this._packerMgr,
      offer,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE
    );
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(offerMessage);
    }
    const result = await this.handleOfferMessage(offerMessage, {
      mediaType: opts?.mediaType,
      headers: opts?.headers,
      packerOptions: opts?.packerOptions,
      multipleRecipientsFormat: opts?.multipleRecipientsFormat
    });

    if (Array.isArray(result)) {
      return result;
    }

    throw new Error('invalid protocol message response');
  }

  /**
   * Handles only messages with credentials/1.0/onchain-offer type
   * @beta
   */
  async handleOnchainOffer(offer: Uint8Array): Promise<W3CCredential[]> {
    const offerMessage = await FetchHandler.unpackMessage<CredentialsOnchainOfferMessage>(
      this._packerMgr,
      offer,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ONCHAIN_OFFER_MESSAGE_TYPE
    );

    return this.handleOnchainOfferMessage(offerMessage);
  }

  private async handleFetchRequest(
    msgRequest: CredentialFetchRequestMessage,
    ctx?: FetchRequestOptions
  ): Promise<CredentialIssuanceMessage> {
    if (!msgRequest.to) {
      throw new Error("failed request. empty 'to' field");
    }

    if (!msgRequest.from) {
      throw new Error("failed request. empty 'from' field");
    }

    const issuerDID = getIden3CommSingleRecipient(msgRequest);
    if (!issuerDID) {
      throw new Error('fetch request must have a recipient');
    }
    const userDID = DID.parse(msgRequest.from);

    const credId = msgRequest.body?.id;
    if (!credId) {
      throw new Error('invalid credential id in fetch request body');
    }

    if (!this.opts?.credentialWallet) {
      throw new Error('please, provide credential wallet in options');
    }

    const cred = await this.opts.credentialWallet.findById(credId);

    if (!cred) {
      throw new Error('credential not found');
    }

    const userToVerifyDID = getUserDIDFromCredential(issuerDID, cred);

    if (userToVerifyDID.string() !== userDID.string()) {
      throw new Error('credential subject is not a sender DID');
    }

    return {
      id: uuid.v4(),
      type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE,
      typ: msgRequest.typ ?? MediaType.PlainMessage,
      thid: msgRequest.thid ?? uuid.v4(),
      body: { credential: cred },
      from: issuerDID.string(),
      to: ctx?.multipleRecipientsFormat ? [userDID.string()] : userDID.string()
    };
  }
  /**
   * @inheritdoc IFetchHandler#handleCredentialFetchRequest
   */
  async handleCredentialFetchRequest(
    envelope: Uint8Array,
    opts?: FetchRequestOptions
  ): Promise<Uint8Array> {
    const msgRequest = await FetchHandler.unpackMessage<CredentialFetchRequestMessage>(
      this._packerMgr,
      envelope,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE
    );
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(msgRequest);
    }
    const request = await this.handleFetchRequest(msgRequest);

    return this._packerMgr.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(request)),
      {}
    );
  }

  private async handleIssuanceResponseMsg(issuanceMsg: CredentialIssuanceMessage): Promise<null> {
    if (!this.opts?.credentialWallet) {
      throw new Error('please provide credential wallet in options');
    }

    if (!issuanceMsg.body?.credential) {
      throw new Error('credential is missing in issuance response message');
    }

    await this.opts.credentialWallet.save(W3CCredential.fromJSON(issuanceMsg.body.credential));

    return null;
  }

  /**
   * @inheritdoc IFetchHandler#handleIssuanceResponseMessage
   */
  async handleIssuanceResponseMessage(
    envelop: Uint8Array,
    opts?: IssuanceResponseOptions
  ): Promise<Uint8Array> {
    const issuanceMsg = await FetchHandler.unpackMessage<CredentialIssuanceMessage>(
      this._packerMgr,
      envelop,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE
    );
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(issuanceMsg);
    }
    await this.handleIssuanceResponseMsg(issuanceMsg);
    return Uint8Array.from([]);
  }

  /**
   * @inheritdoc IFetchHandler#unpackMessage
   */
  static async unpackMessage<T>(
    packerMgr: IPackageManager,
    envelope: Uint8Array,
    messageType: string
  ): Promise<T> {
    const { unpackedMessage: message } = await packerMgr.unpack(envelope);
    const msgRequest = message as unknown as T;
    if (message.type !== messageType) {
      throw new Error('Invalid message type');
    }
    return msgRequest;
  }
}
