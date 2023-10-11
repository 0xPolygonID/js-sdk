"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractRequestHandler = void 0;
const models_1 = require("../../circuits/models");
const constants_1 = require("../constants");
/**
 *
 * Allows to process ContractInvokeRequest protocol message
 *
 * @beta

 * @class ContractRequestHandler
 * @implements implements IContractRequestHandler interface
 */
class ContractRequestHandler {
    /**
     * Creates an instance of ContractRequestHandler.
     * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
     * @param {IProofService} _proofService -  proof service to verify zk proofs
     * @param {IOnChainZKPVerifier} _zkpVerifier - zkp verifier to submit response
     *
     */
    constructor(_packerMgr, _proofService, _zkpVerifier) {
        this._packerMgr = _packerMgr;
        this._proofService = _proofService;
        this._zkpVerifier = _zkpVerifier;
        this._allowedCircuits = [
            models_1.CircuitId.AtomicQueryMTPV2OnChain,
            models_1.CircuitId.AtomicQuerySigV2OnChain
        ];
    }
    /**
     * unpacks contract-invoke request
     * @beta
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<ContractInvokeRequest>`
     */
    async parseContractInvokeRequest(request) {
        const { unpackedMessage: message } = await this._packerMgr.unpack(request);
        const ciRequest = message;
        if (message.type !== constants_1.PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
            throw new Error('Invalid media type');
        }
        return ciRequest;
    }
    /**
     * handle contract invoker request
     * @beta
     * @param {did} did  - sender DID
     * @param {ContractInvokeRequest} request  - contract invoke request
     * @param {ContractInvokeHandlerOptions} opts - handler options
     * @returns {Map<string, ZeroKnowledgeProofResponse>}` - map of transaction hash - ZeroKnowledgeProofResponse
     */
    async handleContractInvokeRequest(did, request, opts) {
        const ciRequest = await this.parseContractInvokeRequest(request);
        if (ciRequest.type !== constants_1.PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
            throw new Error('Invalid message type for contract invoke request');
        }
        if (!opts.ethSigner) {
            throw new Error("Can't sign transaction. Provide Signer in options.");
        }
        const zkRequests = [];
        for (const proofReq of ciRequest.body.scope) {
            if (!this._allowedCircuits.includes(proofReq.circuitId)) {
                throw new Error(`Can't handle circuit ${proofReq.circuitId}. Only onchain circuits are allowed.`);
            }
            const zkpReq = {
                id: proofReq.id,
                circuitId: proofReq.circuitId,
                query: proofReq.query
            };
            const query = proofReq.query;
            const zkpRes = await this._proofService.generateProof(zkpReq, did, {
                skipRevocation: query.skipClaimRevocationCheck ?? false,
                challenge: opts.challenge
            });
            zkRequests.push(zkpRes);
        }
        return this._zkpVerifier.submitZKPResponse(opts.ethSigner, ciRequest.body.transaction_data, zkRequests);
    }
}
exports.ContractRequestHandler = ContractRequestHandler;
//# sourceMappingURL=contract-request.js.map