import { MediaType } from '../constants';
import { CircuitId } from '../../circuits/models';
import { IProofService } from '../../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  AuthorizationRequestMessage,
  AuthorizationRequestMessageBody,
  AuthorizationResponseMessage,
  IPackageManager,
  PackerParams,
  ZeroKnowledgeProofRequest,
  ZeroKnowledgeProofResponse
} from '../types';
import { DID } from '@iden3/js-iden3-core';
import { proving } from '@iden3/js-jwz';

import * as uuid from 'uuid';
import { ICredentialWallet } from '../../credentials';
import { W3CCredential } from '../../verifiable';
import { byteDecoder, byteEncoder } from '../../utils';

/**
 * ZKP request and credential that satisfies the zkp query conditions
 *
 * @export
 * @interface ZKPRequestWithCredential
 */
export interface ZKPRequestWithCredential {
  req: ZeroKnowledgeProofRequest;
  credential: W3CCredential;
  credentialSubjectProfileNonce: number;
}
/**
 * Interface that allows the processing of the authorization request in the raw format for given identifier
 *
 * @export
 * @beta
 * @interface IAuthHandler
 */
export interface IAuthHandler {
  /**
   * Handle authorization request protocol message
   *
   * @param {DID} id - identifier that will handle request
   * @param {Uint8Array} request - request payload
   * @returns `Promise<{
   *     token: string;
   *     authRequest: AuthorizationRequestMessage;
   *     authResponse: AuthorizationResponseMessage;
   *   }>`
   */
  handleAuthorizationRequestForGenesisDID(options: {
    did: DID;
    request: Uint8Array;
    packer: {
      mediaType: MediaType;
    } & PackerParams;
  }): Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }>;

  /**
   * unpacks authorization request
   * @export
   * @beta
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<AuthorizationRequestMessage>`
   */
  parseAuthorizationRequest(request: Uint8Array): Promise<AuthorizationRequestMessage>;

  /**
   * Generates zero-knowledge proofs for given requests and credentials
   * @export
   * @beta
   * @param {DID} userGenesisDID      - user genesis identifier for which user holds key pair.
   * @param {number} authProfileNonce - profile nonce that will be used for authorization.
   * @param {AuthorizationRequestMessage} authRequest - authorization request, protocol message.
   * @param {ZKPRequestWithCredential[]} zkpRequestsWithCreds - zero knowledge proof request with chosen credential to use.
   * @returns `Promise<{
   *     token: string;
   *     authRequest: AuthorizationRequestMessage;
   *     authResponse: AuthorizationResponseMessage;
   *   }>}`
   */
  generateAuthorizationResponse(
    userGenesisDID: DID,
    authProfileNonce: number,
    authRequest: AuthorizationRequestMessage,
    zkpRequestsWithCreds: ZKPRequestWithCredential[]
  ): Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }>;
}
/**
 *
 * Allows to process AuthorizationRequest protocol message and produce JWZ response.
 *
 * @export
 * @beta

 * @class AuthHandler
 * @implements implements IAuthHandler interface
 */
