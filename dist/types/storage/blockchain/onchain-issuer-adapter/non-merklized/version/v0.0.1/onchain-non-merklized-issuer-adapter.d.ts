import { DID, Id } from '@iden3/js-iden3-core';
import { INonMerklizedIssuer } from '@iden3/onchain-non-merklized-issuer-base-abi';
import { W3CCredential } from '../../../../../../verifiable';
import { Options } from '@iden3/js-jsonld-merklization';
import { EthConnectionConfig } from '../../../../state';
/**
 * `OnchainNonMerklizedIssuerAdapter` provides functionality to interact with a non-merklized on-chain credential issuer.
 * This adapter enables interface detection, credential retrieval, and conversion to the W3C Verifiable Credential format.
 *
 * @public
 * @beta
 * @class OnchainNonMerklizedIssuerAdapter
 */
export declare class OnchainNonMerklizedIssuerAdapter {
    private readonly _contract;
    private readonly _contractAddress;
    private readonly _chainId;
    private readonly _issuerDid;
    private readonly _merklizationOptions?;
    /**
     * Initializes an instance of `OnchainNonMerklizedIssuerAdapter`.
     *
     * @param ethConnectionConfig The configuration for the Ethereum connection.
     * @param issuerDid The decentralized identifier (DID) of the issuer.
     * @param merklizationOptions Optional settings for merklization.
     */
    constructor(ethConnectionConfig: EthConnectionConfig, issuerDid: DID, options?: {
        merklizationOptions?: Options;
    });
    /**
     * Checks if the contract supports required interfaces.
     * Throws an error if any required interface is unsupported.
     *
     * @throws Error - If required interfaces are not supported.
     */
    isInterfaceSupported(): Promise<void>;
    /**
     * Retrieves a credential from the on-chain non-merklized contract.
     * @param userId The user's core.Id.
     * @param credentialId The unique identifier of the credential.
     */
    getCredential(userId: Id, credentialId: bigint): Promise<{
        credentialData: INonMerklizedIssuer.CredentialDataStructOutput;
        coreClaimBigInts: bigint[];
        credentialSubjectFields: INonMerklizedIssuer.SubjectFieldStructOutput[];
    }>;
    /**
     * Retrieves the credential IDs of a user.
     * @param userId The user's core.Id.
     * @returns An array of credential IDs.
     */
    getUserCredentialsIds(userId: Id): Promise<bigint[]>;
    /**
     * Converts on-chain credential to a verifiable credential.
     *
     * @param credentialData Data structure of the credential from the contract.
     * @param coreClaimBigInts Claim data in bigint format.
     * @param credentialSubjectFields Subject fields of the credential.
     */
    convertOnChainInfoToW3CCredential(credentialData: INonMerklizedIssuer.CredentialDataStructOutput, coreClaimBigInts: bigint[], credentialSubjectFields: INonMerklizedIssuer.SubjectFieldStructOutput[]): Promise<W3CCredential>;
    private credentialId;
    private convertCredentialSubject;
    private existenceProof;
    private validateSourceValue;
    private convertDisplayMethod;
}
//# sourceMappingURL=onchain-non-merklized-issuer-adapter.d.ts.map