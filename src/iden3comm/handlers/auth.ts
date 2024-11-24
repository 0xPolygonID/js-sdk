import { MediaType, ProtocolVersion } from '../constants';
import { IProofService } from '../../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  StateVerificationOpts,
  AuthorizationRequestMessage,
  AuthorizationResponseMessage,
  BasicMessage,
  IPackageManager,
  JWSPackerParams,
  ZeroKnowledgeProofRequest,
  JSONObject
} from '../types';
import { DID } from '@iden3/js-iden3-core';
import { proving } from '@iden3/js-jwz';

import * as uuid from 'uuid';
import { ProofQuery } from '../../verifiable';
import { byteDecoder, byteEncoder } from '../../utils';
import { processZeroKnowledgeProofRequests } from './common';
import { CircuitId } from '../../circuits';
import { AbstractMessageHandler, IProtocolMessageHandler } from './message-handler';
import { parseAcceptProfile } from '../utils';

/**
 * Options to pass to createAuthorizationRequest function
 * @public
 */
export type AuthorizationRequestCreateOptions = {
  accept?: string[];
  scope?: ZeroKnowledgeProofRequest[];
};

/**
 *  createAuthorizationRequest is a function to create protocol authorization request
 * @param {string} reason - reason to request proof
 * @param {string} sender - sender did
 * @param {string} callbackUrl - callback that user should use to send response
 * @param {AuthorizationRequestCreateOptions} opts - authorization request options
 * @returns `Promise<AuthorizationRequestMessage>`
 */
export function createAuthorizationRequest(
  reason: string,
  sender: string,
  callbackUrl: string,
  opts?: AuthorizationRequestCreateOptions
): AuthorizationRequestMessage {
  return createAuthorizationRequestWithMessage(reason, '', sender, callbackUrl, opts);
}
/**
 *  createAuthorizationRequestWithMessage is a function to create protocol authorization request with explicit message to sign
 * @param {string} reason - reason to request proof
 * @param {string} message - message to sign in the response
 * @param {string} sender - sender did
 * @param {string} callbackUrl - callback that user should use to send response
 * @param {AuthorizationRequestCreateOptions} opts - authorization request options
 * @returns `Promise<AuthorizationRequestMessage>`
 */
export function createAuthorizationRequestWithMessage(
  reason: string,
  message: string,
  sender: string,
  callbackUrl: string,
  opts?: AuthorizationRequestCreateOptions
): AuthorizationRequestMessage {
  const uuidv4 = uuid.v4();
  const request: AuthorizationRequestMessage = {
    id: uuidv4,
    thid: uuidv4,
    from: sender,
    typ: MediaType.PlainMessage,
    type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
    body: {
      accept: opts?.accept,
      reason: reason,
      message: message,
      callbackUrl: callbackUrl,
      scope: opts?.scope ?? []
    }
  };
  return request;
}

/**
 *
 * Options to pass to auth response handler
 *
 * @public
 */
export type AuthResponseHandlerOptions = StateVerificationOpts & {
  // acceptedProofGenerationDelay is the period of time in milliseconds that a generated proof remains valid.
  acceptedProofGenerationDelay?: number;
};

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

type AuthReqOptions = {
  senderDid: DID;
  mediaType?: MediaType;
};

type AuthRespOptions = {
  request: AuthorizationRequestMessage;
  acceptedStateTransitionDelay?: number;
  acceptedProofGenerationDelay?: number;
};

