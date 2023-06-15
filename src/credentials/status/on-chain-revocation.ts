import { RevocationStatus, CredentialStatus } from '../../verifiable';
import { EthConnectionConfig } from '../../storage/blockchain';
import { CredentialStatusResolver } from './iresolver';
import { OnChainRevocationStorage } from '../../storage/blockchain/onchain-revocation';

/**
 * OnChainIssuer is a class that allows to interact with the onchain contract
 * and build the revocation status.
 *
 * @export
 * @beta
 * @class OnChainIssuer
 */
export class OnChainResolver implements CredentialStatusResolver {
  private readonly configs: Array<EthConnectionConfig>;
  // is possible add cache layer for connections.

  /**
   *
   * Creates an instance of OnChainIssuer.
   * @param {Array<EthConnectionConfig>} - onhcain contract address
   * @param {string} - list of EthConnectionConfig
   */
  constructor(configs: Array<EthConnectionConfig>) {
    this.configs = configs;
  }

  async resolve(credentialStatus: CredentialStatus, opts?: object): Promise<RevocationStatus> {
    return this.getRevocationOnChain(credentialStatus);
  }

  /**
   * Gets partial revocation status info from onchain issuer contract.
   *
   * @param {CredentialStatus} credentialStatus - credential status section of credential
   * @param {Map<number, string>} listofNetworks - list of supported networks. ChainID: RPC URL
   * @returns Promise<RevocationStatus>
   */
  async getRevocationOnChain(credentialStatus: CredentialStatus): Promise<RevocationStatus> {
    const { contractAddress, chainID, revocationNonce } = this.parseOnChainID(credentialStatus.id);
    if (revocationNonce !== credentialStatus.revocationNonce) {
      throw new Error('revocationNonce does not match');
    }
    const networkConfig = this.networkByChainID(chainID);
    const onChainCaller = new OnChainRevocationStorage(networkConfig, contractAddress);
    const revocationStatus = await onChainCaller.getRevocationStatus(revocationNonce);
    return revocationStatus;
  }

  /**
   * Parse credentialStatus id to get contractAddress, chainID and revocationNonce
   *
   * @param {string} id - credential status id
   * @returns {{contractAddress: string, chainID: number, revocationNonce: number}}
   */
  parseOnChainID(id: string): {
    contractAddress: string;
    chainID: number;
    revocationNonce: number;
  } {
    const url = new URL(id);
    if (!url.searchParams.has('contractAddress')) {
      throw new Error('contractAddress not found');
    }
    if (!url.searchParams.has('revocationNonce')) {
      throw new Error('revocationNonce not found');
    }
    // TODO (illia-korotia): after merging core v2 need to parse contract address from did if `contractAddress` is not present in id as param
    const contractID = url.searchParams.get('contractAddress');
    const revocationNonce = parseInt(url.searchParams.get('revocationNonce'), 10);

    const parts = contractID.split(':');
    if (parts.length != 2) {
      throw new Error('invalid contract address');
    }
    const chainID = parseInt(parts[0], 10);
    const contractAddress = parts[1];

    return { contractAddress, chainID, revocationNonce };
  }

  networkByChainID(chainID: number): EthConnectionConfig {
    const network = this.configs.find((c) => c.chainId === chainID);
    if (!network) {
      throw new Error(`chainID "${chainID}" not supported`);
    }
    return network;
  }
}
