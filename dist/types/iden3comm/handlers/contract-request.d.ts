import { IProofService } from '../../proof/proof-service';
import { IPackageManager, ZeroKnowledgeProofResponse } from '../types';
import { ContractInvokeRequest } from '../types/protocol/contract-request';
import { DID } from '@iden3/js-iden3-core';
import { IOnChainZKPVerifier } from '../../storage';
import { Signer } from 'ethers';
/**
 * Interface that allows the processing of the contract request
 *
 * @beta
 * @interface IContractRequestHandler
 */
export interface IContractRequestHandler {
    /**
     * unpacks contract invoker request
     * @beta
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<ContractInvokeRequest>`
     */
    parseContractInvokeRequest(request: Uint8Array): Promise<ContractInvokeRequest>;
    /**
     * handle contract invoker request
     * @beta
     * @param {did} did  - sender DID
     * @param {Uint8Array} request - raw byte message
     * @param {ContractInvokeHandlerOptions} opts - handler options
     * @returns {Map<string, ZeroKnowledgeProofResponse>}` -  map of transaction hash - ZeroKnowledgeProofResponse
     */
    handleContractInvokeRequest(did: DID, request: Uint8Array, opts?: ContractInvokeHandlerOptions): Promise<Map<string, ZeroKnowledgeProofResponse>>;
}
/** ContractInvokeHandlerOptions represents contract invoke handler options */
export type ContractInvokeHandlerOptions = {
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
export declare class ContractRequestHandler implements IContractRequestHandler {
    private readonly _packerMgr;
    private readonly _proofService;
    private readonly _zkpVerifier;
    private readonly _allowedCircuits;
    /**
     * Creates an instance of ContractRequestHandler.
     * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
     * @param {IProofService} _proofService -  proof service to verify zk proofs
     * @param {IOnChainZKPVerifier} _zkpVerifier - zkp verifier to submit response
     *
     */
    constructor(_packerMgr: IPackageManager, _proofService: IProofService, _zkpVerifier: IOnChainZKPVerifier);
    /**
     * unpacks contract-invoke request
     * @beta
     * @param {Uint8Array} request - raw byte message
     * @returns `Promise<ContractInvokeRequest>`
     */
    parseContractInvokeRequest(request: Uint8Array): Promise<ContractInvokeRequest>;
    /**
     * handle contract invoker request
     * @beta
     * @param {did} did  - sender DID
     * @param {ContractInvokeRequest} request  - contract invoke request
     * @param {ContractInvokeHandlerOptions} opts - handler options
     * @returns {Map<string, ZeroKnowledgeProofResponse>}` - map of transaction hash - ZeroKnowledgeProofResponse
     */
    handleContractInvokeRequest(did: DID, request: Uint8Array, opts: ContractInvokeHandlerOptions): Promise<Map<string, ZeroKnowledgeProofResponse>>;
}
