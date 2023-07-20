import { MediaType } from '../constants';
import { CircuitId } from '../../circuits/models';
import { IProofService } from '../../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  AuthorizationRequestMessage,
  AuthorizationResponseMessage,
  IPackageManager,
  JWSPackerParams,
  ZeroKnowledgeProofRequest,
  ZeroKnowledgeProofResponse
} from '../types';
import { DID } from '@iden3/js-iden3-core';
import { ProvingMethodAlg, proving } from '@iden3/js-jwz';

import * as uuid from 'uuid';
import { ICredentialWallet } from '../../credentials';
import { ProofQuery, W3CCredential } from '../../verifiable';
import { byteDecoder, byteEncoder } from '../../utils';
import { IIdentityWallet, generateProfileDID } from '../../identity';

/**
 * Interface that allows the processing of the authorization request in the raw format for given identifier
 *
 * @export
 * @beta
 * @interface IAuthHandler
 */
export interface IAuthHandler {
  /**
   * unpacks authorization request
   * @export
   * @beta
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<AuthorizationRequestMessage>`
   */
  parseAuthorizationRequest(request: Uint8Array): Promise<AuthorizationRequestMessage>;

  /**
   * unpacks authorization request
   * @export
   * @beta
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

interface AuthHandlerOptions {
  mediaType: MediaType;
  packerOptions:
    | {
        profileNonce: number;
        provingMethodAlg: ProvingMethodAlg;
      }
    | JWSPackerParams;
  credential?: W3CCredential;
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
   * @param {IIdentityWallet} _identityWallet -  wallet to search profiles and identities
   *
   *
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _proofService: IProofService,
    private readonly _credentialWallet: ICredentialWallet,
    private readonly _identityWallet: IIdentityWallet
  ) {}

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
      const zkpPackerOpts = {
        profileNonce: 0,
        provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg,
        alg: ''
      };

      opts = {
        packerOptions: zkpPackerOpts,
        mediaType: MediaType.ZKPMessage
      };
    }

    const guid = uuid.v4();
    const senderDID =
      opts!.mediaType === MediaType.SignedMessage
        ? did.string()
        : generateProfileDID(did, opts!.packerOptions!.profileNonce).string();
    const authResponse: AuthorizationResponseMessage = {
      id: guid,
      typ: opts!.mediaType,
      type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      thid: authRequest.thid ?? guid,
      body: {
        message: authRequest?.body?.message,
        scope: []
      },
      from: senderDID,
      to: authRequest.from
    };

    for (const proofReq of authRequest.body!.scope) {
      const zkpReq: ZeroKnowledgeProofRequest = {
        id: proofReq.id,
        circuitId: proofReq.circuitId as CircuitId,
        query: proofReq.query
      };

      const query = proofReq.query as unknown as ProofQuery;

      if (opts!.credential) {
        proofReq.query.claimId = opts!.credential.id;
      }

      const { credential, nonce } = await this.findCredentialForDID(did, query);

      const zkpRes: ZeroKnowledgeProofResponse = await this._proofService.generateProof(
        zkpReq,
        did,
        credential,
        {
          credentialSubjectProfileNonce: nonce,
          skipRevocation: query.skipClaimRevocationCheck ?? false,
          authProfileNonce: opts!.packerOptions!.profileNonce
        }
      );

      authResponse.body.scope.push(zkpRes);
    }

    const msgBytes = byteEncoder.encode(JSON.stringify(authResponse));
    const token = byteDecoder.decode(
      await this._packerMgr.pack(opts!.mediaType, msgBytes, {
        senderDID: did,
        ...opts!.packerOptions
      })
    );
    return { authRequest, authResponse, token };
  }
  async findCredentialForDID(
    did: DID,
    query: ProofQuery
  ): Promise<{ credential: W3CCredential; nonce: number }> {
    const creds = await this._credentialWallet.findByQuery(query);
    if (!creds.length) {
      throw new Error(`no credential satisfied query`);
    }

    const profiles = await this._identityWallet.getProfilesByDID(did);

    const ownedCreds = creds.filter((cred) => {
      const credentialSubjectId = cred.credentialSubject['id'] as string; // credential subject
      return (
        credentialSubjectId == did.string() ||
        profiles.some((p) => {
          return p.id === credentialSubjectId;
        })
      );
    });

    if (!ownedCreds.length) {
      throw new Error(`no credentials belong to did ot its profiles`);
    }

    // For EQ / IN / NIN / LT / GT operations selective if credential satisfies query - we can get any.
    // TODO: choose credential for selective credentials
    const cred = query.skipClaimRevocationCheck
      ? ownedCreds[0]
      : (await this._credentialWallet.findNonRevokedCredential(ownedCreds)).cred;

    // get profile nonce that was used as a part of subject in the credential

    let subjectDID = cred.credentialSubject['id'];
    if (!subjectDID) {
      subjectDID = cred.issuer; // self  credential
    }
    const credentialSubjectProfileNonce =
      subjectDID === did.string()
        ? 0
        : profiles.find((p) => {
            return p.id === subjectDID;
          })!.nonce;

    return { credential: cred, nonce: credentialSubjectProfileNonce };
  }
}
