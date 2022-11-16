import { CircuitClaim, strMTHex } from '../circuit';
import { IdentityStatus } from './../identity/index';
import { Claim as CoreClaim, Id } from '@iden3/js-iden3-core';
import {
  BJJSignatureProof2021,
  Iden3SparseMerkleProof
} from '../schema-processor/verifiable/proof';
import { bJJSignatureFromHexString } from '../credentials';

export class Claim {
  id: string;
  identifier?: string;
  issuer: string;
  schema_hash: string;
  schema_url: string;
  schema_type: string;
  other_identifier: string;
  expiration: number;
  updatable: boolean;
  version: number;
  rev_nonce: number;
  revoked: boolean;
  data: unknown;
  core_claim: CoreClaim;
  mtp_proof: Iden3SparseMerkleProof;
  signature_proof: BJJSignatureProof2021;
  status?: IdentityStatus;
  credential_status: unknown;
  hIndex: string;

  // NewCircuitClaimData generates circuits claim structure
  async newCircuitClaimData(): Promise<CircuitClaim> {
    const circuitClaim = new CircuitClaim();
    circuitClaim.claim = this.core_claim;
    circuitClaim.proof = this.mtp_proof.mtp;

    circuitClaim.issuerId = Id.fromString(this.issuer);

    circuitClaim.treeState = {
      state: strMTHex(this.mtp_proof.issuer_data.state?.value),
      claimsRoot: strMTHex(this.mtp_proof.issuer_data.state?.claims_tree_root),
      revocationRoot: strMTHex(this.mtp_proof.issuer_data.state?.revocation_tree_root),
      rootOfRoots: strMTHex(this.mtp_proof.issuer_data.state?.root_of_roots)
    };

    const sigProof = this.signature_proof;

    const signature = await bJJSignatureFromHexString(sigProof.signature);

    circuitClaim.signatureProof = {
      issuerId: sigProof.issuer_data.id,
      issuerTreeState: {
        state: strMTHex(sigProof.issuer_data.state?.value),
        claimsRoot: strMTHex(sigProof.issuer_data.state?.claims_tree_root),
        revocationRoot: strMTHex(sigProof.issuer_data.state?.revocation_tree_root),
        rootOfRoots: strMTHex(sigProof.issuer_data.state?.root_of_roots)
      },
      issuerAuthClaimMTP: sigProof.issuer_data.mtp,
      signature: signature,
      issuerAuthClaim: sigProof.issuer_data.auth_claim
    };

    return circuitClaim;
  }
}
