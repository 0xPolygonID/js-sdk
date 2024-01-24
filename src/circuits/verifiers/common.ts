import { DID, Id } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';
import { IStateResolver, ResolvedState, StateResolvers } from '../../storage';

export function getResolverByID(resolvers: StateResolvers, id: Id): IStateResolver {
  const userDID = DID.parseFromId(id);
  return getResolverByDID(resolvers, userDID);
}

export function getResolverByDID(resolvers: StateResolvers, did: DID): IStateResolver {
  const { blockchain, networkId } = DID.decodePartsFromId(DID.idFromDID(did));
  return resolvers[`${blockchain}:${networkId}`];
}

export const userStateError = new Error(`user state is not valid`);

export async function checkUserState(
  resolver: IStateResolver,
  userId: Id,
  userState: Hash
): Promise<ResolvedState> {
  const userStateResolved: ResolvedState = await resolver.resolve(userId, userState.bigInt());
  if (!userStateResolved.latest) {
    throw userStateError;
  }
  return userStateResolved;
}

export async function checkGlobalState(
  resolver: IStateResolver,
  state: Hash
): Promise<ResolvedState> {
  const gistStateResolved: ResolvedState = await resolver.rootResolve(state.bigInt());
  return gistStateResolved;
}

export async function checkIssuerNonRevState(
  resolver: IStateResolver,
  issuerId: Id,
  issuerClaimNonRevState: Hash
): Promise<ResolvedState> {
  const issuerNonRevStateResolved: ResolvedState = await resolver.resolve(
    issuerId,
    issuerClaimNonRevState.bigInt()
  );
  return issuerNonRevStateResolved;
}
