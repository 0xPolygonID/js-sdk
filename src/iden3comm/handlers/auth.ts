import { MediaType } from '../constants';
import { IProofService } from '../../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  AuthorizationRequestMessage,
  AuthorizationResponseMessage,
  IPackageManager,
  JSONObject,
  JWSPackerParams,
  ZeroKnowledgeProofResponse
} from '../types';
import { DID } from '@iden3/js-iden3-core';
import { proving } from '@iden3/js-jwz';

import * as uuid from 'uuid';
import { W3CCredential } from '../../verifiable';
import { byteDecoder, byteEncoder, mergeObjects } from '../../utils';
import { ICredentialWallet } from '../../credentials';

/**
 * Interface that allows the processing of the authorization request in the raw format for given identifier
 *
 * @public
 * @interface IAuthHandler
 */
export interface IAuthHandler {
  /**
   * unpacks authorization request
   * @public
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<AuthorizationRequestMessage>`
   */
  parseAuthorizationRequest(request: Uint8Array): Promise<AuthorizationRequestMessage>;

  /**
   * unpacks authorization request
   * @public
   * @param {did} did  - sender DID
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }>`
   */
  handleAuthorizationRequest(
    did: DID,
    request: Uint8Array,
    opts?: AuthHandlerOptions
  ): Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }>;
}
/**
 *
 * Options to pass to auth handler
 *
 * @public
 * @interface AuthHandlerOptions
 */
export interface AuthHandlerOptions {
  mediaType: MediaType;
  packerOptions?: JWSPackerParams;
}

/**
 *
 * Allows to process AuthorizationRequest protocol message and produce JWZ response.
 *
 * @public

 * @class AuthHandler
 * @implements implements IAuthHandler interface
 */
export class AuthHandler implements IAuthHandler {
  /**
   * Creates an instance of AuthHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IProofService} _proofService -  proof service to verify zk proofs
   * @param {ICredentialWallet} _credentialWallet -  credential wallet to fetch credentials
   *
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _proofService: IProofService,
    private readonly _credentialWallet: ICredentialWallet
  ) {}

  /**
   * unpacks authorization request
   * @public
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<AuthorizationRequestMessage>`
   */
  async parseAuthorizationRequest(request: Uint8Array): Promise<AuthorizationRequestMessage> {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const authRequest = message as unknown as AuthorizationRequestMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    return authRequest;
  }

  /**
   * unpacks authorization request and packs authorization response
   * @public
   * @param {did} did  - sender DID
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }>`
   */
  async handleAuthorizationRequest(
    did: DID,
    request: Uint8Array,
    opts?: AuthHandlerOptions
  ): Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }> {
    const authRequest = await this.parseAuthorizationRequest(request);

    if (authRequest.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid message type for authorization request');
    }

    if (!opts) {
      opts = {
        mediaType: MediaType.ZKPMessage
      };
    }

    if (opts.mediaType === MediaType.SignedMessage && !opts.packerOptions) {
      throw new Error(`jws packer options are required for ${MediaType.SignedMessage}`);
    }

    if (authRequest.to) {
      // override sender did if it's explicitly specified in the auth request
      did = DID.parse(authRequest.to);
    }
    const guid = uuid.v4();

    const authResponse: AuthorizationResponseMessage = {
      id: guid,
      typ: opts.mediaType,
      type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      thid: authRequest.thid ?? guid,
      body: {
        message: authRequest?.body?.message,
        scope: []
      },
      from: did.string(),
      to: authRequest.from
    };

    const requestScope = authRequest.body.scope;
    const combinedQueries = requestScope.reduce((acc, proofReq) => {
      const groupId = proofReq.query.groupId as number | undefined;
      if (!groupId) {
        return acc;
      }

      const existedData = acc.get(groupId);
      if (!existedData) {
        const seed = new Uint8Array(16);
        globalThis.crypto.getRandomValues(seed);
        const dataView = new DataView(seed.buffer);
        const linkNonce = dataView.getUint32(0);
        acc.set(groupId, { query: proofReq.query, linkNonce });
        return acc;
      }

      const credentialSubject = mergeObjects(
        existedData.query.credentialSubject as JSONObject,
        proofReq.query.credentialSubject as JSONObject
      );

      acc.set(groupId, {
        ...existedData,
        query: {
          ...(existedData.query as JSONObject),
          credentialSubject
        }
      });

      return acc;
    }, new Map<number, { query: JSONObject; linkNonce: number }>());

    for (const proofReq of requestScope) {
      const query = proofReq.query;
      let credential: W3CCredential[] = [];
      const combinedQueryData = combinedQueries.get(query.groupId as number);
      if (query.groupId) {
        if (!combinedQueryData) {
          throw new Error(`Invalid group id ${query.groupId}`);
        }
        const combinedQuery = combinedQueryData.query;
        credential = await this._credentialWallet.findByQuery(combinedQuery);

        if (!credential?.length) {
          throw new Error(`Credential not found for query ${JSON.stringify(combinedQuery)}`);
        }

        if (credential.length > 1) {
          throw new Error(`Multiple credentials found for query ${JSON.stringify(combinedQuery)}`);
        }
      }

      const zkpRes: ZeroKnowledgeProofResponse = await this._proofService.generateProof(
        proofReq,
        did,
        {
          skipRevocation: (query.skipClaimRevocationCheck as boolean) ?? false,
          credential: credential[0],
          linkNonce: combinedQueryData?.linkNonce ? BigInt(combinedQueryData.linkNonce) : undefined
        }
      );

      authResponse.body.scope.push(zkpRes);
    }

    const msgBytes = byteEncoder.encode(JSON.stringify(authResponse));

    const packerOpts =
      opts.mediaType === MediaType.SignedMessage
        ? opts.packerOptions
        : {
            provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
          };

    const token = byteDecoder.decode(
      await this._packerMgr.pack(opts.mediaType, msgBytes, {
        senderDID: did,
        ...packerOpts
      })
    );

    return { authRequest, authResponse, token };
  }
}
