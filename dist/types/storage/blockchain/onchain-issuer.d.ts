import { DID } from '@iden3/js-iden3-core';
import { Options } from '@iden3/js-jsonld-merklization';
import { W3CCredential } from '../../verifiable';
import { EthConnectionConfig } from './state';
import { IOnchainIssuer } from '../interfaces/onchain-issuer';
interface OnchainIssuerOptions {
    merklizationOptions?: Options;
}
/**
 * Represents an adapter for interacting with on-chain issuers.
 *
 * @public
 * @beta
 * @class OnchainIssuer
 */
export declare class OnchainIssuer implements IOnchainIssuer {
    private readonly _ethConnectionConfig;
    private readonly _onchainIssuerOptions?;
    /**
     * Initializes an instance of `Adapter`.
     * @param config The configuration for the Ethereum connection.
     * @param merklizationOptions Optional settings for merklization.
     */
    constructor(config: EthConnectionConfig[], options?: OnchainIssuerOptions);
    /**
     * Retrieves a credential from the on-chain issuer.
     * @param issuerDID The issuer's core.DID.
     * @param userId The user's core.Id.
     * @param credentialId The unique identifier of the credential.
     */
    getCredential(issuerDID: DID, userDID: DID, credentialId: bigint): Promise<W3CCredential>;
    /**
     * Retrieves the credential identifiers for a user from the on-chain issuer.
     * @param issuerDID The issuer's core.DID.
     * @param userId The user's core.Id.
     */
    getUserCredentialIds(issuerDID: DID, userDID: DID): Promise<bigint[]>;
    private getContractConnection;
}
export {};
//# sourceMappingURL=onchain-issuer.d.ts.map