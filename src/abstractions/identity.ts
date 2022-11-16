import { Id } from '@iden3/js-iden3-core';
import { BJJSignatureProof } from '../circuit';
import { Claim } from '../claim';
import { IdentityState } from '../identity';
import { KmsKeyId } from '../identity/kms';
import { BJJSignatureProof2021 } from '../schema-processor';

export interface IIdentityWallet {
  getKeyIdFromAuthClaim(authClaim: Claim): KmsKeyId;
  getLatestStateById(id: Id): IdentityState;
  sigProofFromClaim(claim: Claim): {
    signatureProof: BJJSignatureProof;
    bjjProof: BJJSignatureProof2021;
  };
}
