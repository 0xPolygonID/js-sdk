import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../iden3comm/constants';
import * as uuid from 'uuid';
import { toRevocationStatus } from './sparse-merkle-tree';
/**
 * AgentResolver is a class that allows to interact with the issuer's agent to get revocation status.
 *
 * @public
 * @class AgentResolver
 */
export class AgentResolver {
    /**
     * resolve is a method to resolve a credential status from an agent.
     *
     * @public
     * @param {CredentialStatus} credentialStatus -  credential status to resolve
     * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
     * @returns `{Promise<RevocationStatus>}`
     */
    async resolve(credentialStatus, credentialStatusResolveOptions) {
        if (!credentialStatusResolveOptions?.issuerDID) {
            throw new Error('IssuerDID is not set in options');
        }
        if (!credentialStatusResolveOptions?.userDID) {
            throw new Error('UserDID is not set in options');
        }
        if (typeof credentialStatus.revocationNonce !== 'number') {
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
        const agentResponse = await response.json();
        return toRevocationStatus(agentResponse.body);
    }
}
function buildRevocationMessageRequest(from, to, revocationNonce) {
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
//# sourceMappingURL=agent-revocation.js.map