import { RevocationStatus, CredentialStatus } from '../../verifiable';
import { EthConnectionConfig } from '../../storage/blockchain';
import { CredentialStatusResolver, CredentialStatusResolveOptions } from './resolver';
import { OnChainRevocationStorage } from '../../storage/blockchain/onchain-revocation';
import { DID, Id } from '@iden3/js-iden3-core';
import { getChainId } from '../../storage/blockchain';
import { utils } from 'ethers';

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
   * @param {Array<EthConnectionConfig>} - onchain contract address
   * @param {string} - list of EthConnectionConfig
   */
  constructor(private readonly _configs: EthConnectionConfig[]) {}

  async resolve(
    credentialStatus: CredentialStatus,
    credentialStatusResolveOptions?: CredentialStatusResolveOptions
  ): Promise<RevocationStatus> {
    if (!credentialStatusResolveOptions?.issuerDID) {
      throw new Error('IssuerDID is not set in options');
    }
    return this.getRevocationOnChain(credentialStatus, credentialStatusResolveOptions.issuerDID);
  }

  /**
   * Gets partial revocation status info from onchain issuer contract.
   *
   * @param {CredentialStatus} credentialStatus - credential status section of credential
   * @param {DID} issuerDid - issuer did
   * @returns Promise<RevocationStatus>
   */
  async getRevocationOnChain(
    credentialStatus: CredentialStatus,
    issuer: DID
  ): Promise<RevocationStatus> {
    const { contractAddress, chainId, revocationNonce } =
      this.extractCredentialStatusInfo(credentialStatus);
    if (revocationNonce !== credentialStatus.revocationNonce) {
      throw new Error('revocationNonce does not match');
    }
    const networkConfig = this.networkByChainId(chainId);
    const onChainCaller = new OnChainRevocationStorage(networkConfig, contractAddress);
    const id = DID.idFromDID(issuer);
    const revocationStatus = await onChainCaller.getRevocationStatus(id.bigInt(), revocationNonce);
    return revocationStatus;
  }

  /**
   * Extract information about credential status
   *
   * @param {credentialStatus} CredentialStatus - credential status
   * @returns {{contractAddress: string, chainId: number, revocationNonce: number, issuer: string;}}
   */
  extractCredentialStatusInfo(credentialStatus: CredentialStatus): {
    contractAddress: string;
    chainId: number;
    revocationNonce: number;
    issuer: string;
  } {
    if (!credentialStatus.id) {
      throw new Error('credentialStatus id is empty');
    }

    const idParts = credentialStatus.id.split('/');
    if (idParts.length !== 2) {
      throw new Error('invalid credentialStatus id');
    }

    const issuer = idParts[0];
    const issuerDID = DID.parse(issuer);

    const idURL = new URL(credentialStatus.id);

    // if contractAddress is not present in id as param, then it should be parsed from DID
    let contractAddress = idURL.searchParams.get('contractAddress');
    let chainId: number;
    if (!contractAddress) {
      const issuerId = DID.idFromDID(issuerDID);
      const ethAddr = Id.ethAddressFromId(issuerId);
      contractAddress = utils.getAddress(utils.hexDataSlice(ethAddr, 0));
      const blockchain = DID.blockchainFromId(issuerId);
      const network = DID.networkIdFromId(issuerId);
      chainId = getChainId(blockchain, network);
      if (!chainId) {
        throw new Error(`chain id for '${blockchain}' and '${network}' is not registered`);
      }
    } else {
      const parts = contractAddress.split(':');
      if (parts.length != 2) {
        throw new Error('invalid contract address encoding. should be chainId:contractAddress');
      }
      chainId = parseInt(parts[0], 10);
      contractAddress = parts[1];
    }

    // if revocationNonce is not present in id as param, then it should be extract from credentialStatus
    const rv = idURL.searchParams.get('revocationNonce') || credentialStatus.revocationNonce;
    if (rv === undefined || rv === null) {
      throw new Error('revocationNonce not found in credentialStatus id field');
    }
    const revocationNonce = typeof rv === 'number' ? rv : parseInt(rv, 10);

    return { contractAddress, chainId, revocationNonce, issuer };
  }

  networkByChainId(chainId: number): EthConnectionConfig {
    const network = this._configs.find((c) => c.chainId === chainId);
    if (!network) {
      throw new Error(`chainId "${chainId}" not supported`);
    }
    return network;
  }
}
