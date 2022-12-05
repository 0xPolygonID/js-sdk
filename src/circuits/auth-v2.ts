import { circomSiblingsFromSiblings, Hash, newHashFromString } from '@iden3/js-merkletree';
import { Id } from '@iden3/js-iden3-core';
import { CircuitError, ClaimWithMTPProof, GISTProof } from './models';
import { BaseConfig, getNodeAuxValue } from './common';
import { Signature } from '@iden3/js-crypto';

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
  inputsMarshal(): Uint8Array {
    this.validate();

    const s: Partial<AuthV2CircuitInputs> = {
      userGenesisId: this.id?.bigInt().toString(),
      n: this.n?.toString(),
      userAuthClaim: this.authClaim.claim.marshalJson(),
      userAuthClaimMtp: circomSiblingsFromSiblings(
        this.authClaim?.incProof?.proof.allSiblings(),
        this.getMTLevel() - 1
      ).map((s) => s.bigInt().toString()),
      userAuthClaimNonRevMtp: circomSiblingsFromSiblings(
        this.authClaim?.nonRevProof?.proof?.allSiblings(),
        this.getMTLevel() - 1
      ).map((s) => s.bigInt().toString()),
      challenge: this.challenge.toString(),
      challengeSignatureR8x: this.signature?.R8[0].toString(),
      challengeSignatureR8y: this.signature?.R8[1].toString(),
      challengeSignatureS: this.signature.S.toString(),
      userClaimsTreeRoot: this.authClaim.incProof.treeState?.claimsRoot.bigInt().toString(),
      userRevTreeRoot: this.authClaim.incProof.treeState?.revocationRoot.bigInt().toString(),
      userRootsTreeRoot: this.authClaim.incProof.treeState?.rootOfRoots.bigInt().toString(),
      userState: this.authClaim.incProof.treeState?.state.bigInt().toString(),
      gistRoot: this.gistProof.root.bigInt().toString(),
      gistMtp: circomSiblingsFromSiblings(
        this.gistProof.proof.allSiblings(),
        this.getMTLevelOnChain() - 1
      ).map((s) => s.bigInt().toString())
    };

    const nodeAuxAuth = getNodeAuxValue(this.authClaim.nonRevProof.proof);
    s.userAuthClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
    s.userAuthClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
    s.userAuthClaimNonRevMtpNoAux = nodeAuxAuth.noAux;

    const globalNodeAux = getNodeAuxValue(this.gistProof.proof);
    s.gistMtpAuxHi = globalNodeAux.key.bigInt().toString();
    s.gistMtpAuxHv = globalNodeAux.value.bigInt().toString();
    s.gistMtpNoAux = globalNodeAux.noAux;

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

export class AuthV2CircuitInputs {
  userGenesisId: string;
  n: string;
  userAuthClaim?: string[];
  userAuthClaimMtp: string[];
  userAuthClaimNonRevMtp: string[];
  userAuthClaimNonRevMtpAuxHi?: string;
  userAuthClaimNonRevMtpAuxHv?: string;
  userAuthClaimNonRevMtpNoAux: string;
  challenge: string;
  challengeSignatureR8x: string;
  challengeSignatureR8y: string;
  challengeSignatureS: string;
  userClaimsTreeRoot?: string;
  userRevTreeRoot?: string;
  userRootsTreeRoot?: string;
  userState?: string;
  gistRoot?: string;
  gistMtp: string[];
  gistMtpAuxHi?: string;
  gistMtpAuxHv?: string;
  gistMtpNoAux: string;
}

// AuthV2PubSignals auth.circom public signals
export class AuthV2PubSignals {
  userId: Id;
  challenge: bigint;
  globalSmtRoot: Hash;
  // PubSignalsUnmarshal unmarshal auth.circom public inputs to AuthPubSignals

  PubSignalsUnmarshal(data: Uint8Array): AuthV2PubSignals {
    const len = 3;
    const sVals: string[] = JSON.parse(new TextDecoder().decode(data));

    if (sVals.length !== len) {
      throw new Error(`invalid number of Output values expected ${len} got ${sVals.length}`);
    }

    this.userId = Id.fromString(sVals[0]);

    this.challenge = BigInt(sVals[1]);

    this.globalSmtRoot = newHashFromString(sVals[2]);
    return this;
  }
}
