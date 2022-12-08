import { Hash, Proof } from '@iden3/js-merkletree';

export class Merklizer {
  root(): Hash {
    return new Hash();
  }

  proof(path: string): { proof: Proof; value: any } {
    return { proof: new Proof(), value: null };
  }
}
export class MerklizeOptions {}
export const merklizeJSONLD = (bytes: Uint8Array, ...args: MerklizeOptions[]): Merklizer => {
  return new Merklizer();
};
