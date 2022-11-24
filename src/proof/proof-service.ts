/* eslint-disable no-console */
import { FullProof, ProofRequest } from './models';
import { Signature } from './../identity/bjj/eddsa-babyjub';
import { getUnixTimestamp, Id } from '@iden3/js-iden3-core';
import { Proof } from '@iden3/js-merkletree';
import {
  buildTreeState,
  CircuitClaim,
  CircuitId,
  TreeState,
  AtomicQueryMTPInputs,
  strMTHex,
  StateInRelayCredentialHash,
  AtomicQuerySigInputs,
  Query,
  AuthInputs
} from '../circuits';
import { Claim } from '../claim';
import {
  CredentialStatus,
  ErrStateNotFound,
  RevocationStatus
} from '../schema-processor/verifiable/credential';
import { toClaimNonRevStatus } from './common';
import { ProverService } from './prover';
import { SchemaLoader } from '../schema-processor/loader';
import { IIdentityWallet } from '../identity';
import { IKmsService } from '../identity/kms';
import { ICredentialWallet } from '../credentials';
import { IdentityMerkleTrees } from '../merkle-tree';

// ErrAllClaimsRevoked all claims are revoked.
const ErrAllClaimsRevoked = 'all claims are revoked';

// Query represents structure for query to atomic circuit
export interface ProofQuery {
  allowedIssuers: string;
  req: { [key: string]: unknown };
  schema: Schema;
  claimId: string;
}
export interface IProofService {
  verifyProof(zkp: FullProof, circuitName: CircuitId): Promise<boolean>;
  generateProof(
    proofReq: ProofRequest,
    identifier: Id
  ): Promise<{ proof: FullProof; claims: Claim[] }>;
}

export class ProofService implements IProofService {
  constructor(
    private readonly _identityWallet: IIdentityWallet,
    private readonly _credentialWallet: ICredentialWallet,
    private readonly _kms: IKmsService,
    private readonly _prover: ProverService
  ) {}

  verifyProof(zkp: FullProof, circuitId: CircuitId): Promise<boolean> {
    return this._prover.verify(zkp, circuitId);
  }

  async generateProof(
    proofReq: ProofRequest,
    identifier: Id
  ): Promise<{ proof: FullProof; claims: Claim[] }> {
    const { inputs, claims }: { inputs: Uint8Array; claims: Claim[] } = await this.prepareInputs(
      identifier,
      proofReq
    );

    const proof = await this._prover.generate(inputs, proofReq.circuitId);
    return { proof, claims };
  }

  private async prepareInputs(
    identifier: Id,
    proofReq: ProofRequest
  ): Promise<{ inputs: Uint8Array; claims: Claim[] }> {
    const { authClaim, signature, treeState } = this.prepareAuthBJJCredential(identifier, proofReq);
    const { authClaimData, nonRevocationProof } = await this.getAuthClaimData(
      identifier,
      authClaim,
      treeState
    );
    this.convertQueryToCircuitQuery(authClaimData, identifier, signature, proofReq);

    return { inputs: null, claims: null } as unknown as { inputs: Uint8Array; claims: Claim[] };
  }

  async getAuthClaimData(
    identifier: Id,
    authClaim: Claim,
    treeState: TreeState
  ): Promise<{ authClaimData: CircuitClaim; nonRevocationProof: Proof }> {
    //todo: introduce interface here
    const identityTrees = await IdentityMerkleTrees.getIdentityMerkleTrees(identifier);

    const claimsTree = identityTrees.claimsTree();

    // get index hash of authClaim
    const coreClaim = authClaim.coreClaim;
    const hIndex = await coreClaim.hIndex();
    const authClaimMTP = await claimsTree.generateProof(hIndex, treeState.claimsRoot);

    const authClaimData = await authClaim.newCircuitClaimData();
    authClaimData.proof = authClaimMTP.proof;
    authClaimData.treeState = treeState;

    // revocation / non revocation MTP for the latest identity state
    const nonRevocationProof = await identityTrees.generateRevocationProof(
      BigInt(authClaim.revNonce),
      treeState.revocationRoot
    );

    authClaimData.nonRevProof = {
      treeState: treeState,
      proof: nonRevocationProof
    };

    return { authClaimData, nonRevocationProof };
  }

