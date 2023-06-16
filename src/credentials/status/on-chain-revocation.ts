import { RevocationStatus, CredentialStatus } from '../../verifiable';
import { EthConnectionConfig } from '../../storage/blockchain';
import { CredentialStatusResolver } from './resolver';
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
  /**
   *
   * Creates an instance of OnChainIssuer.
   * @param {Array<EthConnectionConfig>} - onhcain contract address
   * @param {string} - list of EthConnectionConfig
   */
  constructor(private readonly _configs: EthConnectionConfig[]) {}

  async resolve(credentialStatus: CredentialStatus, opts?: object): Promise<RevocationStatus> {
    return this.getRevocationOnChain(credentialStatus);
  }

  /**
   * Gets partial revocation status info from onchain issuer contract.
   *
   * @param {CredentialStatus} credentialStatus - credential status section of credential
   * @param {Map<number, string>} listofNetworks - list of supported networks. ChainId: RPC URL
   * @returns Promise<RevocationStatus>
   */
  async getRevocationOnChain(credentialStatus: CredentialStatus): Promise<RevocationStatus> {
    const { contractAddress, chainId, revocationNonce } = this.parseOnChainId(credentialStatus.id);
    if (revocationNonce !== credentialStatus.revocationNonce) {
      throw new Error('revocationNonce does not match');
    }
    const networkConfig = this.networkByChainId(chainId);
    const onChainCaller = new OnChainRevocationStorage(networkConfig, contractAddress);
    const revocationStatus = await onChainCaller.getRevocationStatus(revocationNonce);
    return revocationStatus;
  }

  /**
   * Parse credentialStatus id to get contractAddress, chainId and revocationNonce
   *
   * @param {string} id - credential status id
   * @returns {{contractAddress: string, chainId: number, revocationNonce: number}}
   */
  parseOnChainId(id: string): {
    contractAddress: string;
    chainId: number;
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
    const contractId = url.searchParams.get('contractAddress');
    const revocationNonce = parseInt(url.searchParams.get('revocationNonce'), 10);

    const parts = contractId.split(':');
    if (parts.length != 2) {
      throw new Error('invalid contract address');
    }
    const chainId = parseInt(parts[0], 10);
    const contractAddress = parts[1];

    return { contractAddress, chainId, revocationNonce };
  }

  networkByChainId(chainId: number): EthConnectionConfig {
    const network = this._configs.find((c) => c.chainId === chainId);
    if (!network) {
      throw new Error(`chainId "${chainId}" not supported`);
    }
    return network;
  }
}
