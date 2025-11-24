import { DID } from '@iden3/js-iden3-core';
import { ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from '../../iden3comm';

/**
 * @beta
 * Interface that defines methods for zkp proof storage
 *
 * @public
 * @interface   IProofStorage
 */
export interface IProofStorage {
  /**
   *
   * gets cached proof
   * @param profileDID - profile DID
   * @param credentialId - credential id
   * @param request - ZeroKnowledgeProofRequest
   * @returns `Promise<ZeroKnowledgeProofResponse | undefined>`
   */
  getProof(
    profileDID: DID,
    credentialId: string,
    request: ZeroKnowledgeProofRequest
  ): Promise<ZeroKnowledgeProofResponse | undefined>;

  /**
   * stores proof
   * @param profileDID - profile DID
   * @param credentialId - credential id
   * @param request - ZeroKnowledgeProofRequest
   * @param response - ZeroKnowledgeProofResponse
   * @returns `Promise<void>`
   */
  storeProof(
    profileDID: DID,
    credentialId: string,
    request: ZeroKnowledgeProofRequest,
    response: ZeroKnowledgeProofResponse
  ): Promise<void>;
}
