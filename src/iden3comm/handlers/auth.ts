import { MediaType } from '../constants';
import { IProofService } from '../../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  StateVerificationOpts,
  AuthorizationRequestMessage,
  AuthorizationResponseMessage,
  AuthorizationRequestMessageV2,
  AuthorizationResponseMessageV2,
  VerifiablePresentationV2,
  ZKProofEntry,
  VerifiablePresentation,
  ZeroKnowledgeProofResponse,
  BasicMessage,
  IPackageManager,
  ZeroKnowledgeProofRequest,
  JsonDocumentObject,
  JSONObject,
  Attachment
} from '../types';
import { DID, getUnixTimestamp } from '@iden3/js-iden3-core';
import { ProvingMethodAlg, proving } from '@iden3/js-jwz';

import * as uuid from 'uuid';
import { ProofQuery, VerifiableConstants } from '../../verifiable';
import { byteDecoder, byteEncoder } from '../../utils';
import {
  HandlerPackerParams,
  initDefaultPackerOptions,
  processZeroKnowledgeProofRequests,
  verifyExpiresTime
} from './common';
import { CircuitId, getGroupedCircuitIdsWithSubVersions } from '../../circuits';
import {
  AbstractMessageHandler,
  BasicHandlerOptions,
  IProtocolMessageHandler,
  defaultProvingMethodAlg
} from './message-handler';
import {
  acceptHasProvingMethodAlg,
  buildAcceptFromProvingMethodAlg,
  parseAcceptProfile
} from '../utils';

/**
 * Options to pass to createAuthorizationRequest function
 * @public
 */
export type AuthorizationRequestCreateOptions = {
  accept?: string[];
  scope?: ZeroKnowledgeProofRequest[];
  expires_time?: Date;
  attachments?: Attachment[];
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
    },
    created_time: getUnixTimestamp(new Date()),
    expires_time: opts?.expires_time ? getUnixTimestamp(opts.expires_time) : undefined,
    attachments: opts?.attachments
  };
  return request;
}

/**
 *
 * Options to pass to auth response handler
 *
 * @public
 */
export type AuthResponseHandlerOptions = StateVerificationOpts &
  BasicHandlerOptions & {
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
  bypassProofsCache?: boolean;
  allowExpiredCredentials?: boolean;
};

type AuthRespOptions = {
  request: AuthorizationRequestMessage;
  acceptedStateTransitionDelay?: number;
  acceptedProofGenerationDelay?: number;
};

type AuthRespOptionsV2 = {
  request: AuthorizationRequestMessageV2;
  acceptedStateTransitionDelay?: number;
  acceptedProofGenerationDelay?: number;
};

export type AuthMessageHandlerOptions = BasicHandlerOptions & (AuthReqOptions | AuthRespOptions);
/**
 *
 * Options to pass to auth handler
 *
 * @public
 * @interface AuthHandlerOptions
 */
