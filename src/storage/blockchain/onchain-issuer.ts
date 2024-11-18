import { DID, Id, ChainIds } from '@iden3/js-iden3-core';
import { Contract, ethers } from 'ethers';
import abi from './abi/INonMerklizedIssuer.json';
import { Options } from '@iden3/js-jsonld-merklization';
import { W3CCredential } from '../../verifiable';
import { OnchainNonMerklizedIssuerAdapter } from './onchain-issuer-adapter/non-merklized/version/v0.0.1/onchain-non-merklized-issuer-adapter';
import { EthConnectionConfig } from '..';

enum OnchainIssuerVersion {
  'v0.0.1' = '0.0.1'
}

/**
 * Represents an adapter for interacting with on-chain issuers.
 *
 * @public
 * @beta
 * @class OnchainIssuer
 */
export class OnchainIssuer {
  private readonly _url: string;
  private readonly _chainId: number;
  private readonly _contractAddress: string;
  private readonly _contract: Contract;

  private readonly _issuerDid: DID;

  private readonly _merklizationOptions?: Options;

  /**
   * Initializes an instance of `Adapter`.
   * @param config The configuration for the Ethereum connection.
   * @param did The decentralized identifier (DID) of the issuer. The DID provides the blockchain and network information.
   * @param merklizationOptions Optional settings for merklization.
   */
  constructor(config: EthConnectionConfig[], did: DID, options?: Options) {
    const issuerId = DID.idFromDID(did);
    this._contractAddress = ethers.getAddress(ethers.hexlify(Id.ethAddressFromId(issuerId)));
    this._chainId = ChainIds[`${DID.blockchainFromId(issuerId)}:${DID.networkIdFromId(issuerId)}`];
    if (!this._chainId) {
      throw new Error(
        `Unsupported blockchain ${DID.blockchainFromId(issuerId)} or network ${DID.networkIdFromId(
          issuerId
        )}`
      );
    }
    const url = config.find((c) => c.chainId === this._chainId)?.url;
    if (!url) {
      throw new Error(`No URL found for chain ID ${this._chainId}`);
    }
    this._url = url;
    this._merklizationOptions = options;
    this._contract = new Contract(
      this._contractAddress,
      abi,
      new ethers.JsonRpcProvider(this._url)
    );
    this._issuerDid = did;
  }

  /**
   * Retrieves a credential from the on-chain non-merklized contract.
   * @param userId The user's core.Id.
   * @param credentialId The unique identifier of the credential.
   */
  public async getCredential(userId: Id, credentialId: bigint): Promise<W3CCredential> {
    const response = await this._contract.getCredentialAdapterVersion();
    switch (response) {
      case OnchainIssuerVersion['v0.0.1']: {
        const adapter = new OnchainNonMerklizedIssuerAdapter(
          this._url,
          this._contractAddress,
          this._chainId,
          this._issuerDid,
          this._merklizationOptions
        );
        await adapter.isSupportsInterface();
        const { credentialData, coreClaimBigInts, credentialSubjectFields } =
          await adapter.getCredential(userId, credentialId);
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
}
