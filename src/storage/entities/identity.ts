import { Hash } from '@iden3/js-merkletree';

export type Identity = {
  identifier: string;
  state: Hash;
  published: boolean;
  genesis: boolean;
};
export type Profile = {
  id: string;
  nonce: number;
  genesisIdentifier: string;
  verifier: string;
};
