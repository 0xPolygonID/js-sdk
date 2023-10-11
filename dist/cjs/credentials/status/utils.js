"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGenesisState = void 0;
const js_iden3_core_1 = require("@iden3/js-iden3-core");
/**
 * Checks if state is genesis state
 *
 * @param {string} did - did
 * @param {bigint|string} state  - hash on bigInt or hex string format
 * @returns boolean
 */
function isGenesisState(did, state) {
    if (typeof state === 'string') {
        state = js_iden3_core_1.BytesHelper.bytesToInt(js_iden3_core_1.BytesHelper.hexToBytes(state));
    }
    const id = js_iden3_core_1.DID.idFromDID(did);
    const { method, blockchain, networkId } = js_iden3_core_1.DID.decodePartsFromId(id);
    const type = (0, js_iden3_core_1.buildDIDType)(method, blockchain, networkId);
    const idFromState = js_iden3_core_1.Id.idGenesisFromIdenState(type, state);
    return id.bigInt().toString() === idFromState.bigInt().toString();
}
exports.isGenesisState = isGenesisState;
//# sourceMappingURL=utils.js.map