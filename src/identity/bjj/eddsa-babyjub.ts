// const crypto = require('crypto');
// const createBlakeHash = require('blake-hash');
// const { buildEddsa, buildBabyjub } = require('circomlibjs');

import { buildEddsa, buildBabyjub } from './circomlib';
// import {Hex} from '@iden3/js-iden3-core';
// import {newHashFromHex} from '@iden3/js-merkletree';
const { Hex } = require('@iden3/js-iden3-core');
const { newHashFromHex } = require('@iden3/js-merkletree');

const getEddsa = async () => {
  // console.log(circomLib);
  // return await circomLib.buildEddsa();
  console.log(newHashFromHex);
  return await buildEddsa();
};

const getBabyJub = async () => {
  // return await circomLib.buildBabyjub();
  return await buildBabyjub();
};

/**
 * Class representing EdDSA Baby Jub signature
 */
export class Signature {
  r8: [bigint, bigint];
  s: bigint;

  /**
   * Create a Signature with the R8 point and S scalar
   * @param {Array[bigint]} r8 - R8 point
   * @param {bigint} s - Scalar
   */
  constructor(r8: [bigint, bigint], s: bigint) {
    this.r8 = r8;
    this.s = s;
  }

  /**
   * Create a Signature from a compressed Signature Uint8Array
   * @param {Uint8Array} buf - Uint8Array containing a signature
   * @returns {Signature} Object signature
   */
  // static newFromCompressed(buf: Uint8Array): Signature {
  // 	if (buf.length !== 64) {
  // 		throw new Error('buf must be 64 bytes');
  // 	}
  // 	const sig = eddsa.unpackSignature(buf);
  // 	if (sig.R8 == null) {
  // 		throw new Error('unpackSignature failed');
  // 	}
  // 	return new Signature(sig.R8, sig.S);
  // }

  /**
   * Take the signature and pack it into a Uint8Array
   * @returns {Uint8Array} - Signature compressed
   */
  async compress(): Promise<Uint8Array> {
    const eddsa = await getEddsa();
    return eddsa.packSignature({ R8: this.r8, S: this.s });
  }

  /**
   * Take the signature and pack it into an hex encoding
   * @returns {string} - hex encoding of the signature
   */
  // toString(): string {
  // 	return Hex.encodeString(this.compress());
  // 	// return this.compress().toString('hex');
  // }
}

/**
 * Class representing a EdDSA baby jub public key
 */
export class PublicKey {
  p: [bigint, bigint];

  /**
   * Create a PublicKey from a curve point p
   * @param {Array[bigint]} p - curve point
   */
  constructor(p: [bigint, bigint]) {
    this.p = p;
  }

  /**
   * Create a PublicKey from a compressed PublicKey Uint8Array
   * @param {Uint8Array} buf - compressed public key in a Uint8Array
   * @returns {PublicKey} public key class
   */
  // static newFromCompressed(buf: Uint8Array): PublicKey {
  // 	if (buf.length !== 32) {
  // 		throw new Error('buf must be 32 bytes');
  // 	}
  // 	// const bufLE = utils.swapEndianness(buf);
  // 	const p = babyJub.unpackPoint(buf);
  // 	if (p == null) {
  // 		throw new Error('unpackPoint failed');
  // 	}
  // 	return new PublicKey(p);
  // }

  /**
   * Compress the PublicKey
   * @returns {Uint8Array} - point compressed into a Uint8Array
   */
  async compress(): Promise<Uint8Array> {
    // return utils.swapEndianness(babyJub.packPoint(this.p));
    const babyJub = await getBabyJub();
    return babyJub.packPoint(this.p);
  }
  /**
   * Compress the PublicKey
   * @returns {Uint8Array} - point compressed into a Uint8Array
   */

  async deCompress(buf: Uint8Array): Promise<PublicKey> {
    // return utils.swapEndianness(babyJub.packPoint(this.p));
    const babyJub = await getBabyJub();
    return babyJub.unpackPoint(buf);
  }

  /**
   * Compress the PublicKey
   * @returns {string} - hex encoding of the compressed public key
   */
  async toString(): Promise<string> {
    return await Hex.encodeString(await this.compress());
    // return this.compress().toString('hex');
  }

  /**
   * Verify the signature of a bigint message using mimc7 hash
   * @param {bigint} msg - message to verify
   * @param {Signature} sig - signature to check
   * @returns {boolean} True if validation is succesfull; otherwise false
   */
  async verifyMimc7(msg: bigint, sig: Signature): Promise<boolean> {
    const eddsa = await getEddsa();
    return eddsa.verifyMiMC(msg, { R8: sig.r8, S: sig.s }, this.p);
  }

  /**
   * Verify the signature of a bigint message using Poseidon hash
   * @param {bigint} msg - message to verify
   * @param {Signature} sig - signature to check
   * @returns {boolean} True if validation is succesfull; otherwise false
   */
  async verifyPoseidon(msg: bigint, sig: Signature): Promise<boolean> {
    const eddsa = await getEddsa();
    return eddsa.verifyPoseidon(msg, { R8: sig.r8, S: sig.s }, this.p);
  }
}

/**
 * Class representing EdDSA Baby Jub private key
 */
export class PrivateKey {
  sk: Uint8Array;

  /**
   * Create a PirvateKey from a 32 byte Uint8Array
   * @param {Uint8Array} buf - private key
   */
  constructor(buf: Uint8Array) {
    if (buf.length !== 32) {
      throw new Error('buf must be 32 bytes');
    }
    this.sk = buf;
  }

  /**
   * Create a random PrivateKey
   * @returns {PrivateKey} PrivateKey class created from a random private key
   */
  // static newRandom(): PrivateKey {
  // 	const buf = crypto.randomBytes(Math.floor(256 / 8));
  // 	return new PrivateKey(buf);
  // }

  /**
   * Return the PrivateKey in hex encoding
   * @returns {string} hex string representing the private key
   */
  toString(): string {
    return Hex.encodeString(this.sk);
    // return this.sk.toString('hex');
  }

  /**
   * Retrieve PublicKey of the PrivateKey
   * @returns {PublicKey} PublicKey derived from PrivateKey
   */
  async public(): Promise<PublicKey> {
    const eddsa = await getEddsa();
    return new PublicKey(eddsa.prv2pub(this.sk));
  }

  /**
   * Retrieve private scalar of the PrivateKey
   * @returns {bigint} Prvate scalar derived from PrivateKey
   */
  // toPrivScalar(): bigint {
  // 	const h1 = createBlakeHash('blake512').update(this.sk).digest();
  // 	const sBuff = eddsa.pruneUint8Array(h1.slice(0, 32));
  // 	return (bigint.leBuff2int(sBuff)).shr(3);
  // }

  /**
   * Sign a bigint message using mimc7 hash
   * @param {bigint} msg - message to sign
   * @returns {Signature} Signature generated
   */
  async signMimc7(msg: bigint): Promise<Signature> {
    const eddsa = await getEddsa();
    const s = eddsa.signMiMC(this.sk, msg);
    return new Signature(s.R8, s.S);
  }

  /**
   * Sign a bigint message using Poseidon hash
   * @param {bigint} msg - message to sign
   * @returns {Signature} Signature generated
   */
  async signPoseidon(msg: bigint): Promise<Signature> {
    const eddsa = await getEddsa();
    const s = eddsa.signPoseidon(this.sk, msg);
    return new Signature(s.R8, s.S);
  }
}

export function createNewPrivateKeySeed(seed: Uint8Array) {
  return new PrivateKey(seed);
}
