/**
 * Object containing chain IDs for various blockchains and networks.
 * @type { [key: string]: number }
 */
export const CHAIN_IDS: { [key: string]: number } = {
  ethr: 1,
  'ethr:eth': 1,
  'ethr:eth:main': 1,
  'ethr:eth:goerli': 5,
  polygonid: 137,
  'polygonid:polygon': 137,
  'polygonid:polygon:main': 137,
  'polygonid:polygon:mumbai': 80001
};

/**
 * Registers a new chain ID for a blockchain and network combination.
 * If the blockchain or network is not provided, an error will be thrown.
 * @param {string} methodId - The method ID.
 * @param {number} chainId - The chain ID to be registered.
 * @param {string} blockchain - The blockchain name.
 * @param {string} network - The network name.
 * @beta This API will change in the future.
 * @example
 * registerChainId('ethr', 'eth', 'ropsten', 3);
 */
export const registerChainId = (
  methodId: string,
  chainId: number,
  blockchain?: string,
  network?: string
): void => {
  let prefix = methodId;
  if (blockchain) {
    prefix += `:${blockchain}`;
  }
  if (network) {
    prefix += `:${network}`;
  }

  CHAIN_IDS[prefix] = chainId;
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
export const getChainId = (methodId: string, blockchain?: string, network?: string): number => {
  let prefix = methodId;
  if (blockchain) {
    prefix += `:${blockchain}`;
  }
  if (network) {
    prefix += `:${network}`;
  }
  const chainId = CHAIN_IDS[prefix];
  if (!chainId) {
    throw new Error(`chainId not found for ${prefix}`);
  }
  return chainId;
};
