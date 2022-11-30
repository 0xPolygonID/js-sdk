import { Hash, newHashFromString } from '@iden3/js-merkletree';

import { ClaimWithMTPProof } from './models';
import { Id } from '@iden3/js-iden3-core';
import {
  BaseConfig,
  ErrorEmptyAuthClaimNonRevProof,
  ErrorEmptyAuthClaimProof,
  ErrorEmptyChallengeSignature,
  getNodeAuxValue,
  prepareSiblingsStr
} from './common';
import { Signature } from '@iden3/js-crypto';

interface AuthCircuitInputs {
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
  userID: string;
  userRevTreeRoot?: string;
  userRootsTreeRoot?: string;
  userState?: string;
}

// AuthInputs type represent auth.circom private inputs
export class AuthInputs extends BaseConfig {
  id: Id;

  authClaim: ClaimWithMTPProof;

  signature: Signature;
  challenge: bigint;

  // InputsMarshal returns Circom private inputs for auth.circom
  inputsMarshal(): Uint8Array {
    if (!this.authClaim.incProof?.proof) {
      throw new Error(ErrorEmptyAuthClaimProof);
    }

    if (!this.authClaim.nonRevProof?.proof) {
      throw new Error(ErrorEmptyAuthClaimNonRevProof);
    }

    if (!this.signature) {
      throw new Error(ErrorEmptyChallengeSignature);
    }

    const s: Partial<AuthCircuitInputs> = {
      userAuthClaim: this.authClaim.claim.marshalJson(),
      userAuthClaimMtp: prepareSiblingsStr(
        this.authClaim.incProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      userAuthClaimNonRevMtp: prepareSiblingsStr(
        this.authClaim.nonRevProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      challenge: this.challenge.toString(),
      challengeSignatureR8x: this.signature.R8[0].toString(),
      challengeSignatureR8y: this.signature.R8[1].toString(),
      challengeSignatureS: this.signature.S.toString(),
      userClaimsTreeRoot: this.authClaim.incProof?.treeState.claimsRoot.bigInt().toString(),
      userID: this.id.bigInt().toString(),
      userRevTreeRoot: this.authClaim.incProof?.treeState.revocationRoot.bigInt().toString(),
      userRootsTreeRoot: this.authClaim.incProof?.treeState.rootOfRoots.bigInt().toString(),
      userState: this.authClaim.incProof?.treeState.state.bigInt().toString()
    };

    const nodeAuxAuth = getNodeAuxValue(this.authClaim.nonRevProof.proof);
    s.userAuthClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
    s.userAuthClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
    s.userAuthClaimNonRevMtpNoAux = nodeAuxAuth.noAux;

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

// AuthPubSignals auth.circom public signals
export class AuthPubSignals extends BaseConfig {
  challenge: bigint;
  userState: Hash;
  userID: Id;
  //todo make this static?
  // PubSignalsUnmarshal unmarshal auth.circom public inputs to AuthPubSignals
  pubSignalsUnmarshal(data: Uint8Array): AuthPubSignals {
    const len = 3;
    const sVals: string[] = JSON.parse(new TextDecoder().decode(data));

    if (sVals.length !== len) {
      throw new Error(`invalid number of Output values expected ${len} got ${sVals.length}`);
    }

    this.challenge = BigInt(sVals[0]);

    this.userState = newHashFromString(sVals[1]);

    this.userID = Id.fromBigInt(BigInt(sVals[2]));

    return this;
  }
}
