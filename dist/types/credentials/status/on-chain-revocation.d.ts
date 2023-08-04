import { RevocationStatus, CredentialStatus } from '../../verifiable';
import { EthConnectionConfig } from '../../storage/blockchain';
import { CredentialStatusResolver, CredentialStatusResolveOptions } from './resolver';
import { DID } from '@iden3/js-iden3-core';
/**
 * OnChainIssuer is a class that allows to interact with the onchain contract
 * and build the revocation status.
 *
 * @public
 * @class OnChainIssuer
 */
export declare class OnChainResolver implements CredentialStatusResolver {
    private readonly _configs;
    /**
     *
     * Creates an instance of OnChainIssuer.
     * @public
     * @param {Array<EthConnectionConfig>} - onchain contract address
     * @param {string} - list of EthConnectionConfig
     */
    constructor(_configs: EthConnectionConfig[]);
    /**
     * resolve is a method to resolve a credential status from the blockchain.
     *
     * @public
     * @param {CredentialStatus} credentialStatus -  credential status to resolve
     * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
     * @returns `{Promise<RevocationStatus>}`
     */
    resolve(credentialStatus: CredentialStatus, credentialStatusResolveOptions?: CredentialStatusResolveOptions): Promise<RevocationStatus>;
    /**
     * Gets partial revocation status info from onchain issuer contract.
     *
     * @param {CredentialStatus} credentialStatus - credential status section of credential
     * @param {DID} issuerDid - issuer did
     * @returns `{Promise<RevocationStatus>}`
     */
    getRevocationOnChain(credentialStatus: CredentialStatus, issuer: DID): Promise<RevocationStatus>;
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
    };
    networkByChainId(chainId: number): EthConnectionConfig;
}
