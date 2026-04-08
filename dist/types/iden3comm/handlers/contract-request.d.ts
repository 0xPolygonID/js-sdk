import { IProofService } from '../../proof/proof-service';
import { BasicMessage, IPackageManager, ZeroKnowledgeProofResponse } from '../types';
import { ContractInvokeRequest } from '../types/protocol/contract-request';
import { DID } from '@iden3/js-iden3-core';
import { IOnChainZKPVerifier } from '../../storage';
import { Signer } from 'ethers';
import { AbstractMessageHandler, BasicHandlerOptions, IProtocolMessageHandler } from './message-handler';
/**
 * Interface that allows the processing of the contract request
 *
 * @beta
 * @interface IContractRequestHandler
 */
export interface IContractRequestHandler {
    /**
     * unpacks contract invoke request
     * @beta
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<ContractInvokeRequest>`
     */
    parseContractInvokeRequest(request: Uint8Array): Promise<ContractInvokeRequest>;
    /**
     * handle contract invoke request
     * @beta
     * @param {did} did  - sender DID
     * @param {Uint8Array} request - raw byte message
     * @param {ContractInvokeHandlerOptions} opts - handler options
     * @returns {Map<string, ZeroKnowledgeProofResponse>}` -  map of transaction hash - ZeroKnowledgeProofResponse
     */
    handleContractInvokeRequest(did: DID, request: Uint8Array, opts?: ContractInvokeHandlerOptions): Promise<Map<string, ZeroKnowledgeProofResponse>>;
}
/** ContractInvokeHandlerOptions represents contract invoke handler options */
export type ContractInvokeHandlerOptions = BasicHandlerOptions & {
    ethSigner: Signer;
    challenge?: bigint;
};
export type ContractMessageHandlerOptions = BasicHandlerOptions & {
    senderDid: DID;
    ethSigner: Signer;
    challenge?: bigint;
};
/**
 *
 * Allows to process ContractInvokeRequest protocol message
 *
 * @beta

 * @class ContractRequestHandler
 * @implements implements IContractRequestHandler interface
 */
export declare class ContractRequestHandler extends AbstractMessageHandler implements IContractRequestHandler, IProtocolMessageHandler {
    private readonly _packerMgr;
    private readonly _proofService;
    private readonly _zkpVerifier;
    private readonly _supportedCircuits;
    /**
     * Creates an instance of ContractRequestHandler.
     * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
     * @param {IProofService} _proofService -  proof service to verify zk proofs
     * @param {IOnChainZKPVerifier} _zkpVerifier - zkp verifier to submit response
     * @param {IOnChainVerifierMultiQuery} _verifierMultiQuery - verifier multi-query to submit response
     *
     */
    constructor(_packerMgr: IPackageManager, _proofService: IProofService, _zkpVerifier: IOnChainZKPVerifier);
    handle(message: BasicMessage, ctx: ContractMessageHandlerOptions): Promise<BasicMessage | null>;
    private handleContractInvoke;
    /**
     * unpacks contract-invoke request
     * @beta
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<ContractInvokeRequest>`
     */
    parseContractInvokeRequest(request: Uint8Array): Promise<ContractInvokeRequest>;
    /**
     * creates contract invoke response
     * @private
     * @beta
     * @param {ContractInvokeRequest} request - ContractInvokeRequest
     * @param { Map<string, ZeroKnowledgeInvokeResponse>} responses - map tx hash to array of ZeroKnowledgeInvokeResponse
     * @returns `Promise<ContractInvokeResponse>`
     */
    private createContractInvokeResponse;
    /**
     * handle contract invoke request
     * supports only 0xb68967e2 method id
     * @beta
     * @deprecated
     * @param {did} did  - sender DID
     * @param {ContractInvokeRequest} request  - contract invoke request
     * @param {ContractInvokeHandlerOptions} opts - handler options
     * @returns {Map<string, ZeroKnowledgeProofResponse>}` - map of transaction hash - ZeroKnowledgeProofResponse
     */
    handleContractInvokeRequest(did: DID, request: Uint8Array, opts: ContractInvokeHandlerOptions): Promise<Map<string, ZeroKnowledgeProofResponse>>;
}
//# sourceMappingURL=contract-request.d.ts.map