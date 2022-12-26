import { InMemoryDB, str2Bytes, Merkletree } from '@iden3/js-merkletree';

import { Hasher } from '../types';
import { RdfEntry } from './rdfEntry';

export const getMerkleTreeInitParam = (
  prefix = '',
  writable = true,
  maxLevels = 40
): {
  db: InMemoryDB;
  writable: boolean;
  maxLevels: number;
} => {
  return {
    db: new InMemoryDB(str2Bytes(prefix)),
    writable,
    maxLevels
  };
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const mkValueMtEntry = async (h: Hasher, v: any): Promise<bigint> => {
  switch (typeof v) {
    case 'bigint': {
      return mkValueInt(h, v);
    }
    case 'string': {
      return mkValueString(h, v);
    }
    case 'boolean': {
      return mkValueBool(h, v);
    }
    default: {
      if (v instanceof Date) {
        return mkValueTime(h, v);
      }
      throw new Error(`error: unexpected type ${typeof v}`);
    }
  }
};

const mkValueInt = (h: Hasher, v: bigint): bigint => {
  if (v >= 0) {
    return BigInt.asIntN(64, v);
  }
  return h.prime() + BigInt.asIntN(64, v);
};

// eslint-disable-next-line  @typescript-eslint/no-unused-vars
const mkValueUInt = (h: Hasher, v: bigint): bigint => {
  return BigInt.asUintN(64, v);
};

const mkValueBool = (h: Hasher, v: boolean): Promise<bigint> => {
  if (v) {
    return h.hash([BigInt.asIntN(64, BigInt(1))]);
  }
  return h.hash([BigInt.asIntN(64, BigInt(0))]);
};

const stringToBytes = (str: string): Uint8Array => {
  const textEncoder = new TextEncoder();
  return textEncoder.encode(str);
};

const mkValueString = (h: Hasher, v: string): Promise<bigint> => {
  const b = stringToBytes(v);
  return h.hashBytes(b);
};

const mkValueTime = (h: Hasher, v: Date): bigint => {
  // convert unixTimeStamp from ms -> ns as in go implementation
  const unixTimeStamp = v.valueOf() * 10_00_000; // parseInt(`${v.getTime()*10_00_000}`).toFixed(0)
  return mkValueInt(h, BigInt(unixTimeStamp));
};

export const addEntriesToMerkleTree = async (
  mt: Merkletree,
  entries: Array<RdfEntry>
): Promise<void> => {
  for (const e of entries) {
    const { k, v } = await e.getKeyValueMTEntry();
    await mt.add(k, v);
  }
};
