import { RevocationStatus, CredentialStatus } from '../../verifiable';
import { EthConnectionConfig } from '../../storage/blockchain';
import { CredentialStatusResolver, CredentialStatusResolveOptions } from './resolver';
import { DID } from '@iden3/js-iden3-core';
import { EthStateStorageOptions } from '../../storage/blockchain/state';
export type OnChainResolverOptions = {
    stateStorageOptions?: EthStateStorageOptions;
};
/**
 * OnChainIssuer is a class that allows to interact with the onchain contract
 * and build the revocation status.
 *
 * @public
 * @class OnChainIssuer
 */
export declare class OnChainResolver implements CredentialStatusResolver {
    private readonly _configs;
    private readonly _stateStorage;
    /**
     *
     * Creates an instance of OnChainIssuer.
     * @public
     * @param {Array<EthConnectionConfig>} _configs - list of ethereum network connections
     */
    constructor(_configs: EthConnectionConfig[], _opts?: OnChainResolverOptions);
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
        stateHex: string;
    };
    networkByChainId(chainId: number): EthConnectionConfig;
    private _getOnChainRevocationStorageForIssuer;
}
//# sourceMappingURL=on-chain-revocation.d.ts.map