import { CredentialStatus, RevocationStatus, Issuer } from '../../verifiable';
import { CredentialStatusResolver } from './resolver';
import { newHashFromBigInt, Proof, NodeAux, setBitBigEndian } from '@iden3/js-merkletree';

/**
 * IssuerResolver is a class that allows to interact with the issuer's http endpoint to get revocation status.
 *
 * @export
 * @beta
 * @class IssuerResolver
 */

export class IssuerResolver implements CredentialStatusResolver {
  async resolve(credentialStatus: CredentialStatus): Promise<RevocationStatus> {
    const revStatusDTO = await (await fetch(credentialStatus.id)).json();
    return Object.assign(new RevocationStatusDTO(), revStatusDTO).toRevocationStatus();
  }
}

/**
 *  Proof dto as a partial result of fetching credential status with type SparseMerkleTreeProof
 *
 * @export
 * @class ProofDTO
 */
export class ProofDTO {
  existence: boolean;
  siblings: string[];
  node_aux: {
    key: string;
    value: string;
  };
}

/**
 * RevocationStatusDTO is a result of fetching credential status with type SparseMerkleTreeProof
 *
 * @beta
 * @export
 * @class RevocationStatusDTO
 */
export class RevocationStatusDTO {
  issuer: Issuer;
  mtp: ProofDTO;

  toRevocationStatus(): RevocationStatus {
    const p = new Proof();
    p.existence = this.mtp.existence;
    p.nodeAux = this.mtp.node_aux
      ? ({
          key: newHashFromBigInt(BigInt(this.mtp.node_aux.key)),
          value: newHashFromBigInt(BigInt(this.mtp.node_aux.value))
        } as NodeAux)
      : undefined;

    const s = this.mtp.siblings.map((s) => newHashFromBigInt(BigInt(s)));

    p.siblings = [];
    p.depth = s.length;

    for (let lvl = 0; lvl < s.length; lvl++) {
      if (s[lvl].bigInt() !== BigInt(0)) {
        setBitBigEndian(p.notEmpties, lvl);
        p.siblings.push(s[lvl]);
      }
    }
    return {
      mtp: p,
      issuer: this.issuer
    };
  }
}
