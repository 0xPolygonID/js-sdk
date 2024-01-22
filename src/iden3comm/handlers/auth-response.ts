import { DID } from '@iden3/js-iden3-core';
import { DocumentLoader } from '@iden3/js-jsonld-merklization';
import { CircuitId, Query } from '../../circuits';
import { Circuits } from '../../circuits/pub-signal-verifier';
import { IProofService } from '../../proof';
import { StateResolvers } from '../../storage/interfaces/resolver';
import {
  AuthorizationRequestMessage,
  AuthorizationResponseMessage,
  IPackageManager
} from '../types';

/**
 * Interface that allows the processing of the authorization response for given identifier
 *
 * @public
 * @interface IAuthResponseHandler
 */
export interface IAuthResponseHandler {
  /**
     * handle authorization response
     * @public
     * @param {AuthorizationRequestMessage} request  - auth request
     * @param {AuthorizationResponseMessage} response  - auth response
     * @param {AuthResponseHandlerOptions} opts - options
     * @returns `Promise<{
      request: AuthorizationRequestMessage;
      response: AuthorizationResponseMessage;
    }>`
     */
  handleAuthorizationResponse(
    request: AuthorizationRequestMessage,
    response: AuthorizationResponseMessage,
    opts?: AuthResponseHandlerOptions
  ): Promise<{
    request: AuthorizationRequestMessage;
    response: AuthorizationResponseMessage;
  }>;
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
 *
 * Allows to process AuthorizationResponse protocol message and produce JWZ response.
 *
 * @public

 * @class AuthHandler
 * @implements implements IAuthHandler interface
 */
export class AuthResponseHandler implements IAuthResponseHandler {
  /**
   * Creates an instance of AuthHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IProofService} _proofService -  proof service to verify zk proofs
   * @param {DocumentLoader} _schemaLoader - schema loader
   * @param {StateResolvers} resolvers - state resolvers instances
   *
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _proofService: IProofService,
    private readonly _schemaLoader: DocumentLoader,
    private readonly _stateResolvers: StateResolvers
  ) {}

  async handleAuthorizationResponse(
    request: AuthorizationRequestMessage,
    response: AuthorizationResponseMessage,
    opts?: AuthResponseHandlerOptions | undefined
  ): Promise<{
    request: AuthorizationRequestMessage;
    response: AuthorizationResponseMessage;
  }> {
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
        proofRequest.query as unknown as Query,
        this._schemaLoader,
        proofResp.vp as JSON,
        opts,
        params
      );

      // verify states

      await verifier.verifyStates(this._stateResolvers, opts);

      if (!response.from) {
        throw new Error(`proof response doesn't contain from field`);
      }

      // verify id ownership
      await verifier.verifyIdOwnership(response.from, BigInt(proofResp.id));
    }

    return Promise.resolve({ request, response });
  }
}
