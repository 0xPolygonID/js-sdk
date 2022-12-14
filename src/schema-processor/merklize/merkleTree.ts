import {
  inMemmoryDB,
  Merkletree as MT,
  Proof,
  str2Bytes,
  ZERO_HASH,
  Hash,
  verifyProof
} from '@iden3/js-merkletree';
import { IHasher } from './types';
import { stringToBytes } from '../../iden3comm/utils';
import { RdfEntry } from './rdfEntry';

class MerkleTree {
  mt: MT;

  constructor(prefix = '', writable = true, maxLevels = 40) {
    const str = new inMemmoryDB(str2Bytes(prefix));
    this.mt = new MT(str, writable, maxLevels);
  }

  async add(k: bigint, v: bigint) {
    await this.mt.add(k, v);
  }

  async generateProof(v: bigint) {
    return await this.mt.generateProof(v, ZERO_HASH);
  }

  static verifyProof(root: Hash, p: Proof, k: bigint, v: bigint) {
    return verifyProof(root, p, k, v);
  }

  root() {
    return this.mt.root;
  }
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const mkValueMtEntry = async (h: IHasher, v: any): Promise<bigint> => {
  switch (typeof v) {
    case 'bigint': {
      return mkValueInt(h, v);
      break;
    }
    case 'string': {
      return mkValueString(h, v);
      break;
    }
    case 'boolean': {
      return mkValueBool(h, v);
      break;
    }
    case 'object': {
      if (v instanceof Date) {
        return mkValueTime(h, v);
      }
      break;
    }
    default:
      throw `error: unexpected type ${typeof v}`;
  }
};

const mkValueInt = (h: IHasher, v: bigint) => {
  if (v >= 0) {
    return BigInt.asIntN(64, v);
  }
  return h.Prime() + BigInt.asIntN(64, v);
};

// eslint-disable-next-line  @typescript-eslint/no-unused-vars
const mkValueUInt = (h: IHasher, v: bigint) => {
  return BigInt.asUintN(64, v);
};

const mkValueBool = (h: IHasher, v: boolean) => {
  if (v) {
    return h.Hash([BigInt.asIntN(64, BigInt(1))]);
  } else {
    return h.Hash([BigInt.asIntN(64, BigInt(0))]);
  }
};

const mkValueString = (h: IHasher, v: string) => {
  const b = stringToBytes(v);
  return h.HashBytes(b);
};

const mkValueTime = (h: IHasher, v: Date) => {
  // convert unixTimeStamp from ms -> ns as in go implementation
  const unixTimeStamp = v.valueOf() * 10_00_000; // parseInt(`${v.getTime()*10_00_000}`).toFixed(0)
  return mkValueInt(h, BigInt(unixTimeStamp));
};

export const addEntriesToMerkleTree = async (mt: MerkleTree, entries: Array<RdfEntry>) => {
  for (const e of entries) {
    const { k, v } = await e.getKeyValueMTEntry();
    await mt.add(k, v);
  }
};

export default MerkleTree;
