import { DID } from '@iden3/js-iden3-core';
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
   * @param credentialId - credential id
   * @param request - ZeroKnowledgeProofRequest
   * @returns `Promise<ZeroKnowledgeProofResponse | undefined>`
   */
  getProof(
    credentialId: string,
    request: ZeroKnowledgeProofRequest,
    opts?: {
      profileDID: DID;
    }
  ): Promise<ZeroKnowledgeProofResponse | undefined>;

  /**
   * stores proof
   *
   * @param credentialId - credential id
   * @param request - ZeroKnowledgeProofRequest
   * @param response - ZeroKnowledgeProofResponse
   * @returns `Promise<void>`
   */
  storeProof(
    credentialId: string,
    request: ZeroKnowledgeProofRequest,
    response: ZeroKnowledgeProofResponse,
    opts?: {
      profileDID: DID;
    }
  ): Promise<void>;
}
