import { Poseidon } from '@iden3/js-crypto'
import { Bytes, IHasher } from '../types';
import { Constants } from "@iden3/js-iden3-core"

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
