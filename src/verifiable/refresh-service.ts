import { DID } from '@iden3/js-iden3-core';
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
import { IPackageManager } from '../iden3comm/types';

/**
 * Interface to work with credential refresh service
 *
 * @public
 * @interface   IRefreshService
 */
export interface IRefreshService {
  /**
   * refresh credential
   *
   * @param {Claim} claim - claim to refresh
   * @returns {Promise<W3CCredential>}
   */
  refresh(credential: W3CCredential): Promise<W3CCredential>;
}

/**
 * RefreshServiceOptions contains options for CredentialRefreshService
 * @public
 * @interface   RefreshServiceOptions
 */
export interface RefreshServiceOptions {
  packerManager: IPackageManager;
}

export class CredentialRefreshService implements IRefreshService {
  constructor(private readonly options: RefreshServiceOptions) {}

  async refresh(credential: W3CCredential): Promise<W3CCredential> {
    if (!credential.refreshService) {
      throw new Error('refreshService not specified for W3CCredential');
    }
    if (credential.refreshService.type !== RefreshServiceType.Iden3RefreshService2023) {
      throw new Error(`refresh service type ${credential.refreshService.type} is not supported`);
    }

    const otherIdentifier = credential.credentialSubject.id as string;

    const senderDID = DID.parse(otherIdentifier);

    const zkpParams: ZKPPackerParams = {
      senderDID,
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
    const jwzToken = await this.options.packerManager.pack(
      MediaType.ZKPMessage,
      msgBytes,
      zkpParams
    );
    const resp = await fetch(credential.refreshService.id, {
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
