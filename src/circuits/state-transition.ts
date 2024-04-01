import { Signature } from '@iden3/js-crypto';
import { Id } from '@iden3/js-iden3-core';
import { Hash, Proof } from '@iden3/js-merkletree';
import { BaseConfig, getNodeAuxValue, prepareSiblingsStr } from './common';
import { ClaimWithMTPProof, TreeState, CircuitError } from './models';
import { byteDecoder, byteEncoder } from '../utils';

/**
 * StateTransition circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class StateTransitionInputs
 * @extends {BaseConfig}
 */
export class StateTransitionInputs extends BaseConfig {
  id!: Id;
  oldTreeState!: TreeState;
  newTreeState!: TreeState;

  isOldStateGenesis!: boolean;
  authClaim!: ClaimWithMTPProof;

  authClaimNewStateIncProof!: Proof;

  signature!: Signature;

  /**
   * CircuitInputMarshal returns Circom private inputs for stateTransition.circom
   *
   * @returns Uint8Array
   */
  inputsMarshal(): Uint8Array {
    if (!this.authClaim?.incProof?.proof) {
      throw new Error(CircuitError.EmptyAuthClaimProof);
    }

    if (!this.authClaimNewStateIncProof) {
      throw new Error(CircuitError.EmptyAuthClaimProofInTheNewState);
    }

    if (!this.authClaim.nonRevProof?.proof) {
      throw new Error(CircuitError.EmptyAuthClaimNonRevProof);
    }

    const s: Partial<StateTransitionInputsInternal> = {
      authClaim: this.authClaim?.claim?.marshalJson(),
      authClaimMtp: prepareSiblingsStr(this.authClaim.incProof.proof, this.getMTLevel()),
      authClaimNonRevMtp: prepareSiblingsStr(this.authClaim.nonRevProof.proof, this.getMTLevel()),
      newAuthClaimMtp: prepareSiblingsStr(this.authClaimNewStateIncProof, this.getMTLevel()),
      userID: this.id?.bigInt().toString(),
      newUserState: this.newTreeState?.state?.bigInt().toString(),
      claimsTreeRoot: this.oldTreeState?.claimsRoot?.bigInt().toString(),
      oldUserState: this.oldTreeState?.state?.bigInt().toString(),
      revTreeRoot: this.oldTreeState?.revocationRoot?.bigInt().toString(),
      rootsTreeRoot: this.oldTreeState?.rootOfRoots?.bigInt().toString(),
      signatureR8x: this.signature.R8[0].toString(),
      signatureR8y: this.signature.R8[1].toString(),
      signatureS: this.signature.S.toString(),
      newClaimsTreeRoot: this.newTreeState?.claimsRoot?.bigInt().toString(),
      newRootsTreeRoot: this.newTreeState?.rootOfRoots?.bigInt().toString(),
      newRevTreeRoot: this.newTreeState?.revocationRoot?.bigInt().toString()
    };

    if (this.isOldStateGenesis) {
      s.isOldStateGenesis = '1';
    } else {
      s.isOldStateGenesis = '0';
    }

    const nodeAuxAuth = getNodeAuxValue(this.authClaim.nonRevProof.proof);
    s.authClaimNonRevMtpAuxHi = nodeAuxAuth.key.bigInt().toString();
    s.authClaimNonRevMtpAuxHv = nodeAuxAuth.value.bigInt().toString();
    s.authClaimNonRevMtpNoAux = nodeAuxAuth.noAux;

    return byteEncoder.encode(JSON.stringify(s));
  }
}

interface StateTransitionInputsInternal {
  authClaim: string[];
  authClaimMtp: string[];
  authClaimNonRevMtp: string[];
  authClaimNonRevMtpAuxHi?: string;
  authClaimNonRevMtpAuxHv?: string;
  authClaimNonRevMtpNoAux: string;
  userID: string;
  newUserState?: string;
  oldUserState?: string;
  isOldStateGenesis: string;
  claimsTreeRoot?: string;
  revTreeRoot?: string;
  rootsTreeRoot?: string;
  signatureR8x: string;
  signatureR8y: string;
  signatureS: string;
  newAuthClaimMtp: string[];
  newClaimsTreeRoot: string;
  newRevTreeRoot: string;
  newRootsTreeRoot: string;
}

/**
 * Public signals of StateTransition circuit
 *
 * @public
 * @class StateTransitionPubSignals
 */
export class StateTransitionPubSignals {
  userId!: Id;
  oldUserState!: Hash;
  newUserState!: Hash;
  isOldStateGenesis!: boolean;

  /**
   *
   *
   * PubSignalsUnmarshal unmarshal stateTransition.circom public signal
   * @param {Uint8Array} data
   * @returns StateTransitionPubSignals
   */
  pubSignalsUnmarshal(data: Uint8Array): StateTransitionPubSignals {
    const sVals = JSON.parse(byteDecoder.decode(data));

    const fieldLength = 4;

    if (sVals.length !== fieldLength) {
      throw new Error(
        `invalid number of Output values expected ${fieldLength} got ${sVals.length}`
      );
    }
    this.userId = Id.fromBigInt(BigInt(sVals[0]));
    this.oldUserState = Hash.fromString(sVals[1]);
    this.newUserState = Hash.fromString(sVals[2]);
    this.isOldStateGenesis = BigInt(sVals[3]) === BigInt(1);

    return this;
  }
}
