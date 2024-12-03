import { DID, Id, chainIDfromDID } from '@iden3/js-iden3-core';
import { Contract, ethers } from 'ethers';
import { INonMerklizedIssuerABI as abi } from '@iden3/onchain-non-merklized-issuer-base-abi';
import { Options } from '@iden3/js-jsonld-merklization';
import { W3CCredential } from '../../verifiable';
import { OnchainNonMerklizedIssuerAdapter } from './onchain-issuer-adapter/non-merklized/version/v0.0.1/onchain-non-merklized-issuer-adapter';
import { EthConnectionConfig } from './state';
import { IOnchainIssuer } from '../interfaces/onchain-issuer';

/**
 * Represents an adapter for interacting with on-chain issuers.
 *
 * @public
 * @beta
 * @class OnchainIssuer
 */
export class OnchainIssuer implements IOnchainIssuer {
  private readonly _ethConnectionConfig: EthConnectionConfig[];
  private readonly _merklizationOptions?: Options;

  /**
   * Initializes an instance of `Adapter`.
   * @param config The configuration for the Ethereum connection.
   * @param merklizationOptions Optional settings for merklization.
   */
  constructor(config: EthConnectionConfig[], options?: Options) {
    this._ethConnectionConfig = config;
    this._merklizationOptions = options;
  }

  /**
   * Retrieves a credential from the on-chain issuer.
   * @param issuerDID The issuer's core.DID.
   * @param userId The user's core.Id.
   * @param credentialId The unique identifier of the credential.
   */
  public async getCredential(
    issuerDID: DID,
    userDID: DID,
    credentialId: bigint
  ): Promise<W3CCredential> {
    const { contract, connection } = this.getContractConnection(issuerDID);
    const response = await contract.getCredentialAdapterVersion();
    switch (response) {
      case '0.0.1': {
        const adapter = new OnchainNonMerklizedIssuerAdapter(connection, issuerDID, {
          merklizationOptions: this._merklizationOptions
        });
        await adapter.isInterfaceSupported();
        const { credentialData, coreClaimBigInts, credentialSubjectFields } =
          await adapter.getCredential(DID.idFromDID(userDID), credentialId);
        return await adapter.convertOnChainInfoToW3CCredential(
          credentialData,
          coreClaimBigInts,
          credentialSubjectFields
        );
      }
      default:
        throw new Error(`Unsupported adapter version ${response}`);
    }
  }

  /**
   * Retrieves the credential identifiers for a user from the on-chain issuer.
   * @param issuerDID The issuer's core.DID.
   * @param userId The user's core.Id.
   */
  public async getUserCredentialIds(issuerDID: DID, userDID: DID): Promise<bigint[]> {
    const { contract, connection } = this.getContractConnection(issuerDID);
    const response = await contract.getCredentialAdapterVersion();
    switch (response) {
      case '0.0.1': {
        const adapter = new OnchainNonMerklizedIssuerAdapter(connection, issuerDID, {
          merklizationOptions: this._merklizationOptions
        });
        await adapter.isInterfaceSupported();
        return await adapter.getUserCredentialsIds(DID.idFromDID(userDID));
      }
      default:
        throw new Error(`Unsupported adapter version ${response}`);
    }
  }

  private getContractConnection(did: DID): { contract: Contract; connection: EthConnectionConfig } {
    const issuerId = DID.idFromDID(did);
    const chainId = chainIDfromDID(did);
    const contractAddress = ethers.getAddress(ethers.hexlify(Id.ethAddressFromId(issuerId)));
    const connection = this._ethConnectionConfig.find((c) => c.chainId === chainId);
    if (!connection) {
      throw new Error(`No connection found for chain ID ${chainId}`);
    }
    if (!connection.url) {
      throw new Error(`No URL found for chain ID ${chainId}`);
    }

    const contract = new Contract(contractAddress, abi, new ethers.JsonRpcProvider(connection.url));

    return { contract, connection };
  }
}
