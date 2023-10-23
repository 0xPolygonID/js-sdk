import { buildDIDType, DID, Id } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';
/**
 * Checks if state is genesis state
 *
 * @param {string} did - did
 * @param {bigint|string} state  - hash on bigInt or hex string format
 * @returns boolean
 */
export function isGenesisState(did: DID, state: bigint | string): boolean {
  if (typeof state === 'string') {
    state = Hash.fromHex(state).bigInt();
  }
  const id = DID.idFromDID(did);
  const { method, blockchain, networkId } = DID.decodePartsFromId(id);
  const type = buildDIDType(method, blockchain, networkId);
  const idFromState = Id.idGenesisFromIdenState(type, state);

  return id.bigInt().toString() === idFromState.bigInt().toString();
}
