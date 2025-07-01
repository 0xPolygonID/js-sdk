import { Hash } from '@iden3/js-merkletree';

/** Identity structure that can be used for identity storage */
export type Identity = {
  did: string;
  state?: Hash;
  isStatePublished?: boolean;
  isStateGenesis?: boolean;
};

/** Profile structure that can be used for profiles  storage */
export type Profile = {
  id: string;
  nonce: number | string;
  genesisIdentifier: string;
  verifier: string;
  tag?: string; // format of the tag can be defined by client of sdk
};
