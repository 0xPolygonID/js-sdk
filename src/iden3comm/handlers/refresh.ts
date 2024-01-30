import { MediaType } from '../constants';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import {
  CredentialIssuanceMessage,
  CredentialRefreshMessage,
  IPackageManager,
  ZKPPackerParams
} from '../types';

import { RefreshServiceType, W3CCredential } from '../../verifiable';
import { byteEncoder } from '../../utils';
import { proving, ProvingMethodAlg } from '@iden3/js-jwz';
import { DID } from '@iden3/js-iden3-core';
import { ICredentialWallet } from '../../credentials';
import { CircuitId } from '../../circuits';
import * as uuid from 'uuid';

/**
 * RefreshHandlerOptions contains options for RefreshHandler
 * @public
 * @interface   RefreshHandlerOptions
 */
export interface RefreshHandlerOptions {
  packageManager: IPackageManager;
  credentialWallet?: ICredentialWallet;
}

/**
 *
 * RefreshOptions contains options for refreshCredential call
 *
 * @public
 * @interface RefreshOptions
 */
export interface RefreshOptions {
  reason?: string;
}

/**
 * Interface to work with credential refresh handler
 *
 * @public
 * @interface IRefreshHandler
 */
export interface IRefreshHandler {
  /**
   * refresh credential
   *
   * @param {W3CCredential} credential - credential to refresh
   * @param {RefreshOptions} opts - options
   * @returns {Promise<W3CCredential>}
   */
  refreshCredential(credential: W3CCredential, opts?: RefreshOptions): Promise<W3CCredential>;
}
/**
 *
 * Allows to refresh credential from refresh service and return refreshed credential
 *
 * @public

 * @class RefreshHandler
 * @implements implements RefreshHandler interface
 */
export class RefreshHandler implements IRefreshHandler {
  /**
   * Creates an instance of RefreshHandler.
   * @param {RefreshHandlerOptions} _options - refresh handler options
   */
  constructor(private readonly _options: RefreshHandlerOptions) {}

  async refreshCredential(
    credential: W3CCredential,
    opts?: RefreshOptions
  ): Promise<W3CCredential> {
    if (!credential.refreshService) {
      throw new Error('refreshService not specified for W3CCredential');
    }
    if (credential.refreshService.type !== RefreshServiceType.Iden3RefreshService2023) {
      throw new Error(`refresh service type ${credential.refreshService.type} is not supported`);
    }

    const otherIdentifier = credential.credentialSubject.id as string;

    if (!otherIdentifier) {
      throw new Error('self credentials do not support refresh');
    }

    const senderDID = DID.parse(otherIdentifier);

    const zkpParams: ZKPPackerParams = {
      senderDID,
      provingMethodAlg: new ProvingMethodAlg(
        proving.provingMethodGroth16AuthV2Instance.methodAlg.alg,
        CircuitId.AuthV2
      )
    };

    const refreshMsg: CredentialRefreshMessage = {
      id: uuid.v4(),
      typ: MediaType.ZKPMessage,
      type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_REFRESH_MESSAGE_TYPE,
      thid: uuid.v4(),
      body: {
        id: otherIdentifier,
        reason: opts?.reason ?? 'credential is expired'
      },
      from: otherIdentifier,
      to: credential.issuer
    };

    const msgBytes = byteEncoder.encode(JSON.stringify(refreshMsg));
    const jwzToken = await this._options.packageManager.pack(
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

    const respBody: CredentialIssuanceMessage = await resp.json();

    if (!respBody.body?.credential) {
      throw new Error('no credential in CredentialIssuanceMessage response');
    }

    return W3CCredential.fromJSON(respBody.body.credential);
  }
}
