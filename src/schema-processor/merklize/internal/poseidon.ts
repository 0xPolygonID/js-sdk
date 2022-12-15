import { Poseidon } from '../js-crypto';
import { Bytes, IHasher } from '../types';
import { Constants } from '../js-iden3-core';

class PoseidonHasher implements IHasher {
  hasher: Poseidon;

  constructor() {
    this.hasher = new Poseidon();
  }

  async Hash(inp: bigint[]) {
    return this.hasher.hash(inp);
  }

  async HashBytes(b: Bytes) {
    return this.hasher.hashBytes(b);
  }

  Prime() {
    return Constants.Q;
  }
}

export default PoseidonHasher;
