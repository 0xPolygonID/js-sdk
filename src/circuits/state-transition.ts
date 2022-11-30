import { Signature } from '@iden3/js-crypto';
import { Claim, Id } from '@iden3/js-iden3-core';
import { Hash, newHashFromString } from '@iden3/js-merkletree';
import { BaseConfig, getNodeAuxValue, prepareSiblingsStr } from './common';
import { ClaimWithMTPProof, TreeState, CircuitError } from './models';

export class StateTransitionInputs extends BaseConfig {
  id: Id;
  oldTreeState: TreeState;
  newState: Hash;
  isOldStateGenesis: boolean;
  authClaim: ClaimWithMTPProof;
  signature: Signature;

  // CircuitInputMarshal returns Circom private inputs for stateTransition.circom
  inputsMarshal(): Uint8Array {
    if (this.authClaim.incProof.proof) {
      throw new Error(CircuitError.EmptyAuthClaimProof);
    }

    if (this.authClaim.nonRevProof.proof) {
      throw new Error(CircuitError.EmptyAuthClaimNonRevProof);
    }

    const s: Partial<StateTransitionInputsInternal> = {
      authClaim: this.authClaim.claim,
      authClaimMtp: prepareSiblingsStr(
        this.authClaim.incProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      authClaimNonRevMtp: prepareSiblingsStr(
        this.authClaim.nonRevProof.proof.allSiblings(),
        this.getMTLevel()
      ),
      userId: this.id.bigInt().toString(),
      newUserState: this.newState,
      claimsTreeRoot: this.oldTreeState.claimsRoot,
      oldUserState: this.oldTreeState.state,
      revTreeRoot: this.oldTreeState.revocationRoot,
      rootsTreeRoot: this.oldTreeState.rootOfRoots,
      signatureR8x: this.signature.R8[0].toString(),
      signatureR8y: this.signature.R8[1].toString(),
      signatureS: this.signature.S.toString()
    };

    if (this.isOldStateGenesis) {
      s.isOldStateGenesis = '1';
    } else {
      s.isOldStateGenesis = '0';
    }

    const nodeAuxAuth = getNodeAuxValue(this.authClaim.nonRevProof.proof);
    s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key;
    s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value;
    s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;

    return new TextEncoder().encode(JSON.stringify(s));
  }
}

interface StateTransitionInputsInternal {
  authClaim: Claim;
  authClaimMtp: string[];
  authClaimNonRevMtp: string[];
  authClaimNonRevMtpAuxHi?: Hash;
  authClaimNonRevMtpAuxHv?: Hash;
  authClaimNonRevMtpNoAux: string;
  userId: string;
  newUserState?: Hash;
  oldUserState?: Hash;
  isOldStateGenesis: string;
  claimsTreeRoot?: Hash;
  revTreeRoot?: Hash;
  rootsTreeRoot?: Hash;
  signatureR8x: string;
  signatureR8y: string;
  signatureS: string;
}

export class StateTransitionPubSignals {
  constructor(public userId: Id, public oldUserState: Hash, public newUserState: Hash) {}

  // PubSignalsUnmarshal unmarshal stateTransition.circom public signals
  pubSignalsUnmarshal(data: Uint8Array): StateTransitionPubSignals {
    const sVals = JSON.parse(new TextDecoder().decode(data));

    const fieldLength = 3;

    if (sVals.length !== fieldLength) {
      throw new Error(
        `invalid number of Output values expected ${fieldLength} got ${sVals.length}`
      );
    }
    this.userId = Id.fromBigInt(BigInt(sVals[0]));
    this.oldUserState = newHashFromString(sVals[1]);
    this.newUserState = newHashFromString(sVals[2]);
    return this;
  }
}
