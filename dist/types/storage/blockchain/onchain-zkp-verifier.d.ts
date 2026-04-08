import { Signer } from 'ethers';
import { EthConnectionConfig } from './state';
import { IOnChainZKPVerifier } from '../interfaces/onchain-zkp-verifier';
import { AuthMethod, AuthProof, ContractInvokeTransactionData, CrossChainProof, JsonDocumentObjectValue, ZeroKnowledgeInvokeResponse, ZeroKnowledgeProofResponse } from '../../iden3comm';
import { DID } from '@iden3/js-iden3-core';
import { GlobalStateUpdate } from '../entities/state';
/**
 * Supported function signature for SubmitZKPResponse
 */
export declare enum FunctionSignatures {
    /**
     * solidity identifier for function signature:
     * function submitZKPResponse(uint64 requestId, uint256[] calldata inputs,
     * uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c) public
     */
    SubmitZKPResponseV1 = "b68967e2",
    SubmitZKPResponseV2 = "ade09fcd",
    SubmitResponse = "06c86a91"
}
/**
 * OnChainZKPVerifierOptions represents OnChainZKPVerifier options
 */
export type OnChainZKPVerifierOptions = {
    didResolverUrl?: string;
};
type ProofPreparationResult = {
    requestId: string | number;
    proof: ZeroKnowledgeProofResponse;
    encoded: string;
    metadata: string;
};
export type TxPreparationResultSubmitResponse = {
    authProof: {
        raw: AuthProof;
        encoded: string;
    };
    crossChainProof: {
        raw: CrossChainProof;
        encoded: string;
    };
    proofs: ProofPreparationResult[];
};
export declare const toTxDataArgs: (res: TxPreparationResultSubmitResponse) => (string | {
    requestId: string | number;
    proof: string;
    metadata: string;
}[] | {
    authMethod: AuthMethod;
    proof: string;
})[];
/**
 * OnChainZKPVerifier is a class that allows to interact with the OnChainZKPVerifier contract
 * and submitZKPResponse.
 *
 * @beta
 * @class OnChainZKPVerifier
 */
export declare class OnChainZKPVerifier implements IOnChainZKPVerifier {
    private readonly _configs;
    private readonly _opts?;
    /**
     * supported circuits
     */
    private static readonly _supportedCircuits;
    /**
     *
     * Creates an instance of OnChainZKPVerifier.
     * @beta
     * @param {EthConnectionConfig[]} - array of ETH configs
     */
    constructor(_configs: EthConnectionConfig[], _opts?: OnChainZKPVerifierOptions | undefined);
    static prepareTxArgsSubmitV1(txData: ContractInvokeTransactionData, zkProofResponse: ZeroKnowledgeProofResponse): Promise<JsonDocumentObjectValue[]>;
    /**
     * {@inheritDoc IOnChainZKPVerifier.prepareTxArgsSubmitV1}
     */
    prepareTxArgsSubmitV1(txData: ContractInvokeTransactionData, zkProofResponse: ZeroKnowledgeProofResponse): Promise<JsonDocumentObjectValue[]>;
    /**
     * {@inheritDoc IOnChainZKPVerifier.submitZKPResponse}
     */
    submitZKPResponse(ethSigner: Signer, txData: ContractInvokeTransactionData, zkProofResponses: ZeroKnowledgeProofResponse[]): Promise<Map<string, ZeroKnowledgeProofResponse>>;
    /**
     * {@inheritDoc IOnChainZKPVerifier.submitZKPResponseV2}
     */
    submitZKPResponseV2(ethSigner: Signer, txData: ContractInvokeTransactionData, zkProofResponses: ZeroKnowledgeProofResponse[]): Promise<Map<string, ZeroKnowledgeProofResponse[]>>;
    /**
     * {@inheritDoc IOnChainVerifierMultiQuery.submitResponse}
     */
    submitResponse(ethSigner: Signer, txData: ContractInvokeTransactionData, responses: ZeroKnowledgeProofResponse[], authProof: AuthProof): Promise<Map<string, ZeroKnowledgeInvokeResponse>>;
    static prepareTxArgsSubmit(resolverUrl: string, txData: ContractInvokeTransactionData, responses: ZeroKnowledgeProofResponse[], authProof: AuthProof): Promise<{
        result: TxPreparationResultSubmitResponse;
        txDataArgs: JsonDocumentObjectValue[];
    }>;
    prepareTxArgsSubmit(txData: ContractInvokeTransactionData, responses: ZeroKnowledgeProofResponse[], authProof: AuthProof): Promise<{
        result: TxPreparationResultSubmitResponse;
        txDataArgs: JsonDocumentObjectValue[];
    }>;
    private static checkSupportedCircuit;
    private static getCrossChainResolvers;
    static prepareTxArgsSubmitV2(resolverUrl: string, txData: ContractInvokeTransactionData, zkProofResponses: ZeroKnowledgeProofResponse[]): Promise<JsonDocumentObjectValue[]>;
    prepareTxArgsSubmitV2(txData: ContractInvokeTransactionData, zkProofResponses: ZeroKnowledgeProofResponse[]): Promise<JsonDocumentObjectValue[]>;
    private static getUpdateResolutions;
    private static packCrossChainProofs;
    static packGlobalStateMsg(msg: GlobalStateUpdate): string;
    private static packIdentityStateMsg;
    private static getOnChainGistRootStatePubSignals;
    private static resolveDidDocumentEip712MessageAndSignature;
}
/**
 * Packs an Ethereum identity proof from a Decentralized Identifier (DID).
 * @param did - Decentralized Identifier (DID) to pack.
 * @returns A hexadecimal string representing the packed DID identity proof.
 */
export declare const packEthIdentityProof: (did: DID) => string;
export {};
//# sourceMappingURL=onchain-zkp-verifier.d.ts.map