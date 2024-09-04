import { Signer } from 'ethers';
import {
  ContractInvokeTransactionData,
  JsonDocumentObjectValue,
  ZeroKnowledgeProofResponse
} from '../../iden3comm';

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
   * @returns {Promise<Map<string, ZeroKnowledgeProofResponse[]>>} - map of transaction hash - ZeroKnowledgeProofResponse[]
   */
  submitZKPResponseV2(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<string, ZeroKnowledgeProofResponse[]>>;

  /**
   * Returns tx args for the ZKP verifier contract submission (singe tx args for each response).
   * @param txData
   * @param zkProofResponse
   */
  prepareTxArgsSubmitV1(
    txData: ContractInvokeTransactionData,
    zkProofResponse: ZeroKnowledgeProofResponse
  ): Promise<JsonDocumentObjectValue[]>;

  /**
   * Returns args for the ZKP verifier contract submission V2 (single tx args for an array of responses).
   * @param txData
   * @param zkProofResponses
   */
  prepareTxArgsSubmitV2(
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<JsonDocumentObjectValue[]>;
}