export class AuthHandler implements IAuthHandler {
  /**
   * Creates an instance of AuthHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IProofService} _proofService -  proof service to verify zk proofs
   * @param {ICredentialWallet} _credentialWallet -  wallet to search credentials
   *
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _proofService: IProofService,
    private readonly _credentialWallet: ICredentialWallet
  ) {}

  /**
   * Handles only messages with authorization/v1.0/request type
   * Generates all requested proofs and wraps authorization response message to JWZ token
   * works when profiles are not supported
   * @param {DID} did - an identity that will process the request
   * @param {Uint8Array} request - raw request
   * @returns `Promise<{token: string; authRequest: AuthorizationRequestMessage; authResponse: AuthorizationResponseMessage;}>` JWZ token, parsed request and response
   */
  async handleAuthorizationRequestForGenesisDID(options: {
    did: DID;
    request: Uint8Array;
    packer: {
      mediaType: MediaType;
    } & PackerParams;
  }): Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }> {
    const {
      did,
      request,
      packer: { mediaType, ...packerParams }
    } = options;

    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const authRequest = message as unknown as AuthorizationRequestMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    const authRequestBody = message.body as unknown as AuthorizationRequestMessageBody;

    const guid = uuid.v4();
    const authResponse: AuthorizationResponseMessage = {
      id: guid,
      typ: mediaType,
      type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      thid: message.thid ?? guid,
      body: {
        did_doc: undefined, //  slipped for now, todo: get did doc for id
        message: authRequestBody.message,
        scope: []
      },
      from: options.did.string(),
      to: message.from
    };

    for (const proofReq of authRequestBody.scope) {
      const zkpReq: ZeroKnowledgeProofRequest = {
        id: proofReq.id,
        circuitId: proofReq.circuitId as CircuitId,
        query: proofReq.query
      };

      const creds = await this._credentialWallet.findByQuery(proofReq.query);

      const credsForGenesisDID = await this._credentialWallet.filterByCredentialSubject(creds, did);
      if (credsForGenesisDID.length == 0) {
        throw new Error(`no credential were issued on the given id ${did.string()}`);
      }

      const zkpRes: ZeroKnowledgeProofResponse = await this._proofService.generateProof(
        zkpReq,
        did,
        credsForGenesisDID[0]
      );

      authResponse.body.scope.push(zkpRes);
    }
    const msgBytes = byteEncoder.encode(JSON.stringify(authResponse));
    const token = byteDecoder.decode(
      await this._packerMgr.pack(mediaType, msgBytes, {
        senderDID: did,
        ...packerParams
      })
    );
    return { authRequest, authResponse, token };
  }

  /**
   * unpacks authorization request
   * @export
   * @beta
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
   * Generates zero-knowledge proofs for given requests and credentials
   * @export
   * @beta
   * @param {DID} userGenesisDID      - user genesis identifier for which user holds key pair.
   * @param {number} authProfileNonce - profile nonce that will be used for authorization.
   * @param {AuthorizationRequestMessage} authRequest - authorization request, protocol message.
   * @param {ZKPRequestWithCredential[]} zkpRequestsWithCreds - zero knowledge proof request with chosen credential to use.
   * @returns `Promise<{
   *     token: string;
   *     authRequest: AuthorizationRequestMessage;
   *     authResponse: AuthorizationResponseMessage;
   *   }>}`
   */
  async generateAuthorizationResponse(
    userGenesisDID: DID,
    authProfileNonce: number,
    authRequest: AuthorizationRequestMessage,
    zkpRequestsWithCreds?: ZKPRequestWithCredential[]
  ): Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }> {
    const guid = uuid.v4();
    const authResponse: AuthorizationResponseMessage = {
      id: guid,
      typ: MediaType.ZKPMessage,
      type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      thid: authRequest.thid ?? guid,
      body: {
        message: authRequest.body.message,
        scope: []
      },
      from: userGenesisDID.string(),
      to: authRequest.from
    };

    for (const r of zkpRequestsWithCreds) {
      const zkpRes: ZeroKnowledgeProofResponse = await this._proofService.generateProof(
        r.req,
        userGenesisDID,
        r.credential,
        {
          authProfileNonce: authProfileNonce,
          credentialSubjectProfileNonce: r.credentialSubjectProfileNonce,
          skipRevocation: false,
        }
      );

      authResponse.body.scope.push(zkpRes);
    }
    const msgBytes = byteEncoder.encode(JSON.stringify(authResponse));
    const token = byteDecoder.decode(
      await this._packerMgr.pack(MediaType.ZKPMessage, msgBytes, {
        senderDID: userGenesisDID,
        profileNonce: authProfileNonce,
        provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
      })
    );
    return { authRequest, authResponse, token };
  }
}
