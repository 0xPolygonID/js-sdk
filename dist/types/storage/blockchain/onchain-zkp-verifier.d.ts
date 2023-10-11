import { Signer } from 'ethers';
import { EthConnectionConfig } from './state';
import { IOnChainZKPVerifier } from '../interfaces/onchain-zkp-verifier';
import { ContractInvokeTransactionData, ZeroKnowledgeProofResponse } from '../../iden3comm';
/**
 * OnChainZKPVerifier is a class that allows to interact with the OnChainZKPVerifier contract
 * and submitZKPResponse.
 *
 * @beta
 * @class OnChainZKPVerifier
 */
export declare class OnChainZKPVerifier implements IOnChainZKPVerifier {
    private readonly _configs;
    /**
     * solidity identifier for function signature:
     * function submitZKPResponse(uint64 requestId, uint256[] calldata inputs,
     * uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c) public
     */
    private readonly _supportedMethodId;
    /**
     *
     * Creates an instance of OnChainZKPVerifier.
     * @beta
     * @param {EthConnectionConfig[]} - array of ETH configs
     */
    constructor(_configs: EthConnectionConfig[]);
    /**
     * Submit ZKP Responses to OnChainZKPVerifier contract.
     * @beta
     * @param {Signer} ethSigner - tx signer
     * @param {txData} ContractInvokeTransactionData - transaction data
     * @param {ZeroKnowledgeProofResponse[]} zkProofResponses - zkProofResponses
     * @returns {Promise<Map<string, ZeroKnowledgeProofResponse>>} - map of transaction hash - ZeroKnowledgeProofResponse
     */
    submitZKPResponse(ethSigner: Signer, txData: ContractInvokeTransactionData, zkProofResponses: ZeroKnowledgeProofResponse[]): Promise<Map<string, ZeroKnowledgeProofResponse>>;
}
