import { buildDIDType, DID, Id, BytesHelper } from '@iden3/js-iden3-core';
/**
 * Checks if state is genesis state
 *
 * @param {string} did - did
 * @param {bigint|string} state  - hash on bigInt or hex string format
 * @returns boolean
 */
export function isGenesisState(did, state) {
    if (typeof state === 'string') {
        state = BytesHelper.bytesToInt(BytesHelper.hexToBytes(state));
    }
    const id = DID.idFromDID(did);
    const { method, blockchain, networkId } = DID.decodePartsFromId(id);
    const type = buildDIDType(method, blockchain, networkId);
    const idFromState = Id.idGenesisFromIdenState(type, state);
    return id.bigInt().toString() === idFromState.bigInt().toString();
}
//# sourceMappingURL=utils.js.map