import { Hash } from '@iden3/js-merkletree';

/** Identity structure that can be used for identity storage */
export type Identity = {
  identifier: string;
  state: Hash;
  published: boolean;
  genesis: boolean;
};

/** Profile structure that can be used for profiles  storage */
export type Profile = {
  id: string;
  nonce: number;
  genesisIdentifier: string;
  verifier: string;
};
