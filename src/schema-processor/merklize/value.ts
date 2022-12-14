import { mkValueMtEntry } from './merkleTree';
import { IHasher } from './types';
import { DEFAULT_HASHER } from './constants';

export class Value {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  val: any;

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  constructor(val: any, public hasher: IHasher = DEFAULT_HASHER) {
    this.val = val;
    if (!this.isBoolean() && !this.isNum() && !this.isDate() && !this.isString()) {
      throw 'error: unexpected type';
    }
  }

  mkMTEntry() {
    return mkValueMtEntry(this.hasher, this.val);
  }

  isBoolean(): boolean {
    return typeof this.val === 'boolean';
  }

  isNum(): boolean {
    return typeof this.val === 'number' || typeof this.val === 'bigint';
  }

  isDate(): boolean {
    return this.val instanceof Date;
  }

  asDate(): Date {
    return this.val as Date;
  }

  isString(): boolean {
    return typeof this.val === 'string';
  }

  asString(): string {
    return this.val as string;
  }
}
