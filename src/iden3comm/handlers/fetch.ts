import { MediaType } from '../constants';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  BasicMessage,
  CredentialFetchRequestMessage,
  CredentialIssuanceMessage,
  CredentialsOfferMessage,
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
import { AbstractMessageHandler, IProtocolMessageHandler } from './message-handler';

/**
 *
 * Options to pass to fetch handler
 *
 * @public
 * @interface FetchHandlerOptions
 */
export type FetchHandlerOptions = {
  mediaType: MediaType;
  packerOptions?: JWSPackerParams;
  headers?: {
    [key: string]: string;
  };
};

export type FetchMessageHandlerOptions = FetchHandlerOptions;

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
  handleCredentialFetchRequest(basicMessage: Uint8Array): Promise<Uint8Array>;

  /**
   * Handles the issuance response message.
   *
   * @param basicMessage - The basic message containing the issuance response.
   * @returns A promise that resolves to a Uint8Array.
   * @throws An error if the credential wallet is not provided in the options or if the credential is missing in the issuance response message.
   */
  handleIssuanceResponseMessage(basicMessage: Uint8Array): Promise<Uint8Array>;
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
    }
  ) {
    super();
  }

  async handle(
    message: BasicMessage,
    ctx: FetchMessageHandlerOptions
  ): Promise<BasicMessage | null> {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE:
        return this.handleOfferMessage(message as CredentialsOfferMessage, ctx);
      case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE:
        return this.handleFetchRequest(message as CredentialFetchRequestMessage);
      case PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE:
        return this.handleIssuanceResponseMsg(message as CredentialIssuanceMessage);
      default:
        return super.handle(message, ctx);
    }
  }

  private async handleOfferMessage(
    offerMessage: CredentialsOfferMessage,
    ctx: {
      mediaType?: MediaType;
      headers?: HeadersInit;
      packerOptions?: JWSPackerParams;
    }
  ): Promise<CredentialIssuanceMessage> {
    if (!ctx.mediaType) {
      ctx.mediaType = MediaType.ZKPMessage;
    }

    const credentials: W3CCredential[] = [];

    for (let index = 0; index < offerMessage.body.credentials.length; index++) {
      const credentialInfo = offerMessage.body.credentials[index];

      const guid = uuid.v4();
      const fetchRequest: MessageFetchRequestMessage = {
        id: guid,
        typ: ctx.mediaType,
        type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE,
        thid: offerMessage.thid ?? guid,
        body: {
          id: credentialInfo.id
        },
        from: offerMessage.to,
        to: offerMessage.from
      };

      const msgBytes = byteEncoder.encode(JSON.stringify(fetchRequest));

      const packerOpts =
        ctx.mediaType === MediaType.SignedMessage
          ? ctx.packerOptions
          : {
              provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
            };

      const senderDID = DID.parse(offerMessage.to);
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

        const message: CredentialIssuanceMessage = await resp.json();
        const credentialBody = message.body?.credential;
        if (!credentialBody) {
          throw new Error(`could not fetch W3C credential, no credential in response`);
        }
        const w3cCreds = Array.isArray(credentialBody) ? credentialBody : [credentialBody];
        credentials.push(...w3cCreds.map((c) => W3CCredential.fromJSON(c)));
      } catch (e: unknown) {
        throw new Error(
          `could not fetch W3C credential, ${credentialInfo?.id}, error: ${
            (e as Error).message ?? e
          }`
        );
      }
    }

    return {
      id: uuid.v4(),
      type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE,
      typ: MediaType.PlainMessage,
      thid: offerMessage.thid,
      from: offerMessage.to,
      to: offerMessage.from,
      body: {
        credential: credentials
      }
    };
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

    const message = await this.handleOfferMessage(offerMessage, {
      mediaType: opts?.mediaType,
      headers: opts?.headers,
      packerOptions: opts?.packerOptions
    });

    const body = message?.body;

    if (!body) {
      return [];
    }

    return Array.isArray(body.credential) ? body.credential : [body.credential];
  }

  private async handleFetchRequest(
    msgRequest: CredentialFetchRequestMessage
  ): Promise<CredentialIssuanceMessage> {
    if (!msgRequest.to) {
      throw new Error("failed request. empty 'to' field");
    }

    if (!msgRequest.from) {
      throw new Error("failed request. empty 'from' field");
    }

    const issuerDID = DID.parse(msgRequest.to);
    const userDID = DID.parse(msgRequest.from);

    const credId = msgRequest.body?.id;
    if (!credId) {
      throw new Error('nvalid credential id in fetch request body');
    }

    const credWallet = this.opts?.credentialWallet;

    if (!credWallet) {
      throw new Error('please, provide credential wallet in options');
    }

    const msg = {
      id: uuid.v4(),
      type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE,
      typ: msgRequest.typ ?? MediaType.PlainMessage,
      thid: msgRequest.thid ?? uuid.v4(),
      from: msgRequest.to,
      to: msgRequest.from
    };

    const credIds = Array.isArray(credId) ? credId : [credId];
    const creds = (await Promise.all(credIds.map((id) => credWallet.findById(id)))).filter(
      Boolean
    ) as W3CCredential[];

    if (!creds.length) {
      throw new Error('credentials not found');
    }

    const userVerified = creds
      .map((cred) => getUserDIDFromCredential(issuerDID, cred))
      .some((did) => did.string() !== userDID.string());

    if (!userVerified) {
      throw new Error('credential subject is not a sender DID');
    }

    return {
      ...msg,
      body: {
        credential: creds.length === 1 ? creds[0] : creds
      }
    };
  }
  /**
   * @inheritdoc IFetchHandler#handleCredentialFetchRequest
   */
  async handleCredentialFetchRequest(envelope: Uint8Array): Promise<Uint8Array> {
    const msgRequest = await FetchHandler.unpackMessage<CredentialFetchRequestMessage>(
      this._packerMgr,
      envelope,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE
    );

    const request = await this.handleFetchRequest(msgRequest);

    return this._packerMgr.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(request)),
      {}
    );
  }

  private async handleIssuanceResponseMsg(issuanceMsg: CredentialIssuanceMessage): Promise<null> {
    const credWallet = this.opts?.credentialWallet;
    if (!credWallet) {
      throw new Error('please provide credential wallet in options');
    }
    const cred = issuanceMsg.body?.credential;

    if (!cred) {
      throw new Error('credential is missing in issuance response message');
    }

    const creds = Array.isArray(cred) ? cred : [cred];

    await Promise.all(
      creds.map(async (cred) => {
        await credWallet.save(W3CCredential.fromJSON(cred));
      })
    );

    return null;
  }

  /**
   * @inheritdoc IFetchHandler#handleIssuanceResponseMessage
   */
  async handleIssuanceResponseMessage(envelop: Uint8Array): Promise<Uint8Array> {
    const issuanceMsg = await FetchHandler.unpackMessage<CredentialIssuanceMessage>(
      this._packerMgr,
      envelop,
      PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE
    );

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
