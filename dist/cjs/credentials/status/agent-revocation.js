"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentResolver = void 0;
const constants_1 = require("../../iden3comm/constants");
const uuid = __importStar(require("uuid"));
const sparse_merkle_tree_1 = require("./sparse-merkle-tree");
/**
 * AgentResolver is a class that allows to interact with the issuer's agent to get revocation status.
 *
 * @public
 * @class AgentResolver
 */
class AgentResolver {
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
        return (0, sparse_merkle_tree_1.toRevocationStatus)(agentResponse.body);
    }
}
exports.AgentResolver = AgentResolver;
function buildRevocationMessageRequest(from, to, revocationNonce) {
    return {
        id: uuid.v4(),
        typ: constants_1.MediaType.PlainMessage,
        type: constants_1.PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_REQUEST_MESSAGE_TYPE,
        body: {
            revocation_nonce: revocationNonce
        },
        thid: uuid.v4(),
        from: from,
        to: to
    };
}
//# sourceMappingURL=agent-revocation.js.map