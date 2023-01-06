import { ZKProof } from '@iden3/js-jwz';
import { Signer } from 'ethers';
import { StateInfo } from '../entities/state';

export interface StateProof {
  root: bigint;
  existence: boolean;
  siblings: bigint[];
  index: bigint;
  value: bigint;
  auxExistence: boolean;
  auxIndex: bigint;
  auxValue: bigint;
}

export interface IStateStorage {
  getLatestStateById(issuerId: bigint): Promise<StateInfo>;
  publishState(proof: ZKProof, signer: Signer): Promise<string>;
  getGISTProof(id: bigint): Promise<StateProof>;
}
