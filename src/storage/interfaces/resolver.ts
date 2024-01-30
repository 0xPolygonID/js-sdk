import { Id } from '@iden3/js-iden3-core';
import { ResolvedState } from '../entities';

export interface IStateResolver {
  resolve(id: Id, state: bigint): Promise<ResolvedState>;
  rootResolve(state: bigint): Promise<ResolvedState>;
}

// export type StateResolvers = {
//   [key: string]: IStateResolver;
// };
