import { Poseidon } from '@iden3/js-crypto';
import { Bytes, Hasher } from '../types';
import { Constants } from '@iden3/js-iden3-core';

class PoseidonHasher implements Hasher {
  hasher: Poseidon;

  constructor() {
    this.hasher = new Poseidon();
  }

  async Hash(inp: bigint[]): Promise<bigint> {
    return this.hasher.hash(inp);
  }

  async HashBytes(b: Bytes): Promise<bigint> {
    return this.hasher.hashBytes(b);
  }

  Prime(): bigint {
    return Constants.Q;
  }
}

export default PoseidonHasher;
