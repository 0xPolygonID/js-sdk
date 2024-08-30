import { Signer } from 'ethers';
import { ContractInvokeTransactionData, ZeroKnowledgeProofResponse } from '../../iden3comm';

/**
 * Interface that defines methods for ZKP verifier
 *
 * @beta
 * @interface IOnChainZKPVerifier
 */
export interface IOnChainZKPVerifier {
  /**
   * Submit ZKP Responses to OnChainZKPVerifier contract.
   * @beta
   * @param {Signer} ethSigner - tx signer
   * @param {txData} ContractInvokeTransactionData - transaction data
   * @param {ZeroKnowledgeProofResponse[]} zkProofResponses - zkProofResponses
   * @returns {Promise<Map<string, ZeroKnowledgeProofResponse>>} - map of transaction hash - ZeroKnowledgeProofResponse
   */
  submitZKPResponse(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<string, ZeroKnowledgeProofResponse>>;

  /**
   * Submit ZKP Response V2 to OnChainZKPVerifier contract.
   * @beta
   * @param {Signer} ethSigner - tx signer
   * @param {txData} ContractInvokeTransactionData - transaction data
   * @param {ZeroKnowledgeProofResponse[]} zkProofResponses - zkProofResponses
   * @returns {Promise<Map<string, ZeroKnowledgeProofResponse>>} - map of transaction hash - ZeroKnowledgeProofResponse
   */
  submitZKPResponseV2(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<string>;

  /**
   * Returns the Map of request id to transaction data for the ZKP verifier contract submission.
   * @param txData
   * @param zkProofResponses
   */
  prepareZKPResponseTxData(
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<number, string>>;

  /**
   * Returns transaction data for the ZKP verifier contract submission V2. (one tx call for all responses)
   * @param txData
   * @param zkProofResponses
   */
  prepareZKPResponseV2TxData(
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<string>;
}