export type AuthMessageHandlerOptions = AuthReqOptions | AuthRespOptions;
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
export class AuthHandler
  extends AbstractMessageHandler
  implements IAuthHandler, IProtocolMessageHandler
{
  private readonly _supportedCircuits = [
    CircuitId.AtomicQueryV3,
    CircuitId.AtomicQuerySigV2,
    CircuitId.AtomicQueryMTPV2,
    CircuitId.LinkedMultiQuery10
  ];
  /**
   * Creates an instance of AuthHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IProofService} _proofService -  proof service to verify zk proofs
   *
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _proofService: IProofService
  ) {
    super();
  }

  handle(message: BasicMessage, ctx: AuthMessageHandlerOptions): Promise<BasicMessage | null> {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE:
        return this.handleAuthRequest(
          message as AuthorizationRequestMessage,
          ctx as AuthReqOptions
        );
      case PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE:
        return this.handleAuthResponse(
          message as AuthorizationResponseMessage,
          ctx as AuthRespOptions
        );
      default:
        return super.handle(message, ctx);
    }
  }

  /**
   * @inheritdoc IAuthHandler#parseAuthorizationRequest
   */
  async parseAuthorizationRequest(request: Uint8Array): Promise<AuthorizationRequestMessage> {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const authRequest = message as unknown as AuthorizationRequestMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    authRequest.body.scope = authRequest.body.scope || [];
    return authRequest;
  }

  private async handleAuthRequest(
    authRequest: AuthorizationRequestMessage,
    ctx: AuthReqOptions
  ): Promise<AuthorizationResponseMessage> {
    if (authRequest.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid message type for authorization request');
    }

    // override sender did if it's explicitly specified in the auth request
    const to = authRequest.to ? DID.parse(authRequest.to) : ctx.senderDid;
    const guid = uuid.v4();

    if (!authRequest.from) {
      throw new Error('auth request should contain from field');
    }

    const responseType = PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE;
    const mediaType = this.getSupportedMediaTypeByProfile(
      ctx,
      responseType,
      authRequest.body.accept
    );
    const from = DID.parse(authRequest.from);

    const responseScope = await processZeroKnowledgeProofRequests(
      to,
      authRequest?.body.scope,
      from,
      this._proofService,
      { mediaType, supportedCircuits: this._supportedCircuits }
    );

    return {
      id: guid,
      typ: mediaType,
      type: responseType,
      thid: authRequest.thid ?? guid,
      body: {
        message: authRequest?.body?.message,
        scope: responseScope
      },
      from: to.string(),
      to: authRequest.from
    };
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

    if (!opts) {
      opts = {
        mediaType: MediaType.ZKPMessage
      };
    }

    if (opts.mediaType === MediaType.SignedMessage && !opts.packerOptions) {
      throw new Error(`jws packer options are required for ${MediaType.SignedMessage}`);
    }

    const authResponse = await this.handleAuthRequest(authRequest, {
      senderDid: did,
      mediaType: opts.mediaType
    });

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

  private async handleAuthResponse(
    response: AuthorizationResponseMessage,
    ctx: AuthRespOptions
  ): Promise<BasicMessage | null> {
    const request = ctx.request;
    if (response.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE) {
      throw new Error('Invalid message type for authorization response');
    }
    if ((request.body.message ?? '') !== (response.body.message ?? '')) {
      throw new Error('message for signing from request is not presented in response');
    }

    if (request.from !== response.to) {
      throw new Error(
        `sender of the request is not a target of response - expected ${request.from}, given ${response.to}`
      );
    }

    this.verifyAuthRequest(request);
    const requestScope = request.body.scope || [];
    const responseScope = response.body.scope || [];

    if (!response.from) {
      throw new Error(`proof response doesn't contain from field`);
    }

    const groupIdToLinkIdMap = new Map<number, { linkID: number; requestId: number }[]>();
    // group requests by query group id
    for (const proofRequest of requestScope) {
      const groupId = proofRequest.query.groupId as number;

      const proofResp = responseScope.find((resp) => resp.id === proofRequest.id);
      if (!proofResp) {
        throw new Error(`proof is not given for requestId ${proofRequest.id}`);
      }

      const circuitId = proofResp.circuitId;
      if (circuitId !== proofRequest.circuitId) {
        throw new Error(
          `proof is not given for requested circuit expected: ${proofRequest.circuitId}, given ${circuitId}`
        );
      }

      const params: JSONObject = proofRequest.params ?? {};
      params.verifierDid = DID.parse(request.from);

      const opts = [ctx.acceptedProofGenerationDelay, ctx.acceptedStateTransitionDelay].some(
        (delay) => delay !== undefined
      )
        ? {
            acceptedProofGenerationDelay: ctx.acceptedProofGenerationDelay,
            acceptedStateTransitionDelay: ctx.acceptedStateTransitionDelay
          }
        : undefined;

      const { linkID } = await this._proofService.verifyZKPResponse(proofResp, {
        query: proofRequest.query as unknown as ProofQuery,
        sender: response.from,
        params,
        opts
      });
      // write linkId to the proof response
      // const pubSig = pubSignals as unknown as { linkID?: number };

      if (linkID && groupId) {
        groupIdToLinkIdMap.set(groupId, [
          ...(groupIdToLinkIdMap.get(groupId) ?? []),
          { linkID: linkID, requestId: proofResp.id }
        ]);
      }
    }

    // verify grouping links
    for (const [groupId, metas] of groupIdToLinkIdMap.entries()) {
      // check that all linkIds are the same
      if (metas.some((meta) => meta.linkID !== metas[0].linkID)) {
        throw new Error(
          `Link id validation failed for group ${groupId}, request linkID to requestIds info: ${JSON.stringify(
            metas
          )}`
        );
      }
    }

    return response;
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
    const authResp = (await this.handleAuthResponse(response, {
      request,
      acceptedStateTransitionDelay: opts?.acceptedStateTransitionDelay,
      acceptedProofGenerationDelay: opts?.acceptedProofGenerationDelay
    })) as AuthorizationResponseMessage;

    return { request, response: authResp };
  }

  private verifyAuthRequest(request: AuthorizationRequestMessage) {
    const groupIdValidationMap: { [k: string]: ZeroKnowledgeProofRequest[] } = {};
    const requestScope = request.body.scope || [];
    for (const proofRequest of requestScope) {
      const groupId = proofRequest.query.groupId as number;
      if (groupId) {
        const existingRequests = groupIdValidationMap[groupId] ?? [];

        //validate that all requests in the group have the same schema, issuer and circuit
        for (const existingRequest of existingRequests) {
          if (existingRequest.query.type !== proofRequest.query.type) {
            throw new Error(`all requests in the group should have the same type`);
          }

          if (existingRequest.query.context !== proofRequest.query.context) {
            throw new Error(`all requests in the group should have the same context`);
          }

          const allowedIssuers = proofRequest.query.allowedIssuers as string[];
          const existingRequestAllowedIssuers = existingRequest.query.allowedIssuers as string[];
          if (
            !(
              allowedIssuers.includes('*') ||
              allowedIssuers.every((issuer) => existingRequestAllowedIssuers.includes(issuer))
            )
          ) {
            throw new Error(`all requests in the group should have the same issuer`);
          }
        }
        groupIdValidationMap[groupId] = [...(groupIdValidationMap[groupId] ?? []), proofRequest];
      }
    }
  }

  private getSupportedMediaTypeByProfile(
    ctx: AuthReqOptions,
    responseType: string,
    profile?: string[] | undefined
  ): MediaType {
    let mediaType: MediaType;
    if (profile?.length) {
      const supportedMediaTypes: MediaType[] = [];
      for (const acceptProfile of profile) {
        // 1. check protocol version
        const { protocolVersion, env } = parseAcceptProfile(acceptProfile);
        const responseTypeVersion = Number(responseType.split('/').at(-2));
        if (
          protocolVersion !== ProtocolVersion.V1 ||
          (protocolVersion === ProtocolVersion.V1 &&
            (responseTypeVersion < 1 || responseTypeVersion >= 2))
        ) {
          continue;
        }
        // 2. check packer support
        if (this._packerMgr.isProfileSupported(env, acceptProfile)) {
          supportedMediaTypes.push(env);
        }
      }

      if (!supportedMediaTypes.length) {
        throw new Error('no packer with profile which meets `accept` header requirements');
      }

      mediaType = supportedMediaTypes[0];
      if (ctx.mediaType && supportedMediaTypes.includes(ctx.mediaType)) {
        mediaType = ctx.mediaType;
      }
    } else {
      mediaType = ctx.mediaType || MediaType.ZKPMessage;
    }
    return mediaType;
  }
}
