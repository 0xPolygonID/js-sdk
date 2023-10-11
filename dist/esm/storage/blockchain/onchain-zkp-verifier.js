import abi from './zkp-verifier-abi.json';
import { ethers } from 'ethers';
/**
 * OnChainZKPVerifier is a class that allows to interact with the OnChainZKPVerifier contract
 * and submitZKPResponse.
 *
 * @beta
 * @class OnChainZKPVerifier
 */
export class OnChainZKPVerifier {
    /**
     *
     * Creates an instance of OnChainZKPVerifier.
     * @beta
     * @param {EthConnectionConfig[]} - array of ETH configs
     */
    constructor(_configs) {
        this._configs = _configs;
        /**
         * solidity identifier for function signature:
         * function submitZKPResponse(uint64 requestId, uint256[] calldata inputs,
         * uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c) public
         */
        this._supportedMethodId = 'b68967e2';
    }
    /**
     * Submit ZKP Responses to OnChainZKPVerifier contract.
     * @beta
     * @param {Signer} ethSigner - tx signer
     * @param {txData} ContractInvokeTransactionData - transaction data
     * @param {ZeroKnowledgeProofResponse[]} zkProofResponses - zkProofResponses
     * @returns {Promise<Map<string, ZeroKnowledgeProofResponse>>} - map of transaction hash - ZeroKnowledgeProofResponse
     */
    async submitZKPResponse(ethSigner, txData, zkProofResponses) {
        const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
        if (!chainConfig) {
            throw new Error(`config for chain id ${txData.chain_id} was not found`);
        }
        if (txData.method_id.replace('0x', '') !== this._supportedMethodId) {
            throw new Error(`submit doesn't implement requested method id. Only '0x${this._supportedMethodId}' is supported.`);
        }
        const provider = new ethers.providers.JsonRpcProvider(chainConfig);
        const verifierContract = new ethers.Contract(txData.contract_address, abi, provider);
        ethSigner = ethSigner.connect(provider);
        const contract = verifierContract.connect(ethSigner);
        const response = new Map();
        for (const zkProof of zkProofResponses) {
            const requestID = zkProof.id;
            const inputs = zkProof.pub_signals;
            const payload = [
                requestID,
                inputs,
                zkProof.proof.pi_a.slice(0, 2),
                [
                    [zkProof.proof.pi_b[0][1], zkProof.proof.pi_b[0][0]],
                    [zkProof.proof.pi_b[1][1], zkProof.proof.pi_b[1][0]]
                ],
                zkProof.proof.pi_c.slice(0, 2)
            ];
            const tx = await contract.submitZKPResponse(...payload);
            const txnReceipt = await tx.wait();
            const status = txnReceipt.status;
            const txnHash = txnReceipt.transactionHash;
            if (status === 0) {
                throw new Error(`transaction: ${txnHash} failed to mined`);
            }
            response.set(txnHash, zkProof);
        }
        return response;
    }
}
//# sourceMappingURL=onchain-zkp-verifier.js.map