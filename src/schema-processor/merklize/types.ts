export type Bytes = Uint8Array;

export interface IHasher {
  Hash: (inp: Array<bigint>) => Promise<bigint>;
  HashBytes: (b: Bytes) => Promise<bigint>;
  Prime: () => bigint;
}

export type Value = boolean | number | bigint | Date | string;

export type Parts = Array<string | number>;
