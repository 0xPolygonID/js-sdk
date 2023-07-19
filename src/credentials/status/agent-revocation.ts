import { CredentialStatus, RevocationStatus } from '../../verifiable';
import { CredentialStatusResolver, CredentialStatusResolveOptions } from './resolver';
import {
  RevocationStatusRequestMessage,
  RevocationStatusResponseMessage
} from '../../iden3comm/types';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../iden3comm/constants';
import * as uuid from 'uuid';

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

    const from = credentialStatusResolveOptions.userDID.toString();
    const to = credentialStatusResolveOptions.issuerDID.toString();
    const msg = buildRevocationMessageRequest(from, to, credentialStatus.revocationNonce);
    const response = await fetch(credentialStatus.id, {
      method: 'POST',
      body: JSON.stringify(msg),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const agentResponse = await response.json();
    return Object.assign(new RevocationStatusAgent(), { agentResponse }).toRevocationStatus();
  }
}

function buildRevocationMessageRequest(
  from: string,
  to: string,
  revocationNonce: number
): RevocationStatusRequestMessage {
  const revocationStatusRequestMessage: RevocationStatusRequestMessage = {
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
  return revocationStatusRequestMessage;
}

class RevocationStatusAgent {
  agentResponse: RevocationStatusResponseMessage;

  toRevocationStatus(): RevocationStatus {
    return {
      mtp: this.agentResponse.body.mtp,
      issuer: this.agentResponse.body.issuer
    };
  }
}
