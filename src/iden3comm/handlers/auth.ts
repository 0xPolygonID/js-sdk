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
import { ProofQuery, RevocationStatus, W3CCredential } from '../../verifiable';
import { byteDecoder, byteEncoder, mergeObjects } from '../../utils';
import { getRandomBytes } from '@iden3/js-crypto';
import { CircuitId, Circuits, Query } from '../../circuits';
import { DocumentLoader } from '@iden3/js-jsonld-merklization';
import { StateResolvers } from '../../storage';
import { PROTOCOL_CONSTANTS } from '..';

/**
 *  createAuthorizationRequest is a function to create protocol authorization request
 * @param {string} reason - reason to request proof
 * @param {string} sender - sender did
 * @param {string} callbackUrl - callback that user should use to send response
 * @returns `Promise<AuthorizationRequestMessage>`
 */
export function createAuthorizationRequest(
  reason: string,
  sender: string,
  callbackUrl: string
): AuthorizationRequestMessage {
  return createAuthorizationRequestWithMessage(reason, '', sender, callbackUrl);
}
/**
 *  createAuthorizationRequestWithMessage is a function to create protocol authorization request with explicit message to sign
 * @param {string} reason - reason to request proof
 * @param {string} message - message to sign in the response
 * @param {string} sender - sender did
 * @param {string} callbackUrl - callback that user should use to send response
 * @returns `Promise<AuthorizationRequestMessage>`
 */
export function createAuthorizationRequestWithMessage(
  reason: string,
  message: string,
  sender: string,
  callbackUrl: string
): AuthorizationRequestMessage {
  const uuidv4 = uuid.v4();
  const request: AuthorizationRequestMessage = {
    id: uuidv4,
    thid: uuidv4,
    from: sender,
    typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
    type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
    body: {
      reason: reason,
      message: message,
      callbackUrl: callbackUrl,
      scope: []
    }
  };
  return request;
}

/**
 *
 * Options to pass to auth response handler
 *
 * @public
 * @interface AuthResponseHandlerOptions
 */
export interface AuthResponseHandlerOptions {
  // acceptedStateTransitionDelay is the period of time in milliseconds that a revoked state remains valid.
  acceptedStateTransitionDelay?: number;
  // acceptedProofGenerationDelay is the period of time in milliseconds that a generated proof remains valid.
  acceptedProofGenerationDelay?: number;
}

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

  /**
     * handle authorization response
     * @public
     * @param {AuthorizationResponseMessage} response  - auth response
     * @param {AuthorizationRequestMessage} request  - auth request
     * @param {AuthResponseHandlerOptions} opts - options
     * @returns `Promise<{
      request: AuthorizationRequestMessage;
      response: AuthorizationResponseMessage;
    }>`
     */
  handleAuthorizationResponse(
    response: AuthorizationResponseMessage,
    request: AuthorizationRequestMessage,
    opts?: AuthResponseHandlerOptions
  ): Promise<{
    request: AuthorizationRequestMessage;
    response: AuthorizationResponseMessage;
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
   *
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _proofService: IProofService,
    private readonly _opts?: {
      documentLoader?: DocumentLoader;
      stateResolvers?: StateResolvers;
    }
  ) {}

  /**
   * @inheritdoc IAuthHandler#parseAuthorizationRequest
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
   * @inheritdoc IAuthHandler#handleAuthorizationRequest
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
        const seed = getRandomBytes(12);
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
          skipClaimRevocationCheck:
            existedData.query.skipClaimRevocationCheck || proofReq.query.skipClaimRevocationCheck,
          ...(existedData.query as JSONObject),
          credentialSubject
        }
      });

      return acc;
    }, new Map<number, { query: JSONObject; linkNonce: number }>());

    const groupedCredentialsCache = new Map<
      number,
      { cred: W3CCredential; revStatus?: RevocationStatus }
    >();

    for (const proofReq of requestScope) {
      const query = proofReq.query;
      const groupId = query.groupId as number | undefined;
      const combinedQueryData = combinedQueries.get(groupId as number);
      if (groupId) {
        if (!combinedQueryData) {
          throw new Error(`Invalid group id ${query.groupId}`);
        }
        const combinedQuery = combinedQueryData.query;

        if (!groupedCredentialsCache.has(groupId)) {
          const credWithRevStatus = await this._proofService.findCredentialByProofQuery(
            did,
            combinedQueryData.query
          );
          if (!credWithRevStatus.cred) {
            throw new Error(`Credential not found for query ${JSON.stringify(combinedQuery)}`);
          }

          groupedCredentialsCache.set(groupId, credWithRevStatus);
        }
      }

      const credWithRevStatus = groupedCredentialsCache.get(groupId as number);

      const zkpRes: ZeroKnowledgeProofResponse = await this._proofService.generateProof(
        proofReq,
        did,
        {
          skipRevocation: Boolean(query.skipClaimRevocationCheck),
          credential: credWithRevStatus?.cred,
          credentialRevocationStatus: credWithRevStatus?.revStatus,
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

  /**
   * @inheritdoc IAuthHandler#handleAuthorizationResponse
   */
  async handleAuthorizationResponse(
    response: AuthorizationResponseMessage,
    request: AuthorizationRequestMessage,
    opts?: AuthResponseHandlerOptions | undefined
  ): Promise<{
    request: AuthorizationRequestMessage;
    response: AuthorizationResponseMessage;
  }> {
    if (!this._opts?.documentLoader) {
      throw new Error('please provide schema loader in options');
    }

    if (!this._opts?.stateResolvers) {
      throw new Error('please provide state resolver in options');
    }

    if ((request.body.message ?? '') !== (response.body.message ?? '')) {
      throw new Error('message for signing from request is not presented in response');
    }

    if (request.from !== response.to) {
      throw new Error(
        `sender of the request is not a target of response - expected ${request.from}, given ${response.to}`
      );
    }

    const requestScope = request.body.scope;

    for (const proofRequest of requestScope) {
      const proofResp = response.body.scope.find((resp) => resp.id === proofRequest.id);
      if (!proofResp) {
        throw new Error(`proof is not given for requestId ${proofRequest.id}`);
      }

      const circuitId = proofResp.circuitId;
      if (circuitId !== proofRequest.circuitId) {
        throw new Error(
          `proof is not given for requested circuit expected: ${proofRequest.circuitId}, given ${circuitId}`
        );
      }

      const isValid = await this._proofService.verifyProof(proofResp, circuitId as CircuitId);
      if (!isValid) {
        throw new Error(
          `Proof with circuit id ${circuitId} and request id ${proofResp.id} is not valid`
        );
      }

      const CircuitVerifier = Circuits.getCircuitPubSignals(circuitId);
      if (!CircuitVerifier) {
        throw new Error(`circuit ${circuitId} is not supported by the library`);
      }

      const params = proofRequest.params ?? {};

      params.verifierDid = DID.parse(request.from);
      // verify query
      const verifier = new CircuitVerifier(proofResp.pub_signals);

      const pubSignals = await verifier.verifyQuery(
        proofRequest.query as unknown as ProofQuery,
        this._opts.documentLoader,
        proofResp.vp as JSON,
        opts,
        params
      );

      // verify states

      await verifier.verifyStates(this._opts.stateResolvers, opts);

      if (!response.from) {
        throw new Error(`proof response doesn't contain from field`);
      }

      // verify id ownership
      await verifier.verifyIdOwnership(response.from, BigInt(proofResp.id));
    }

    return Promise.resolve({ request, response });
  }
}
