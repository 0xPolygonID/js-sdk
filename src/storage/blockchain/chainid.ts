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
 * Registers a new chain ID for a blockchain and network combination.
 * If the blockchain or network is not provided, an error will be thrown.
 * @param {string} blockchain - The blockchain name.
 * @param {string} network - The network name.
 * @param {number} chainId - The chain ID to be registered.
 * @throws {Error} Throws an error if the blockchain name is not provided.
 * @example
 * RegisterChainId('eth', 'ropsten', 3);
 */
export const RegisterChainId = (blockchain: string, network: string, chainId: number): void => {
  if (!blockchain) {
    throw new Error('blockchain is required');
  }
  let prefix = blockchain;
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
 * @example
 * const chainId = GetChainId('eth', 'main');
 * // chainId will be 1
 */
export const GetChainId = (blockchain: string, network: string): number => {
  let prefix = blockchain;
  if (network) {
    prefix += `:${network}`;
  }
  const chainId = CHAIN_IDS[prefix];
  if (!chainId) {
    return 0;
  }
  return chainId;
};
