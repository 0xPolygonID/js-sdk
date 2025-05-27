import { Signer } from 'ethers';
import {
  AuthProofResponse,
  ContractInvokeTransactionData,
  JsonDocumentObjectValue,
  ZeroKnowledgeInvokeResponse,
  ZeroKnowledgeProofAuthResponse,
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
   * Submit Response to OnChainZKPVerifier contract.
   * @beta
   * @param {Signer} ethSigner - tx signer
   * @param {txData} ContractInvokeTransactionData - transaction data
   * @param {AuthProofResponse} authResponse - authResponse
   * @param {ZeroKnowledgeProofMultiQueryResponse[]} responses - singleResponses and groupedResponses
   * @param {ZeroKnowledgeProofAuthResponse} [authProof] - authProof in case of authV2
   * @returns {Promise<Map<string, ZeroKnowledgeInvokeResponse>>} - map of transaction hash - ZeroKnowledgeInvokeResponse
   */
  submitResponse(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    authResponse: AuthProofResponse,
    responses: ZeroKnowledgeProofResponse[],
    authProof?: ZeroKnowledgeProofAuthResponse
  ): Promise<Map<string, ZeroKnowledgeInvokeResponse>>;

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

  /**
   * Returns args for the verifier multi-query contract submission (single tx args for an array of responses).
   * @param {txData} ContractInvokeTransactionData - transaction data
   * @param {AuthProofResponse} authResponse - authResponse
   * @param {ZeroKnowledgeProofMultiQueryResponse[]} responses - singleResponses and groupedResponses
   */
  prepareTxArgsSubmit(
    txData: ContractInvokeTransactionData,
    authResponse: AuthProofResponse,
    responses: ZeroKnowledgeProofResponse[]
  ): Promise<JsonDocumentObjectValue[]>;
}
