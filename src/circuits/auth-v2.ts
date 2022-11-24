import { circomSiblingsFromSiblings, Hash } from '@iden3/js-merkletree';
import { Signature } from '../identity/bjj/eddsa-babyjub';
import { Claim, Id } from '@iden3/js-iden3-core';
import { CircuitError, ClaimWithMTPProof, GISTProof } from './models';
import { BaseConfig, getNodeAuxValue } from './common';

export class AuthV2Inputs extends BaseConfig {
  id: Id;
  n: bigint;
  authClaim: ClaimWithMTPProof;
  gistProof: GISTProof;
  signature: Signature;
  challenge: bigint;

  validate(): void {
    if (!this.id) {
      throw new Error(CircuitError.EmptyId);
    }

    if (!this.authClaim.incProof.proof) {
      throw new Error(CircuitError.EmptyAuthClaimProof);
    }

    if (!this.authClaim.nonRevProof.proof) {
      throw new Error(CircuitError.EmptyAuthClaimNonRevProof);
    }

    if (!this.gistProof.proof) {
      throw new Error(CircuitError.EmptyGlobalProof);
    }

    if (!this.signature) {
      throw new Error(CircuitError.EmptyChallengeSignature);
    }

    if (!this.challenge) {
      throw new Error(CircuitError.EmptyChallenge);
    }
  }

  // InputsMarshal returns Circom private inputs for auth.circom
  async inputsMarshal(): Promise<Uint8Array> {
    this.validate();

    const s: Partial<AuthV2CircuitInputs> = {
      userGenesisId: this.id?.bigInt().toString(),
      n: this.n?.toString(),
      userAuthClaim: this.authClaim.claim,
      userAuthClaimMtp: await circomSiblingsFromSiblings(
        await this.authClaim?.incProof?.proof.allSiblings(),
        this.getMTLevel() - 1
      ),
      userAuthClaimNonRevMtp: await circomSiblingsFromSiblings(
        await this.authClaim?.nonRevProof?.proof?.allSiblings(),
        this.getMTLevel() - 1
      ),
      challenge: this.challenge.toString(),
      challengeSignatureR8x: this.signature?.r8[0].toString(),
      challengeSignatureR8y: this.signature?.r8[1].toString(),
      challengeSignatureS: this.signature.s.toString(),
      userClaimsTreeRoot: this.authClaim.incProof.treeState.claimsRoot,
      userRevTreeRoot: this.authClaim.incProof.treeState.revocationRoot,
      userRootsTreeRoot: this.authClaim.incProof.treeState.rootOfRoots,
      userState: this.authClaim.incProof.treeState.state,
      gistRoot: this.gistProof.root,
      gistMtp: await circomSiblingsFromSiblings(
        await this.gistProof.proof.allSiblings(),
        this.getMTLevelOnChain() - 1
      )
    };

    const nodeAuxAuth = getNodeAuxValue(this.authClaim.nonRevProof.proof);
    s.userAuthClaimNonRevMtpAuxHi = nodeAuxAuth.key;
    s.userAuthClaimNonRevMtpAuxHv = nodeAuxAuth.value;
    s.userAuthClaimNonRevMtpNoAux = nodeAuxAuth.noAux;

    const globalNodeAux = getNodeAuxValue(this.gistProof.proof);
    s.gistMtpAuxHi = globalNodeAux.key;
    s.gistMtpAuxHv = globalNodeAux.value;
    s.gistMtpNoAux = globalNodeAux.noAux;

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

export class AuthV2CircuitInputs {
  userGenesisId: string;
  n: string;
  userAuthClaim?: Claim;
  userAuthClaimMtp: Hash[];
  userAuthClaimNonRevMtp: Hash[];
  userAuthClaimNonRevMtpAuxHi?: Hash;
  userAuthClaimNonRevMtpAuxHv?: Hash;
  userAuthClaimNonRevMtpNoAux: string;
  challenge: string;
  challengeSignatureR8x: string;
  challengeSignatureR8y: string;
  challengeSignatureS: string;
  userClaimsTreeRoot?: Hash;
  userRevTreeRoot?: Hash;
  userRootsTreeRoot?: Hash;
  userState?: Hash;
  gistRoot?: Hash;
  gistMtp: Hash[];
  gistMtpAuxHi?: Hash;
  gistMtpAuxHv?: Hash;
  gistMtpNoAux: string;
}
