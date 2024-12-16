import { Signer } from 'ethers';
import {
  AuthProofResponse,
  ContractInvokeTransactionData,
  JsonDocumentObjectValue,
  ZeroKnowledgeProofResponse,
} from '../../iden3comm';

/**
 * Interface that defines methods for verifier multi-query
 *
 * @beta
 * @interface IOnChainVerifierMultiQuery
 */
export interface IOnChainVerifierMultiQuery {
  /**
   * Submit Response to OnChainVerifierMultiQuery contract.
   * @beta
   * @param {Signer} ethSigner - tx signer
   * @param {txData} ContractInvokeTransactionData - transaction data
   * @param {AuthProofResponse[]} authResponses - authResponses
   * @param {ZeroKnowledgeProofMultiQueryResponse[]} responses - singleResponses and groupedResponses
   * @returns {Promise<Map<string, ZeroKnowledgeProofMultiQueryResponse[]>>} - map of transaction hash - ZeroKnowledgeProofResponse[]
   */
  submitResponse(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    authResponses: AuthProofResponse[],
    responses: ZeroKnowledgeProofResponse[],
  ): Promise<Map<string, ZeroKnowledgeProofResponse[]>>;

  /**
   * Returns args for the verifier multi-query contract submission (single tx args for an array of responses).
   * @param {txData} ContractInvokeTransactionData - transaction data
   * @param {AuthProofResponse[]} authResponses - authResponses
   * @param {ZeroKnowledgeProofMultiQueryResponse[]} responses - singleResponses and groupedResponses
   */
  prepareTxArgsSubmit(
    txData: ContractInvokeTransactionData,
    authResponses: AuthProofResponse[],
    responses: ZeroKnowledgeProofResponse[],
  ): Promise<JsonDocumentObjectValue[]>;
}
