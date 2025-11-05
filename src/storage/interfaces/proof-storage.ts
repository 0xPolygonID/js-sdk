import { ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from '../../iden3comm';

/**
 * Interface that defines methods for zkp proof storage
 *
 * @public
 * @interface   IProofStorage
 */
export interface IProofStorage {
  /**
   * gets cached proof
   *
   * @param request - ZeroKnowledgeProofRequest
   * @returns `Promise<ZeroKnowledgeProofResponse | undefined>`
   */
  getProof(request: ZeroKnowledgeProofRequest): Promise<ZeroKnowledgeProofResponse | undefined>;

  /**
   * stores proof
   *
   * @param request - ZeroKnowledgeProofRequest
   * @param response - ZeroKnowledgeProofResponse
   * @returns `Promise<void>`
   */
  storeProof(
    request: ZeroKnowledgeProofRequest,
    response: ZeroKnowledgeProofResponse
  ): Promise<void>;
}
