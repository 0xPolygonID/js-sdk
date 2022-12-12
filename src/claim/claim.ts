import { CircuitClaim, strMTHex } from '../circuits';
import { IdentityStatus } from './../identity/index';
import { Claim as CoreClaim, Id } from '@iden3/js-iden3-core';
import {
  BJJSignatureProof2021,
  Iden3SparseMerkleProof
} from '../verifiable/proof';
import { bJJSignatureFromHexString } from '../credentials';

export class Claim {
  id: string;
  identifier?: string;
  issuer: string;
  schemaHash: string;
  schemaUrl: string;
  schemaType: string;
  otherIdentifier: string;
  expiration: number;
  updatable: boolean;
  version: number;
  revNonce: number;
  revoked: boolean;
  data;
  coreClaim: CoreClaim;
  mtpProof: Iden3SparseMerkleProof;
  signatureProof: BJJSignatureProof2021;
  status?: IdentityStatus;
  credentialStatus: unknown;
  hIndex: string;

  // NewCircuitClaimData generates circuits claim structure
  async newCircuitClaimData(): Promise<CircuitClaim> {
    const circuitClaim = new CircuitClaim();
    circuitClaim.claim = this.coreClaim;
    circuitClaim.proof = this.mtpProof.mtp;

    circuitClaim.issuerId = Id.fromString(this.issuer);

    circuitClaim.treeState = {
      state: strMTHex(this.mtpProof.issuerData.state?.value),
      claimsRoot: strMTHex(this.mtpProof.issuerData.state?.claimsTreeRoot),
      revocationRoot: strMTHex(this.mtpProof.issuerData.state?.revocationTreeRoot),
      rootOfRoots: strMTHex(this.mtpProof.issuerData.state?.rootOfRoots)
    };

    const sigProof = this.signatureProof;

    const signature = await bJJSignatureFromHexString(sigProof.signature);

    circuitClaim.signatureProof = {
      issuerId: sigProof.issuerData.id.
      issuerTreeState: {
        state: strMTHex(sigProof.issuerData.state?.value),
        claimsRoot: strMTHex(sigProof.issuerData.state?.claimsTreeRoot),
        revocationRoot: strMTHex(sigProof.issuerData.state?.revocationTreeRoot),
        rootOfRoots: strMTHex(sigProof.issuerData.state?.rootOfRoots)
      },
      issuerAuthClaimMTP: sigProof.issuerData.mtp,
      signature: signature,
sigProof.issuerData.authCoreClaim;

    };

    return circuitClaim;
  }
}
