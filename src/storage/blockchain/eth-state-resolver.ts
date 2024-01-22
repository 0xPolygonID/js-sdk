import { DID, Id } from '@iden3/js-iden3-core';
import { isGenesisState } from '../../credentials';
import { ResolvedState, RootInfo, StateInfo } from '../entities';
import { IStateStorage } from '../interfaces';
import { IStateResolver } from '../interfaces/resolver';

const zeroInt = BigInt(0);
export class EthStateResolver implements IStateResolver {
  constructor(private readonly _stateStorage: IStateStorage) {}

  public async resolve(id: Id, state: bigint): Promise<ResolvedState> {
    const idBigInt = id.bigInt();
    const did = DID.parseFromId(id);
    // check if id is genesis
    const isGenesis = isGenesisState(did, state);
    let contractState: StateInfo;
    try {
      contractState = await this._stateStorage.getStateInfoByIdAndState(idBigInt, state);
    } catch (e) {
      if ((e as { errorArgs: string[] }).errorArgs[0] === 'State does not exist') {
        if (isGenesis) {
          return {
            latest: true,
            genesis: isGenesis,
            state: state,
            transitionTimestamp: 0
          };
        }
        throw new Error('State is not genesis and not registered in the smart contract');
      }
      throw e;
    }

    if (!contractState.id || contractState.id.toString() !== idBigInt.toString()) {
      throw new Error(`state was recorded for another identity`);
    }

    if (!contractState.state || contractState.state.toString() !== state.toString()) {
      if (
        !contractState.replacedAtTimestamp ||
        contractState.replacedAtTimestamp.toString() === zeroInt.toString()
      ) {
        throw new Error(`no information about state transition`);
      }
      return {
        latest: false,
        genesis: false,
        state: state,
        transitionTimestamp: contractState.replacedAtTimestamp.toString()
      };
    }

    return { latest: true, genesis: isGenesis, state, transitionTimestamp: 0 };
  }

  public async rootResolve(state: bigint): Promise<ResolvedState> {
    let globalStateInfo: RootInfo;
    try {
      globalStateInfo = await this._stateStorage.getGISTRootInfo(state);
    } catch (e: unknown) {
      if ((e as { errorArgs: string[] }).errorArgs[0] === 'Root does not exist') {
        throw new Error('GIST root does not exist in the smart contract');
      }
      throw e;
    }

    if (globalStateInfo.root.toString() !== state.toString()) {
      throw new Error(`gist info contains invalid state`);
    }

    if (globalStateInfo.replacedByRoot.toString() !== zeroInt.toString()) {
      if (globalStateInfo.replacedAtTimestamp.toString() === zeroInt.toString()) {
        throw new Error(`state was replaced, but replaced time unknown`);
      }
      return {
        latest: false,
        state: state,
        transitionTimestamp: globalStateInfo.replacedAtTimestamp.toString(),
        genesis: false
      };
    }

    return {
      latest: true,
      state: state,
      transitionTimestamp: 0,
      genesis: false
    };
  }
}