export type AuthHandlerOptions = BasicHandlerOptions & {
  mediaType: MediaType;
  packerOptions?: HandlerPackerParams;
  preferredAuthProvingMethod?: ProvingMethodAlg;
  bypassProofsCache?: boolean;
  allowExpiredCredentials?: boolean;
};

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
  private readonly _supportedCircuits = Object.values(CircuitId) as CircuitId[];
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
    const mediaType = this.getSupportedMediaTypeByProfile(ctx, authRequest.body.accept);
    const from = DID.parse(authRequest.from);

    const responseScope = await processZeroKnowledgeProofRequests(
      to,
      authRequest?.body.scope,
      from,
      this._proofService,
      {
        mediaType,
        supportedCircuits: this._supportedCircuits,
        bypassProofsCache: ctx.bypassProofsCache,
        allowExpiredCredentials: ctx.allowExpiredCredentials
      }
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
      created_time: getUnixTimestamp(new Date()),
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
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(authRequest);
    }
    if (!opts) {
      opts = {
        mediaType: MediaType.ZKPMessage
      };
    }

    const authResponse = await this.handleAuthRequest(authRequest, {
      senderDid: did,
      mediaType: opts.mediaType,
      bypassProofsCache: opts.bypassProofsCache,
      allowExpiredCredentials: opts.allowExpiredCredentials
    });

    const msgBytes = byteEncoder.encode(JSON.stringify(authResponse));

    const packerOpts = initDefaultPackerOptions(opts.mediaType, opts.packerOptions, {
      provingMethodAlg: this.getDefaultProvingMethodAlg(
        opts.preferredAuthProvingMethod,
        authRequest.body.accept
      ),
      senderDID: did
    });
    const token = byteDecoder.decode(
      await this._packerMgr.pack(opts.mediaType, msgBytes, packerOpts)
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

    const groupIdToLinkIdMap = new Map<number, { linkID: string; requestId: number | string }[]>();
    // group requests by query group id
    for (const proofRequest of requestScope) {
      const groupId = proofRequest.query?.groupId as number;

      const proofResp = responseScope.find(
        (resp) => resp.id.toString() === proofRequest.id.toString()
      );
      if (!proofResp) {
        if (proofRequest.optional) {
          continue;
        }
        throw new Error(`proof is not given for requestId ${proofRequest.id}`);
      }

      const allCircuitsSubversions = getGroupedCircuitIdsWithSubVersions(
        proofRequest.circuitId as CircuitId
      );

      if (!allCircuitsSubversions.includes(proofResp.circuitId as CircuitId)) {
        throw new Error(
          `proof is not given for requested circuit expected: ${allCircuitsSubversions.join(
            ', '
          )}, given ${proofResp.circuitId} `
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
          { linkID: linkID.toString(), requestId: proofResp.id }
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
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(response);
    }
    const authResp = (await this.handleAuthResponse(response, {
      request,
      acceptedStateTransitionDelay: opts?.acceptedStateTransitionDelay,
      acceptedProofGenerationDelay: opts?.acceptedProofGenerationDelay
    })) as AuthorizationResponseMessage;

    return { request, response: authResp };
  }

  private buildVerifiablePresentationsV2(
    requestScope: ZeroKnowledgeProofRequest[],
    responses: ZeroKnowledgeProofResponse[]
  ): VerifiablePresentationV2[] {
    const responseById = new Map<string, ZeroKnowledgeProofResponse>(
      responses.map((r) => [r.id.toString(), r])
    );

    // Preserve insertion order: first occurrence of each key determines position
    const groupKeys: string[] = [];
    const groups = new Map<string, ZeroKnowledgeProofRequest[]>();
    for (const req of requestScope) {
      const groupId = req.query?.groupId;
      const key = groupId ? `group:${groupId}` : `single:${req.id}`;
      if (!groups.has(key)) {
        groupKeys.push(key);
        groups.set(key, []);
      }
      groups.get(key)?.push(req);
    }

    const W3C_BASE = VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018;
    const vps: VerifiablePresentationV2[] = [];

    for (const key of groupKeys) {
      const groupRequests = groups.get(key) ?? [];
      const firstReq = groupRequests[0];
      if (!firstReq.query) continue;

      const context = firstReq.query.context as string;
      const credentialType = firstReq.query.type as string;

      // Merge SD fields from all proofs in the group into one credentialSubject
      let mergedCredentialSubject: JsonDocumentObject = { type: credentialType };
      for (const req of groupRequests) {
        const resp = responseById.get(req.id.toString());
        if (resp?.vp) {
          mergedCredentialSubject = {
            ...mergedCredentialSubject,
            ...resp.vp.verifiableCredential.credentialSubject
          };
        }
      }

      const proofs: ZKProofEntry[] = groupRequests.reduce<ZKProofEntry[]>((acc, req) => {
        const resp = responseById.get(req.id.toString());
        if (!resp) return acc;
        acc.push({
          requestId: req.id,
          circuitId: resp.circuitId,
          proof: resp.proof,
          pub_signals: resp.pub_signals
        });
        return acc;
      }, []);

      vps.push({
        '@context': [W3C_BASE, context],
        type: ['VerifiablePresentation'],
        verifiableCredential: {
          '@context': [W3C_BASE, context],
          type: ['VerifiableCredential', credentialType],
          credentialSubject: mergedCredentialSubject
        },
        proofs
      });
    }

    return vps;
  }

  private reconstructPerProofVP(
    req: ZeroKnowledgeProofRequest,
    parentVP: VerifiablePresentationV2
  ): VerifiablePresentation | undefined {
    const credSubject = req.query?.credentialSubject as Record<string, unknown> | undefined;
    if (!credSubject) return undefined;

    const sdFields = Object.entries(credSubject)
      .filter(([, v]) => typeof v === 'object' && Object.keys(v as object).length === 0)
      .map(([k]) => k);

    if (!sdFields.length) return undefined;

    const merged = parentVP.verifiableCredential.credentialSubject;
    const filtered: JsonDocumentObject = { type: merged['type'] as string };
    for (const field of sdFields) {
      if (field in merged) filtered[field] = merged[field];
    }

    return {
      '@context': parentVP['@context'],
      type: Array.isArray(parentVP.type) ? parentVP.type[0] : parentVP.type,
      verifiableCredential: {
        '@context': parentVP.verifiableCredential['@context'],
        type: parentVP.verifiableCredential.type,
        credentialSubject: filtered
      }
    };
  }

  private async handleAuthRequestV2(
    authRequest: AuthorizationRequestMessageV2,
    ctx: AuthReqOptions
  ): Promise<AuthorizationResponseMessageV2> {
    if (authRequest.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE_V2) {
      throw new Error('Invalid message type for v2 authorization request');
    }

    const to = authRequest.to ? DID.parse(authRequest.to) : ctx.senderDid;
    const guid = uuid.v4();

    if (!authRequest.from) {
      throw new Error('auth request should contain from field');
    }

    const mediaType = this.getSupportedMediaTypeByProfile(ctx, authRequest.body.accept);
    const from = DID.parse(authRequest.from);

    const scopeResponses = await processZeroKnowledgeProofRequests(
      to,
      authRequest.body.scope,
      from,
      this._proofService,
      {
        mediaType,
        supportedCircuits: this._supportedCircuits,
        bypassProofsCache: ctx.bypassProofsCache,
        allowExpiredCredentials: ctx.allowExpiredCredentials
      }
    );

    const vp = this.buildVerifiablePresentationsV2(authRequest.body.scope ?? [], scopeResponses);

    return {
      id: guid,
      typ: mediaType,
      type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE_V2,
      thid: authRequest.thid ?? guid,
      body: {
        message: authRequest.body.message,
        vp
      },
      created_time: getUnixTimestamp(new Date()),
      from: to.string(),
      to: authRequest.from
    };
  }

  async handleAuthorizationRequestV2(
    did: DID,
    request: Uint8Array,
    opts?: AuthHandlerOptions
  ): Promise<{
    token: string;
    authRequest: AuthorizationRequestMessageV2;
    authResponse: AuthorizationResponseMessageV2;
  }> {
    const { unpackedMessage } = await this._packerMgr.unpack(request);
    const authRequest = unpackedMessage as unknown as AuthorizationRequestMessageV2;

    if (authRequest.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE_V2) {
      throw new Error('Invalid message type for v2 authorization request');
    }

    authRequest.body.scope = authRequest.body.scope ?? [];

    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(authRequest);
    }
    if (!opts) {
      opts = { mediaType: MediaType.ZKPMessage };
    }

    const authResponse = await this.handleAuthRequestV2(authRequest, {
      senderDid: did,
      mediaType: opts.mediaType,
      bypassProofsCache: opts.bypassProofsCache,
      allowExpiredCredentials: opts.allowExpiredCredentials
    });

    const msgBytes = byteEncoder.encode(JSON.stringify(authResponse));
    const packerOpts = initDefaultPackerOptions(opts.mediaType, opts.packerOptions, {
      provingMethodAlg: this.getDefaultProvingMethodAlg(
        opts.preferredAuthProvingMethod,
        authRequest.body.accept
      ),
      senderDID: did
    });
    const token = byteDecoder.decode(
      await this._packerMgr.pack(opts.mediaType, msgBytes, packerOpts)
    );

    return { authRequest, authResponse, token };
  }

  private async handleAuthResponseV2(
    response: AuthorizationResponseMessageV2,
    ctx: AuthRespOptionsV2
  ): Promise<AuthorizationResponseMessageV2> {
    const request = ctx.request;

    if (response.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE_V2) {
      throw new Error('Invalid message type for v2 authorization response');
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

    // Build lookup: requestId → { proofEntry, parentVP }
    const proofByRequestId = new Map<
      string,
      { entry: ZKProofEntry; parentVP: VerifiablePresentationV2 }
    >();
    for (const vp of response.body.vp) {
      for (const entry of vp.proofs) {
        proofByRequestId.set(entry.requestId.toString(), { entry, parentVP: vp });
      }
    }

    const groupIdToLinkIdMap = new Map<number, { linkID: string; requestId: number | string }[]>();

    for (const proofRequest of request.body.scope ?? []) {
      const found = proofByRequestId.get(proofRequest.id.toString());
      if (!found) {
        if (proofRequest.optional) continue;
        throw new Error(`proof is not given for requestId ${proofRequest.id}`);
      }

      const { entry, parentVP } = found;
      const allCircuitsSubversions = getGroupedCircuitIdsWithSubVersions(
        proofRequest.circuitId as CircuitId
      );
      if (!allCircuitsSubversions.includes(entry.circuitId as CircuitId)) {
        throw new Error(
          `proof is not given for requested circuit expected: ${allCircuitsSubversions.join(
            ', '
          )}, given ${entry.circuitId}`
        );
      }

      const reconstructedResp: ZeroKnowledgeProofResponse = {
        id: proofRequest.id,
        circuitId: entry.circuitId,
        proof: entry.proof,
        pub_signals: entry.pub_signals,
        vp: this.reconstructPerProofVP(proofRequest, parentVP)
      };

      const params: JSONObject = proofRequest.params ?? {};
      params.verifierDid = DID.parse(request.from);

      const opts = [ctx.acceptedProofGenerationDelay, ctx.acceptedStateTransitionDelay].some(
        (d) => d !== undefined
      )
        ? {
            acceptedProofGenerationDelay: ctx.acceptedProofGenerationDelay,
            acceptedStateTransitionDelay: ctx.acceptedStateTransitionDelay
          }
        : undefined;

      const { linkID } = await this._proofService.verifyZKPResponse(reconstructedResp, {
        query: proofRequest.query as unknown as ProofQuery,
        sender: response.from,
        params,
        opts
      });

      const groupId = proofRequest.query?.groupId as number;
      if (linkID && groupId) {
        groupIdToLinkIdMap.set(groupId, [
          ...(groupIdToLinkIdMap.get(groupId) ?? []),
          { linkID: linkID.toString(), requestId: proofRequest.id }
        ]);
      }
    }

    for (const [groupId, metas] of groupIdToLinkIdMap.entries()) {
      if (metas.some((meta) => meta.linkID !== metas[0].linkID)) {
        throw new Error(`Link id validation failed for group ${groupId}: ${JSON.stringify(metas)}`);
      }
    }

    return response;
  }

  async handleAuthorizationResponseV2(
    response: AuthorizationResponseMessageV2,
    request: AuthorizationRequestMessageV2,
    opts?: AuthResponseHandlerOptions
  ): Promise<{
    request: AuthorizationRequestMessageV2;
    response: AuthorizationResponseMessageV2;
  }> {
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(response);
    }
    const verified = await this.handleAuthResponseV2(response, {
      request,
      acceptedStateTransitionDelay: opts?.acceptedStateTransitionDelay,
      acceptedProofGenerationDelay: opts?.acceptedProofGenerationDelay
    });
    return { request, response: verified };
  }

  private verifyAuthRequest(request: { body: { scope?: ZeroKnowledgeProofRequest[] } }) {
    const groupIdValidationMap: { [k: string]: ZeroKnowledgeProofRequest[] } = {};
    const requestScope = request.body.scope || [];
    for (const proofRequest of requestScope) {
      const proofQuery = proofRequest.query;
      if (!proofQuery) {
        continue;
      }
      const groupId = proofQuery.groupId as number;
      if (groupId) {
        const existingRequests = groupIdValidationMap[groupId] ?? [];

        //validate that all requests in the group have the same schema, issuer and circuit
        for (const existingRequest of existingRequests) {
          const existingProofQuery = existingRequest.query;
          if (!existingProofQuery) {
            continue;
          }

          if (existingProofQuery.type !== proofQuery?.type) {
            throw new Error(`all requests in the group should have the same type`);
          }

          if (existingProofQuery.context !== proofQuery?.context) {
            throw new Error(`all requests in the group should have the same context`);
          }

          const allowedIssuers = proofQuery?.allowedIssuers as string[];
          const existingRequestAllowedIssuers = existingProofQuery.allowedIssuers as string[];
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
    profile?: string[] | undefined
  ): MediaType {
    let mediaType: MediaType;
    if (!profile?.length) {
      return ctx.mediaType || MediaType.ZKPMessage;
    }
    const supportedMediaTypes: MediaType[] = [];
    for (const acceptProfile of profile) {
      const { env } = parseAcceptProfile(acceptProfile);
      if (this._packerMgr.isProfileSupported(env, acceptProfile)) {
        supportedMediaTypes.push(env);
      }
    }

    if (!supportedMediaTypes.length) {
      throw new Error('no packer with profile which meets `accept` header requirements');
    }

    mediaType = supportedMediaTypes.includes(MediaType.ZKPMessage)
      ? MediaType.ZKPMessage
      : supportedMediaTypes[0];
    if (ctx.mediaType && supportedMediaTypes.includes(ctx.mediaType)) {
      mediaType = ctx.mediaType;
    }
    return mediaType;
  }

  private getDefaultProvingMethodAlg(
    preferredAuthProvingMethod?: ProvingMethodAlg,
    accept?: string[]
  ): ProvingMethodAlg {
    // if no accept is given, return default
    if (!accept?.length) {
      return defaultProvingMethodAlg;
    }

    const preferredOrder = [
      proving.provingMethodGroth16AuthV3_8_32Instance.methodAlg,
      proving.provingMethodGroth16AuthV3Instance.methodAlg
    ];
    if (preferredAuthProvingMethod) {
      const idx = preferredOrder.indexOf(preferredAuthProvingMethod);
      if (idx !== -1) {
        preferredOrder.splice(idx, 1);
      }
      preferredOrder.unshift(preferredAuthProvingMethod);
    }

    for (const methodAlg of preferredOrder) {
      if (
        this._packerMgr.isProfileSupported(
          MediaType.ZKPMessage,
          buildAcceptFromProvingMethodAlg(methodAlg)
        ) &&
        acceptHasProvingMethodAlg(accept, methodAlg)
      ) {
        return methodAlg;
      }
    }

    return defaultProvingMethodAlg;
  }
}
