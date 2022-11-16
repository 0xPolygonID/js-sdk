/* eslint-disable no-console */
import { FullProof, ProofRequest } from './models';
import { Signature } from './../identity/bjj/eddsa-babyjub';
import { getUnixTimestamp, Id } from '@iden3/js-iden3-core';
import { ICredentialWallet, IProofService, IIdentityWallet, IKmsService } from '../abstractions';
import { Proof } from '@iden3/js-merkletree';
import {
  AtomicQueryMTPWithRelayInputs,
  buildTreeState,
  CircuitClaim,
  CircuitId,
  TreeState,
  AtomicQueryMTPInputs,
  strMTHex,
  StateInRelayCredentialHash,
  AtomicQuerySigInputs
} from '../circuit';
import { Claim } from '../claim';
import { getIdentityMerkleTrees } from '../merkle-tree';
import {
  CredentialStatus,
  ErrStateNotFound,
  RevocationStatus
} from '../schema-processor/verifiable/credential';
import { toClaimNonRevStatus } from './common';
import { AuthInputs } from '../circuit/auth-inputs';

export class ProofService implements IProofService {
  constructor(
    private readonly _identityWallet: IIdentityWallet,
    private readonly _credentialWallet: ICredentialWallet,
    private readonly _kms: IKmsService
  ) {}

  verifyProof(proofReq: ProofRequest): Promise<boolean> {
    return Promise.resolve(true);
  }

  async generateProof(proofReq: ProofRequest, identifier: Id): Promise<FullProof> {
    const { inputs, claims }: { inputs: Uint8Array; claims: Claim[] } = await this.prepareInputs(
      identifier,
      proofReq
    );
    this.generateZkProof(inputs, proofReq.circuit_id);
    return Promise.resolve({ proof: null, pub_signals: null } as unknown as FullProof);
  }

  generateZkProof(inputs: Uint8Array, circuit_id: string) {
    throw new Error('Method not implemented.');
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

    this.prepareRequestedCredentialInputs();
    this.convertQueryToCircuitQuery(authClaimData, identifier, signature, proofReq);

    return { inputs: null, claims: null } as unknown as { inputs: Uint8Array; claims: Claim[] };
  }

  async getAuthClaimData(
    identifier: Id,
    authClaim: Claim,
    treeState: TreeState
  ): Promise<{ authClaimData: CircuitClaim; nonRevocationProof: Proof }> {
    //todo: introduce interface here
    const identityTrees = getIdentityMerkleTrees({}, identifier);

    const claimsTree = identityTrees.claimsTree();

    // get index hash of authClaim
    const coreClaim = authClaim.core_claim;
    const hIndex = await coreClaim.hIndex();
    const authClaimMTP = await claimsTree.generateProof(hIndex, treeState.claimsRoot);

    const authClaimData = await authClaim.newCircuitClaimData();
    authClaimData.proof = authClaimMTP.proof;
    authClaimData.treeState = treeState;

    // revocation / non revocation MTP for the latest identity state
    const nonRevocationProof = await identityTrees.generateRevocationProof(
      BigInt(authClaim.rev_nonce),
      treeState.revocationRoot
    );

    authClaimData.nonRevProof = {
      treeState: treeState,
      proof: nonRevocationProof
    };

    return { authClaimData, nonRevocationProof };
  }

  getClaimDataForAtomicQueryCircuit(
    identifier: Id,
    rules: { [key: string]: unknown }
  ): { claim: any; claimData: any; circuitQuery: any } {
    throw new Error('Method not implemented.');
  }

  private prepareRequestedCredentialInputs() {
    throw new Error('Method not implemented.');
  }

  private prepareAuthBJJCredential(
    identifier: Id,
    proofReq: ProofRequest
  ): { authClaim: Claim; signature: Signature; treeState: TreeState } {
    const authClaim = this._credentialWallet.getAuthClaim(identifier);
    const signingKeyId = this._identityWallet.getKeyIdFromAuthClaim(authClaim);
    const idState = this._identityWallet.getLatestStateById(identifier);
    const treeState = buildTreeState(
      idState.state,
      idState.claims_tree_root,
      idState.revocation_tree_root,
      idState.root_of_roots
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

    if (proofReq.circuit_id === CircuitId.AtomicQueryMTP) {
      const { claim, claimData, circuitQuery } = this.getClaimDataForAtomicQueryCircuit(
        identifier,
        proofReq.rules
      );
      const cs: CredentialStatus = JSON.parse(claimData.credentialStatus);
      const revStatus = this._credentialWallet.getStatus(cs);
      claimData.nonRevProof = {
        TreeState: {
          state: strMTHex(revStatus.issuer.state),
          claimsRoot: strMTHex(revStatus.issuer.claims_tree_root),
          revocationRoot: strMTHex(revStatus.issuer.revocation_tree_root),
          rootOfRoots: strMTHex(revStatus.issuer.root_of_roots)
        },
        Proof: revStatus.mtp
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

      console.log('Claim.Proof: ', claimData.Proof);
      console.log('Claim.NonRevProof: ', claimData.NonRevProof);
    } else if (proofReq.circuit_id === CircuitId.AtomicQueryMTPWithRelay) {
      const { claim, claimData, circuitQuery } = this.getClaimDataForAtomicQueryCircuit(
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
    } else if (proofReq.circuit_id === CircuitId.AtomicQuerySig) {
      const { claim, claimData, circuitQuery } = this.getClaimDataForAtomicQueryCircuit(
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
    } else if (proofReq.circuit_id === CircuitId.Auth) {
      circuitInputs = new AuthInputs();
      circuitInputs.id = identifier;
      circuitInputs.authClaim = authClaimData;
      circuitInputs.signature = signature;
      circuitInputs.challenge = proofReq.challenge;
    } else {
      throw new Error(`circuit with id ${proofReq.circuit_id} is not supported by issuer`);
    }
    const inputs: Uint8Array = await circuitInputs.inputsMarshal();
    return { inputs, claims };
  }
}
