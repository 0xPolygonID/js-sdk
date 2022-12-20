import { RHSCredentialStatus, W3CCredential } from '../verifiable/credential';
import { ProofType } from '../verifiable/constants';
import { KMS, KmsKeyId } from '../kms/kms';
/* eslint-disable no-console */
import { DID, getUnixTimestamp, Id, Claim } from '@iden3/js-iden3-core';
import {
  buildTreeState,
  CircuitClaim,
  CircuitId,
  TreeState,
  strMTHex,
  Query,
  factoryComparer,
  AtomicQueryMTPV2Inputs,
  AtomicQuerySigV2Inputs,
  AuthV2Inputs
} from '../circuits';
import { RevocationStatus } from '../verifiable/credential';
import { toClaimNonRevStatus } from './common';
import { ProverService } from './prover';
import { IIdentityWallet } from '../identity';
import { ICredentialWallet } from '../credentials';
import { Hex, Signature } from '@iden3/js-crypto';
import {
  BJJSignatureProof2021,
  Iden3SparseMerkleTreeProof,
  MerkleTreeProofWithTreeState,
  ProofQuery
} from '../verifiable';
import { getStatusFromRHS } from '../credentials/revocation';

// ErrAllClaimsRevoked all claims are revoked.
const ErrAllClaimsRevoked = 'all claims are revoked';

interface PreparedAuthBJJCredential {
  authCredential: W3CCredential;
  signature: Signature;
  incProof: MerkleTreeProofWithTreeState;
  nonRevProof: MerkleTreeProofWithTreeState;
  authCoreClaim: Claim;
}
interface PreparedCredential {
  credential: W3CCredential;
  credentialCoreClaim: Claim;
  revStatus: RevocationStatus;
}
// ZKPRequest is a request for zkp proof
export interface ZKPRequest {
  id: number;
  circuitId: string;
  optional?: boolean;
  query: ProofQuery;
}

// ZKPResponse is a response with a zkp
export interface ZKPResponse {
  id: number;
  circuitId: string; // `circuitId` compatibility with golang implementation.
  pub_signals: string[];
  proof: ProofData;
}

export interface FullProof {
  pub_signals: string[];
  proof: ProofData;
}

// ProofData is a result of snarkJS groth16 proof generation
export interface ProofData {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol?: string;
  curve?: string;
}

export interface IProofService {
  verifyProof(zkp: FullProof, circuitName: CircuitId): Promise<boolean>;
  generateProof(
    proofReq: ZKPRequest,
    identifier: DID
  ): Promise<{ proof: FullProof; credentials: W3CCredential[] }>;
}

export class ProofService implements IProofService {
  constructor(
    private readonly _identityWallet: IIdentityWallet,
    private readonly _credentialWallet: ICredentialWallet,
    private readonly _kms: KMS,
    private readonly _prover: ProverService
  ) {}

  verifyProof(zkp: FullProof, circuitId: CircuitId): Promise<boolean> {
    return this._prover.verify(zkp, circuitId);
  }

  async generateProof(
    proofReq: ZKPRequest,
    identifier: DID
  ): Promise<{ proof: FullProof; credentials: W3CCredential[] }> {
    const { inputs, creds } = await this.prepareInputs(identifier, proofReq);

    const proof = await this._prover.generate(inputs, proofReq.circuitId);
    return { proof, credentials: creds };
  }

  private async prepareInputs(
    did: DID,
    proofReq: ZKPRequest
  ): Promise<{ inputs: Uint8Array; creds: W3CCredential[] }> {
    const preparedAuthBJJCredential = await this.prepareAuthBJJCredential(did, proofReq);

    const preparedCredential = await this.prepareCredential(did, proofReq.query);

    const inputs = await this.generateInputs(
      preparedAuthBJJCredential,
      preparedCredential,
      did,
      proofReq
    );
    return { inputs, creds: [preparedCredential.credential] };
  }

  async prepareCredential(did: DID, query: ProofQuery): Promise<PreparedCredential> {
    let credentials: W3CCredential[] = [];

    if (!query.claimId) {
      const credential = await this._credentialWallet.findById(query.claimId!);
      credentials.push(credential!);
    } else {
      query.credentialSubjectId = did.toString();
      credentials = await this._credentialWallet.findByQuery(query);
    }
    if (credentials.length === 0) {
      throw new Error('could not find claims for query');
    }
    const { cred, revStatus } = await this.findNonRevokedClaim(credentials);

    const credCoreClaim = cred.getCoreClaimFromProof(ProofType.BJJSignature);
    return { credential: cred, revStatus, credentialCoreClaim: credCoreClaim };
  }

  async findNonRevokedClaim(creds: W3CCredential[]): Promise<{
    cred: W3CCredential;
    revStatus: RevocationStatus;
  }> {
    for (const cred of creds) {
      const revStatus = await this._credentialWallet.getRevocationStatusFromCredential(cred);
      if (revStatus.mtp.existence) {
        continue;
      }
      return { cred, revStatus };
    }
    throw new Error(ErrAllClaimsRevoked);
  }

