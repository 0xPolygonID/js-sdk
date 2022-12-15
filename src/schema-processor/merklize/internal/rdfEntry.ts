import { Path } from './path';
import { Hasher } from '../types';
import { DEFAULT_HASHER } from '../constants';
import { mkValueMtEntry } from './merkleTree';

export class RdfEntry {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  constructor(public key: Path, public value: any, public hasher: Hasher = DEFAULT_HASHER) {}

  getHasher(): Hasher {
    return this.hasher;
  }

  getKeyMtEntry(): Promise<bigint> {
    return this.key.mtEntry();
  }

  getValueMtEntry(): Promise<bigint> {
    return mkValueMtEntry(this.getHasher(), this.value);
  }

  async getKeyValueMTEntry(): Promise<{ k: bigint; v: bigint }> {
    const k = await this.getKeyMtEntry();
    const v = await this.getValueMtEntry();
    return { k, v };
  }
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const newRDFEntry = (k: Path, v: any) => {
  const e = new RdfEntry(k, v);
  switch (typeof v) {
    case 'number':
      e.value = BigInt.asIntN(64, BigInt(v));
      break;
    case 'string':
    case 'boolean':
      e.value = v;
      break;
    default:
      if (v instanceof Date) {
        e.value = v;
      } else {
        throw new Error(`error: incorrect value type ${typeof v}`);
      }
  }
  return e;
};
