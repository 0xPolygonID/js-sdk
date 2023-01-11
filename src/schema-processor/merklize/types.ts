export interface Hasher {
  hash: (inp: Array<bigint>) => Promise<bigint>;
  hashBytes: (b: Uint8Array) => Promise<bigint>;
  prime: () => bigint;
}

export type Value = boolean | number | bigint | Date | string;

export type Parts = Array<string | number>;