  private async prepareAuthBJJCredential(
    did: DID,
    proofReq: ZKPRequest
  ): Promise<PreparedAuthBJJCredential> {
    const authCredential = await this._credentialWallet.getAuthBJJCredential(did);

    const incProof = await this._identityWallet.generateClaimMtp(did, authCredential);

    const nonRevProof = await this._identityWallet.generateNonRevocationMtp(did, authCredential);

    const signature = await this._identityWallet.sign(proofReq.id, authCredential);

    const authCoreClaim = authCredential.getCoreClaimFromProof(
      ProofType.Iden3SparseMerkleTreeProof
    );

    return { authCredential, incProof, nonRevProof, signature, authCoreClaim };
  }

  private async generateInputs(
    preparedAuthCredential: PreparedAuthBJJCredential,
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZKPRequest
  ) :Promise<Uint8Array>{
    const claims: W3CCredential[] = [];
    let circuitInputs;

    if (proofReq.circuitId === CircuitId.AtomicQueryMTPV2) {
      const circuitClaimData = await this.newCircuitClaimData(preparedCredential);

      circuitClaimData.nonRevProof = {
        treeState: {
          state: strMTHex(preparedCredential.revStatus.issuer.state),
          claimsRoot: strMTHex(preparedCredential.revStatus.issuer.claimsTreeRoot),
          revocationRoot: strMTHex(preparedCredential.revStatus.issuer.revocationTreeRoot),
          rootOfRoots: strMTHex(preparedCredential.revStatus.issuer.rootOfRoots)
        },
        proof: preparedCredential.revStatus.mtp
      };

      circuitInputs = new AtomicQueryMTPV2Inputs();
      circuitInputs.id = identifier;
      circuitInputs.challenge = BigInt(proofReq.id);
      circuitInputs.query = this.toCircuitsQuery(proofReq.query);
      circuitInputs.claim = circuitClaimData;
      circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
    } else if (proofReq.circuitId === CircuitId.AtomicQuerySigV2) {
      const circuitClaimData = await this.newCircuitClaimData(preparedCredential);

      const issuerAuthClaimNonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);

      circuitClaimData.signatureProof.issuerAuthNonRevProof = issuerAuthClaimNonRevProof;

      circuitInputs = new AtomicQuerySigV2Inputs();
      circuitInputs.id = identifier;
      circuitInputs.authClaim = preparedAuthCredential.authCoreClaim;
      circuitInputs.challenge = proofReq.id;
      circuitInputs.signature = preparedAuthCredential.signature;
      circuitInputs.query = this.toCircuitsQuery(proofReq.query);
      circuitInputs.claim = circuitClaimData;
      circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
    } else if (proofReq.circuitId === CircuitId.AuthV2) {
      circuitInputs = new AuthV2Inputs();
      circuitInputs.id = identifier;
      circuitInputs.authClaim = preparedAuthCredential.authCoreClaim;
      circuitInputs.signature = preparedAuthCredential.signature;
      circuitInputs.challenge = proofReq.id;
    } else {
      throw new Error(`circuit with id ${proofReq.circuitId} is not supported by issuer`);
    }
    const inputs: Uint8Array = await circuitInputs.inputsMarshal();
    return inputs;
  }

  // NewCircuitClaimData generates circuits claim structure
  async newCircuitClaimData(prepareCredential: PreparedCredential): Promise<CircuitClaim> {
    const smtProof = prepareCredential.credential.getIden3SparseMerkleTreeProof();
    const circuitClaim = new CircuitClaim();
    circuitClaim.claim = prepareCredential.credentialCoreClaim;
    circuitClaim.proof = smtProof.mtp;

    circuitClaim.issuerId = DID.parse(prepareCredential.credential.issuer).id;
    circuitClaim.treeState = {
      state: strMTHex(smtProof.issuerData.state?.value),
      claimsRoot: strMTHex(smtProof.issuerData.state?.claimsTreeRoot),
      revocationRoot: strMTHex(smtProof.issuerData.state?.revocationTreeRoot),
      rootOfRoots: strMTHex(smtProof.issuerData.state?.rootOfRoots)
    };

    const sigProof = prepareCredential.credential.getBJJSignature2021Proof();

    const signature = await bJJSignatureFromHexString(sigProof.signature);

    circuitClaim.signatureProof = {
      signature,
      issuerAuthIncProof: {
        proof: sigProof.issuerData.mtp!,
        treeState: {
          state: strMTHex(sigProof.issuerData.state?.value),
          claimsRoot: strMTHex(sigProof.issuerData.state?.claimsTreeRoot),
          revocationRoot: strMTHex(sigProof.issuerData.state?.revocationTreeRoot),
          rootOfRoots: strMTHex(sigProof.issuerData.state?.rootOfRoots)
        }
      },
      issuerAuthClaim: new Claim().fromHex(sigProof.coreClaim),
      issuerAuthNonRevProof: this._credentialWallet.getRevocationStatus(
        sigProof.issuerData.credentialStatus as RHSCredentialStatus,
        DID.parse(sigProof.issuerData.id),
        sigProof.issuerData.mtp as unknown as Iden3SparseMerkleTreeProof
      )
    };

    return circuitClaim;
  }
  toCircuitsQuery(query: ProofQuery): Query {
    return {} as Query;
  }
}

// BJJSignatureFromHexString converts hex to  babyjub.Signature
export const bJJSignatureFromHexString = async (sigHex: string): Promise<Signature> => {
  const signatureBytes = Hex.decodeString(sigHex);
  const sig = Uint8Array.from(signatureBytes).slice(0, 64);
  // TODO: call decompress
  const bjjSig = await (Signature as any).decompress(sig);
  return bjjSig as Signature;
};
