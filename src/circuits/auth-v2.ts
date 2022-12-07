import { circomSiblingsFromSiblings, Hash, newHashFromString, Proof } from '@iden3/js-merkletree';
import { Claim, Id } from '@iden3/js-iden3-core';
import { CircuitError, GISTProof, TreeState } from './models';
import { BaseConfig, getNodeAuxValue } from './common';
import { Signature } from '@iden3/js-crypto';

export class AuthV2Inputs extends BaseConfig {
  genesisID?: Id;
  profileNonce?: bigint;
  authClaim?: Claim;
  authClaimIncMtp: Proof;
  authClaimNonRevMtp: Proof;
  treeState: TreeState;
  gistProof: GISTProof;
  signature?: Signature;
  challenge?: bigint;

  validate(): void {
    if (!this.genesisID) {
      throw new Error(CircuitError.EmptyId);
    }

    if (!this.authClaimIncMtp) {
      throw new Error(CircuitError.EmptyAuthClaimProof);
    }

    if (!this.authClaimNonRevMtp) {
      throw new Error(CircuitError.EmptyAuthClaimNonRevProof);
    }

    if (!this.gistProof?.proof) {
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
      genesisID: this.genesisID?.bigInt().toString(),
      profileNonce: this.profileNonce?.toString(),
      authClaim: this.authClaim?.marshalJson(),
      authClaimIncMtp: circomSiblingsFromSiblings(
        this.authClaimIncMtp.allSiblings(),
        this.getMTLevel() - 1
      ).map((s) => s.bigInt().toString()),
      authClaimNonRevMtp: circomSiblingsFromSiblings(
        this.authClaimNonRevMtp?.allSiblings(),
        this.getMTLevel() - 1
      ).map((s) => s.bigInt().toString()),
      challenge: this.challenge?.toString(),
      challengeSignatureR8x: this.signature?.R8[0].toString(),
      challengeSignatureR8y: this.signature?.R8[1].toString(),
      challengeSignatureS: this.signature?.S.toString(),
      claimsTreeRoot: this.treeState?.claimsRoot.bigInt().toString(),
      revTreeRoot: this.treeState?.revocationRoot.bigInt().toString(),
      rootsTreeRoot: this.treeState?.rootOfRoots.bigInt().toString(),
      state: this.treeState?.state.bigInt().toString(),
      gistRoot: this.gistProof.root.bigInt().toString(),
      gistMtp: circomSiblingsFromSiblings(
        this.gistProof.proof.allSiblings(),
        this.getMTLevelOnChain() - 1
      ).map((s) => s.bigInt().toString())
    };
    console.log(this.authClaimNonRevMtp);

    const nodeAuxAuth = getNodeAuxValue(this.authClaimNonRevMtp);
    s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
    s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
    s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;

    const globalNodeAux = getNodeAuxValue(this.gistProof.proof);
    s.gistMtpAuxHi = globalNodeAux.key.bigInt().toString();
    s.gistMtpAuxHv = globalNodeAux.value.bigInt().toString();
    s.gistMtpNoAux = globalNodeAux.noAux;

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

interface AuthV2CircuitInputs {
  genesisID: string;
  profileNonce: string;
  authClaim?: string[];
  authClaimIncMtp?: string[];
  authClaimNonRevMtp: string[];
  authClaimNonRevMtpAuxHi?: string;
  authClaimNonRevMtpAuxHv?: string;
  authClaimNonRevMtpNoAux: string;
  challenge: string;
  challengeSignatureR8x: string;
  challengeSignatureR8y: string;
  challengeSignatureS: string;
  claimsTreeRoot?: string;
  revTreeRoot?: string;
  rootsTreeRoot?: string;
  state?: string;
  gistRoot?: string;
  gistMtp: string[];
  gistMtpAuxHi?: string;
  gistMtpAuxHv?: string;
  gistMtpNoAux: string;
}

// AuthV2PubSignals auth.circom public signals
export class AuthV2PubSignals {
  userID: Id;
  challenge: bigint;
  GISTRoot: Hash;
  // PubSignalsUnmarshal unmarshal auth.circom public inputs to AuthPubSignals

  pubSignalsUnmarshal(data: Uint8Array): AuthV2PubSignals {
    const len = 3;
    const sVals: string[] = JSON.parse(new TextDecoder().decode(data));

    if (sVals.length !== len) {
      throw new Error(`invalid number of Output values expected ${len} got ${sVals.length}`);
    }

    this.userID = Id.fromBigInt(BigInt(sVals[0]));

    this.challenge = BigInt(sVals[1]);

    this.GISTRoot = newHashFromString(sVals[2]);
    return this;
  }
}
