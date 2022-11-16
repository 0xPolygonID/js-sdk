import { Id } from '@iden3/js-iden3-core';
import { FullProof, ProofRequest } from '../proof/models';

export interface IProofService {
  verifyProof(proofReq: ProofRequest): Promise<boolean>;
  generateProof(proofReq: ProofRequest, identifier: Id): Promise<FullProof>;
}
