/**
 * Object containing chain IDs for various blockchains and networks.
 * @type { [key: string]: number }
 */
export declare const CHAIN_IDS: {
    [key: string]: number;
};
/**
 * Object containing default networks for DIDs.
 * @type { [key: string]: number }
 */
export declare const DEFAULT_NETWORKS: {
    [key: string]: number;
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
export declare const registerChainId: (blockchain: string, chainId: number, network?: string) => void;
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
export declare const getChainId: (blockchain: string, network?: string) => number;
/**
 * Registers a default chain ID for methodId.
 * @param {string} blockchain - The blockchain name.
 * @param {number} chainId - The chain ID to be registered.
 * @param {string} network - The network name.
 * @beta This API will change in the future.
 * @example
 * registerChainId('polygonid', 137);
 */
export declare const registerDefaultNetworkForMethodId: (methodId: string, chainId: number) => void;
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
export declare const getDefaultNetworkForMethodId: (methodId: string) => number;
/**
 * Gets the chain ID for a given methodId, blockchain and network combination.
 * @param {string} methodId - The blockchain name.
 * @param {string} blockchain - The blockchain name.
 * @param {string} network - The network name.
 * @returns {number} The chain ID for the specified blockchain and network.
 * @beta This API will change in the future.
 */
export declare const getChainIdByDIDsParts: (methodId: string, blockchain?: string, network?: string) => number;
