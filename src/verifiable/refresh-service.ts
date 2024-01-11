import { DID, Claim } from '@iden3/js-iden3-core';
import { PackageManager, ZKPPacker } from '../iden3comm';
import { RefreshServiceType } from './constants';
import {
  CredentialIssuanceMessage,
  CredentialRefreshMessage,
  ZKPPackerParams
} from '../../src/iden3comm/types';
import { proving } from '@iden3/js-jwz';
import { CircuitId } from '../circuits';
import { randomUUID } from 'crypto';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../iden3comm/constants';
import { W3CCredential } from './credential';
import { byteEncoder } from '../utils';

/**
 * RefreshService contains type and id
 * @public
 * @interface   RefreshService
 */
export interface RefreshService {
  id: string;
  type: RefreshServiceType | string;
}

/**
 * Interface to work with credential refresh service
 *
 * @public
 * @interface   IRefreshService
 */
export interface IRefreshService {
  /**
   * load circuit keys by id
   *
   * @param {RefreshService} refreshService - refreshService field from W3C credential
   * @param {DID} userDID - user DIID
   * @param {Claim} claim - claim to refresh
   * @returns `{Promise<CircuitData>}`
   */
  refresh(
    refreshService: RefreshService,
    userDID: DID,
    credential: W3CCredential
  ): Promise<W3CCredential>;
}

/**
 * RefreshServiceOptions contains options for CredentialRefreshService
 * @public
 * @interface   RefreshServiceOptions
 */
export interface RefreshServiceOptions {
  packageManager: PackageManager;
}

export class CredentialRefreshService implements IRefreshService {
  private readonly _opts: RefreshServiceOptions;
  constructor(options: RefreshServiceOptions) {
    this._opts = options;
  }

  async refresh(
    refreshService: RefreshService,
    userDID: DID,
    credential: W3CCredential
  ): Promise<W3CCredential> {
    if (refreshService.type !== RefreshServiceType.Iden3RefreshService2023) {
      throw new Error(`refresh service type ${refreshService.type} is not supported`);
    }

    const otherIdentifier = credential.credentialSubject.id;

    if (userDID.id !== otherIdentifier) {
      throw new Error(
        `userDID id ${userDID.id} does not match claim other identifier ${otherIdentifier}`
      );
    }

    const zkpParams: ZKPPackerParams = {
      senderDID: userDID,
      profileNonce: 0,
      provingMethodAlg: {
        alg: proving.provingMethodGroth16AuthV2Instance.methodAlg.alg,
        circuitId: CircuitId.AuthV2
      }
    };

    const refreshMsg: CredentialRefreshMessage = {
      id: randomUUID(),
      typ: MediaType.ZKPMessage,
      type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_REFRESH_MESSAGE_TYPE,
      thid: randomUUID(),
      body: {
        id: otherIdentifier,
        reason: 'expired'
      },
      from: otherIdentifier,
      to: credential.issuer
    };

    const msgBytes = byteEncoder.encode(JSON.stringify(refreshMsg));
    const jwzToken = await this._opts.packageManager.pack(
      MediaType.ZKPMessage,
      msgBytes,
      zkpParams
    );
    const resp = await fetch(refreshService.id, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jwzToken
    });

    if (resp.status !== 200) {
      throw new Error(`could not refresh W3C credential, return status ${resp.status}`);
    }
    const credIssuanceMsg = resp as unknown as CredentialIssuanceMessage;
    if (!credIssuanceMsg.body?.credential) {
      throw new Error('no credential in CredentialIssuanceMessage response');
    }

    return credIssuanceMsg.body.credential;
  }
}
