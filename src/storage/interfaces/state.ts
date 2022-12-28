import { Signer } from 'ethers';
import { FullProof } from '../../proof';
import { StateInfo } from '../entities/state';

export interface IStateStorage {
  getLatestStateById(issuerId: bigint): Promise<StateInfo>;
  publishState(proof: FullProof, signer: Signer): Promise<string>;
}
