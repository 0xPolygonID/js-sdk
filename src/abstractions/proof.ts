import { Id } from '@iden3/js-iden3-core';
import { CircuitId } from '../circuits';
import { Claim } from '../claim';
import { FullProof, ProofRequest } from '../proof/models';

export interface IProofService {
  verifyProof(zkp: FullProof, circuitName: CircuitId): Promise<boolean>;
  generateProof(
    proofReq: ProofRequest,
    identifier: Id
  ): Promise<{ proof: FullProof; claims: Claim[] }>;
}
