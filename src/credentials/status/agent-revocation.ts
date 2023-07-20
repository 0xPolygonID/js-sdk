import { CredentialStatus, RevocationStatus } from '../../verifiable';
import { CredentialStatusResolver, CredentialStatusResolveOptions } from './resolver';
import {
  RevocationStatusRequestMessage,
  RevocationStatusResponseMessage
} from '../../iden3comm/types';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../iden3comm/constants';
import * as uuid from 'uuid';

/**
 * AgentResolver is a class that allows to interact with the issuer's agent to get revocation status.
 *
 * @export
 * @beta
 * @class AgentResolver
 */
export class AgentResolver implements CredentialStatusResolver {
  async resolve(
    credentialStatus: CredentialStatus,
    credentialStatusResolveOptions?: CredentialStatusResolveOptions
  ): Promise<RevocationStatus> {
    if (!credentialStatusResolveOptions?.issuerDID) {
      throw new Error('IssuerDID is not set in options');
    }
    if (!credentialStatusResolveOptions?.userDID) {
      throw new Error('UserDID is not set in options');
    }

    if (!credentialStatus.revocationNonce) {
      throw new Error('Revocation nonce is not set in credential status');
    }

    const from = credentialStatusResolveOptions.userDID.string();
    const to = credentialStatusResolveOptions.issuerDID.string();
    const msg = buildRevocationMessageRequest(from, to, credentialStatus.revocationNonce);
    const response = await fetch(credentialStatus.id, {
      method: 'POST',
      body: JSON.stringify(msg),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const agentResponse: RevocationStatusResponseMessage = await response.json();
    return toRevocationStatus(agentResponse);
  }
}

function buildRevocationMessageRequest(
  from: string,
  to: string,
  revocationNonce: number
): RevocationStatusRequestMessage {
  return {
    id: uuid.v4(),
    typ: MediaType.PlainMessage,
    type: PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_REQUEST_MESSAGE_TYPE,
    body: {
      revocation_nonce: revocationNonce
    },
    thid: uuid.v4(),
    from: from,
    to: to
  };
}

function toRevocationStatus(revocationResponse: RevocationStatusResponseMessage): RevocationStatus {
  if (!revocationResponse.body?.mtp) {
    throw new Error('Revocation status response does not contain mtp');
  }
  if (!revocationResponse.body?.issuer) {
    throw new Error('Revocation status response does not contain issuer');
  }
  return {
    mtp: revocationResponse.body.mtp,
    issuer: revocationResponse.body.issuer
  };
}
