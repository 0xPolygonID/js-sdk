/**
 * Object containing chain IDs for various blockchains and networks.
 * @type { [key: string]: number }
 */
export const CHAIN_IDS: { [key: string]: number } = {
  eth: 1,
  'eth:main': 1,
  'eth:goerli': 5,
  polygon: 137,
  'polygon:main': 137,
  'polygon:mumbai': 80001
};

/**
 * Object containing default networks for DIDs.
 * @type { [key: string]: number }
 */
export const DEFAULT_NETWORKS: { [key: string]: number } = {
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
export const registerChainId = (blockchain: string, chainId: number, network?: string): void => {
  if (network) {
    blockchain += `:${network}`;
  }
  CHAIN_IDS[blockchain] = chainId;
};

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
export const getChainId = (blockchain: string, network?: string): number => {
  if (network) {
    blockchain += `:${network}`;
  }
  const chainId = CHAIN_IDS[blockchain];
  if (!chainId) {
    throw new Error(`chainId not found for ${blockchain}`);
  }
  return chainId;
};

/**
 * Registers a default chain ID for methodId.
 * @param {string} blockchain - The blockchain name.
 * @param {number} chainId - The chain ID to be registered.
 * @param {string} network - The network name.
 * @beta This API will change in the future.
 * @example
 * registerChainId('polygonid', 137);
 */
export const registerDefaultNetworkForMethodId = (methodId: string, chainId: number): void => {
  DEFAULT_NETWORKS[methodId] = chainId;
};

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
export const getDefaultNetworkForMethodId = (methodId: string): number => {
  const chainId = DEFAULT_NETWORKS[methodId];
  if (!chainId) {
    throw new Error(`chainId not found for ${methodId}`);
  }
  return chainId;
};

/**
 * Gets the chain ID for a given methodId, blockchain and network combination.
 * @param {string} methodId - The blockchain name.
 * @param {string} blockchain - The blockchain name.
 * @param {string} network - The network name.
 * @returns {number} The chain ID for the specified blockchain and network.
 * @beta This API will change in the future.
 */
export const getChainIdByDIDsParts = (
  methodId: string,
  blockchain?: string,
  network?: string
): number => {
  if (!blockchain) {
    return getDefaultNetworkForMethodId(methodId);
  }
  return getChainId(blockchain, network);
};