  async getClaimDataForAtomicQueryCircuit(
    identifier: Id,
    rules: { [key: string]: unknown }
  ): Promise<{ claim: Claim; claimData: CircuitClaim; circuitQuery: Query }> {
    let claims: Claim[] = [];
    const query = rules['query'] as ProofQuery;

    if (!query.claimId) {
      // if claimID exist. Search by claimID.
      const c = await this._credentialWallet.findById(identifier); //, query.claimId)
      // we need to be sure that the hallmark selected by ID matches circuitQuery.
      claims.push(c);
    } else {
      // if claimID NOT exist in request select all claims and filter it.
      claims = await this._credentialWallet.findAllBySchemaHash(identifier.string());
    }

    const loader = await this._credentialWallet.getSchemaLoader(query.schema.url);

    const { circuitQuery, requestFiled } = this.toCircuitsQuery(query, loader);

    claims = await this.findClaimsForCircuitQuery(claims, circuitQuery, requestFiled);

    if (claims.length === 0) {
      throw new Error('could not find claims for query');
    }
    const { claim, revStatus } = this.findNonRevokedClaim(claims);

    const claimData = await claim.newCircuitClaimData();
    const nonRevProof = toClaimNonRevStatus(revStatus);
    claimData.nonRevProof = nonRevProof;

    return { claim, claimData, circuitQuery };
  }

  findNonRevokedClaim(claims: Claim[]): { claim: Claim; revStatus: RevocationStatus } {
    for (const claim of claims) {
      const revStatus = this._credentialWallet.checkRevocationStatus(claim);
      // current claim revoked. To try next claim.
      if (!revStatus) {
        continue;
      }
      return { claim, revStatus };
    }
    throw new Error(ErrAllClaimsRevoked);
  }

  private findClaimsForCircuitQuery(claims: Claim[], cq: Query, filter: string): Claim[] {
    const validClaims: Claim[] = [];
    if (!filter) {
      return claims;
    }

    for (const claim of claims) {
      const parsedClaimData = claim.data;
      const filterData = parsedClaimData[filter];
      // try next claim if this claim doesn't contain target key.
      if (!filterData) {
        continue;
      }
      const cmp = factoryComparer(BigInt(filterData), cq.values, cq.operator);

      const ok = cmp.compare(cq.operator);
      // try next claim if this claim doesn't contain target value.
      if (!ok) {
        continue;
      }
      validClaims.push(claim);
    }
    return validClaims;
  }

  private prepareAuthBJJCredential(
    identifier: Id,
    proofReq: ProofRequest
  ): { authClaim: Claim; signature: Signature; treeState: TreeState } {
    const authClaim = this._credentialWallet.getAuthCredential(identifier);
    const signingKeyId = this._identityWallet.getKeyIdFromAuthClaim(authClaim);
    const idState = this._identityWallet.getLatestStateById(identifier);
    const treeState = buildTreeState(
      idState.state,
      idState.claimsTreeRoot,
      idState.revocationTreeRoot,
      idState.rootOfRoots
    );
    const challengeDigest = this._kms.getBJJDigest(proofReq.challenge);
    const sigBytes = this._kms.sign(signingKeyId, challengeDigest);
    const signature = this._kms.decodeBJJSignature(sigBytes);

    return { authClaim, signature, treeState };
  }

