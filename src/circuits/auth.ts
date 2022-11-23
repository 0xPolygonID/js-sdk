import { Hash, newHashFromString } from '@iden3/js-merkletree';
import { Signature } from '../identity/bjj/eddsa-babyjub';
import { ClaimWithMTPProof } from './models';
import { Claim as CoreClaim, Id } from '@iden3/js-iden3-core';
import {
  BaseConfig,
  ErrorEmptyAuthClaimNonRevProof,
  ErrorEmptyAuthClaimProof,
  ErrorEmptyChallengeSignature,
  getNodeAuxValue,
  prepareSiblingsStr
} from './common';

interface AuthCircuitInputs {
  userAuthClaim?: CoreClaim;
  userAuthClaimMtp: string[];
  userAuthClaimNonRevMtp: string[];
  userAuthClaimNonRevMtpAuxHi?: Hash;
  userAuthClaimNonRevMtpAuxHv?: Hash;
  userAuthClaimNonRevMtpNoAux: string;
  challenge: string;
  challengeSignatureR8x: string;
  challengeSignatureR8y: string;
  challengeSignatureS: string;
  userClaimsTreeRoot?: Hash;
  userID: string;
  userRevTreeRoot?: Hash;
  userRootsTreeRoot?: Hash;
  userState?: Hash;
}

// AuthInputs type represent auth.circom private inputs
export class AuthInputs extends BaseConfig {
  id: Id;

  authClaim: ClaimWithMTPProof;

  signature: Signature;
  challenge: bigint;

  // InputsMarshal returns Circom private inputs for auth.circom
  async inputsMarshal(): Promise<Uint8Array> {
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
      userAuthClaim: this.authClaim.claim,
      userAuthClaimMtp: prepareSiblingsStr(
        await this.authClaim.incProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      userAuthClaimNonRevMtp: prepareSiblingsStr(
        await this.authClaim.nonRevProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      challenge: this.challenge.toString(),
      challengeSignatureR8x: this.signature.r8[0].toString(),
      challengeSignatureR8y: this.signature.r8[0].toString(),
      challengeSignatureS: this.signature.s.toString(),
      userClaimsTreeRoot: this.authClaim.incProof?.treeState.claimsRoot,
      userID: this.id.bigInt().toString(),
      userRevTreeRoot: this.authClaim.incProof?.treeState.revocationRoot,
      userRootsTreeRoot: this.authClaim.incProof?.treeState.rootOfRoots,
      userState: this.authClaim.incProof?.treeState.state
    };

    const nodeAuxAuth = getNodeAuxValue(this.authClaim.nonRevProof.proof);
    s.userAuthClaimNonRevMtpAuxHi = nodeAuxAuth.key;
    s.userAuthClaimNonRevMtpAuxHv = nodeAuxAuth.value;
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
