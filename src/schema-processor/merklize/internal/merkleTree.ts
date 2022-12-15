import { inMemmoryDB, str2Bytes, Merkletree } from '@iden3/js-merkletree';
import { IHasher } from '../types';
import { stringToBytes } from '../../../iden3comm/utils';
import { RdfEntry } from './rdfEntry';

export const getMerkleTreeInitParam = (
  prefix = '',
  writable = true,
  maxLevels = 40
): {
  db: inMemmoryDB;
  writable: boolean;
  maxLevels: number;
} => {
  return {
    db: new inMemmoryDB(str2Bytes(prefix)),
    writable,
    maxLevels
  };
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const mkValueMtEntry = async (h: IHasher, v: any): Promise<bigint> => {
  switch (typeof v) {
    case 'bigint': {
      return mkValueInt(h, v);
    }
    case 'string': {
      return mkValueString(h, v);
    }
    case 'boolean':
      {
        return mkValueBool(h, v);
      }
      break;
    default: {
      if (v instanceof Date) {
        return mkValueTime(h, v);
      }
      throw `error: unexpected type ${typeof v}`;
    }
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
  }
  return h.Hash([BigInt.asIntN(64, BigInt(0))]);
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

export const addEntriesToMerkleTree = async (mt: Merkletree, entries: Array<RdfEntry>) => {
  for (const e of entries) {
    const { k, v } = await e.getKeyValueMTEntry();
    await mt.add(k, v);
  }
};