  private async convertQueryToCircuitQuery(
    authClaimData: CircuitClaim,
    identifier: Id,
    signature: Signature,
    proofReq: ProofRequest
  ) {
    const claims: Claim[] = [];
    let circuitInputs;

    if (proofReq.circuitId === CircuitId.AtomicQueryMTP) {
      const { claim, claimData, circuitQuery } = await this.getClaimDataForAtomicQueryCircuit(
        identifier,
        proofReq.rules
      );
      const cs: CredentialStatus = JSON.parse(claimData.credentialStatus);
      const revStatus = this._credentialWallet.getStatus(cs);
      claimData.nonRevProof = {
        treeState: {
          state: strMTHex(revStatus.issuer.state),
          claimsRoot: strMTHex(revStatus.issuer.claims_tree_root),
          revocationRoot: strMTHex(revStatus.issuer.revocation_tree_root),
          rootOfRoots: strMTHex(revStatus.issuer.root_of_roots)
        },
        proof: revStatus.mtp
      };

      claims.push(claim);

      circuitInputs = new AtomicQueryMTPInputs();
      circuitInputs.id = identifier;
      circuitInputs.authClaim = authClaimData;
      circuitInputs.challenge = BigInt(proofReq.challenge);
      circuitInputs.signature = signature;
      circuitInputs.query = circuitQuery;
      circuitInputs.claim = claimData;
      circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());

      console.log('Claim.Proof: ', claimData.proof);
      console.log('Claim.NonRevProof: ', claimData.nonRevProof);
    } else if (proofReq.circuitId === CircuitId.AtomicQueryMTPWithRelay) {
      const { claim, claimData, circuitQuery } = await this.getClaimDataForAtomicQueryCircuit(
        identifier,
        proofReq.rules
      );

      claims.push(claim);

      const latestRelayClaim = this._credentialWallet.findCredentialWithLatestVersion(
        identifier,
        StateInRelayCredentialHash
      );

      const rsClaim: RevocationStatus =
        this._credentialWallet.checkRevocationStatus(latestRelayClaim);
      if (!rsClaim) {
        throw new Error('relay claim with latest user state is revoked');
      }

      const stateInRelayClaimData = await latestRelayClaim.newCircuitClaimData();

      claims.push(latestRelayClaim);

      circuitInputs = new AtomicQueryMTPWithRelayInputs();
      circuitInputs.id = identifier;
      circuitInputs.authClaim = authClaimData;
      circuitInputs.challenge = BigInt(proofReq.challenge);
      circuitInputs.signature = signature;
      circuitInputs.userStateInRelayClaim = stateInRelayClaimData;
      circuitInputs.query = circuitQuery;
      circuitInputs.claim = claimData;
      circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
    } else if (proofReq.circuitId === CircuitId.AtomicQuerySig) {
      const { claim, claimData, circuitQuery } = await this.getClaimDataForAtomicQueryCircuit(
        identifier,
        proofReq.rules
      );

      const { signatureProof, bjjProof } = this._identityWallet.sigProofFromClaim(claim);
      claimData.signatureProof = signatureProof;
      let issuerAuthClaimNonRevStatus: RevocationStatus;
      try {
        issuerAuthClaimNonRevStatus = this._credentialWallet.getStatus(
          bjjProof.issuer_data.revocation_status
        );
      } catch (e) {
        if (e.message === ErrStateNotFound) {
          issuerAuthClaimNonRevStatus = {
            mtp: new Proof()
          } as RevocationStatus;
        } else {
          throw e;
        }
      }

      const issuerAuthClaimNonRevProof = toClaimNonRevStatus(issuerAuthClaimNonRevStatus);

      claimData.signatureProof.issuerAuthNonRevProof = issuerAuthClaimNonRevProof;

      circuitInputs = new AtomicQuerySigInputs();
      circuitInputs.id = identifier;
      circuitInputs.authClaim = authClaimData;
      circuitInputs.challenge = proofReq.challenge;
      circuitInputs.signature = signature;
      circuitInputs.query = circuitQuery;
      circuitInputs.claim = claimData;
      circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
      claims.push(claim);
    } else if (proofReq.circuitId === CircuitId.Auth) {
      circuitInputs = new AuthInputs();
      circuitInputs.id = identifier;
      circuitInputs.authClaim = authClaimData;
      circuitInputs.signature = signature;
      circuitInputs.challenge = proofReq.challenge;
    } else {
      throw new Error(`circuit with id ${proofReq.circuitId} is not supported by issuer`);
    }
    const inputs: Uint8Array = await circuitInputs.inputsMarshal();
    return { inputs, claims };
  }

  toCircuitsQuery(query: Query, loader: SchemaLoader): Query {}
}
