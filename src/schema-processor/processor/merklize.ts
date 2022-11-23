import { Hash } from "@iden3/js-merkletree";

export class Merklizer {

	root(): Hash {
		return new Hash();
	}
}
export class MerklizeOptions {}
export const merklizeJSONLD = (bytes: Uint8Array, ...args: MerklizeOptions[]): Merklizer => {
  return new Merklizer();
};
