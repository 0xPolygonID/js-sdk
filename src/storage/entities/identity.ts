import { Hash } from '@iden3/js-merkletree';
import { DIDDocument } from '../../iden3comm';

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
  tags?: string[]; // format of the tags can be defined by client of sdk
  did_doc?: DIDDocument;
};
