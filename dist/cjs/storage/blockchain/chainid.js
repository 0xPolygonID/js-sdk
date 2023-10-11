"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChainIdByDIDsParts = exports.getDefaultNetworkForMethodId = exports.registerDefaultNetworkForMethodId = exports.getChainId = exports.registerChainId = exports.DEFAULT_NETWORKS = exports.CHAIN_IDS = void 0;
/**
 * Object containing chain IDs for various blockchains and networks.
 * @type { [key: string]: number }
 */
exports.CHAIN_IDS = {
    eth: 1,
    'eth:main': 1,
    'eth:goerli': 5,
    'eth:sepolia': 11155111,
    polygon: 137,
    'polygon:main': 137,
    'polygon:mumbai': 80001,
    zkevm: 1101,
    'zkevm:main': 1101,
    'zkevm:test': 1442
};
/**
 * Object containing default networks for DIDs.
 * @type { [key: string]: number }
 */
exports.DEFAULT_NETWORKS = {
    ethr: 1,
    polygonid: 137
};
/**
 * Registers a new chain ID for a blockchain and network combination.
 * @param {string} blockchain - The blockchain name.
 * @param {number} chainId - The chain ID to be registered.
 * @param {string} network - The network name.
 * @beta This API will change in the future.
 * @example
 * registerChainId('eth', 3, 'ropsten');
 */
const registerChainId = (blockchain, chainId, network) => {
    if (network) {
        blockchain += `:${network}`;
    }
    exports.CHAIN_IDS[blockchain] = chainId;
};
exports.registerChainId = registerChainId;
/**
 * Gets the chain ID for a given blockchain and network combination.
 * If the chain ID is not found, 0 will be returned.
 * @param {string} blockchain - The blockchain name.
 * @param {string} network - The network name.
 * @returns {number} The chain ID for the specified blockchain and network.
 * @throws {Error} Throws an error if the chainId not found.
 * @beta This API will change in the future.
 * @example
 * const chainId = getChainId('ethr', eth', 'main');
 * // chainId will be 1
 */
const getChainId = (blockchain, network) => {
    if (network) {
        blockchain += `:${network}`;
    }
    const chainId = exports.CHAIN_IDS[blockchain];
    if (!chainId) {
        throw new Error(`chainId not found for ${blockchain}`);
    }
    return chainId;
};
exports.getChainId = getChainId;
/**
 * Registers a default chain ID for methodId.
 * @param {string} blockchain - The blockchain name.
 * @param {number} chainId - The chain ID to be registered.
 * @param {string} network - The network name.
 * @beta This API will change in the future.
 * @example
 * registerChainId('polygonid', 137);
 */
const registerDefaultNetworkForMethodId = (methodId, chainId) => {
    exports.DEFAULT_NETWORKS[methodId] = chainId;
};
exports.registerDefaultNetworkForMethodId = registerDefaultNetworkForMethodId;
/**
 * Gets the chain ID for a given methodId.
 * If the chain ID is not found, 0 will be returned.
 * @param {string} methodId - The blockchain name.
 * @returns {number} The chain ID for the specified blockchain and network.
 * @throws {Error} Throws an error if the chainId not found.
 * @beta This API will change in the future.
 * @example
 * const chainId = getChainId('polygonid');
 * // chainId will be 137
 */
const getDefaultNetworkForMethodId = (methodId) => {
    const chainId = exports.DEFAULT_NETWORKS[methodId];
    if (!chainId) {
        throw new Error(`chainId not found for ${methodId}`);
    }
    return chainId;
};
exports.getDefaultNetworkForMethodId = getDefaultNetworkForMethodId;
/**
 * Gets the chain ID for a given methodId, blockchain and network combination.
 * @param {string} methodId - The blockchain name.
 * @param {string} blockchain - The blockchain name.
 * @param {string} network - The network name.
 * @returns {number} The chain ID for the specified blockchain and network.
 * @beta This API will change in the future.
 */
const getChainIdByDIDsParts = (methodId, blockchain, network) => {
    if (!blockchain) {
        return (0, exports.getDefaultNetworkForMethodId)(methodId);
    }
    return (0, exports.getChainId)(blockchain, network);
};
exports.getChainIdByDIDsParts = getChainIdByDIDsParts;
//# sourceMappingURL=chainid.js.map