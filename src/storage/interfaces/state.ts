import { ZKProof } from '@iden3/js-jwz';
import { Signer } from 'ethers';
import { RootInfo, StateInfo, StateProof } from '../entities/state';

export interface IStateStorage {
  getLatestStateById(issuerId: bigint): Promise<StateInfo>;
  publishState(proof: ZKProof, signer: Signer): Promise<string>;
  getGISTProof(id: bigint): Promise<StateProof>;
  getGISTRootInfo(root: bigint): Promise<RootInfo>;
}
