import { RevocationStatus } from '../../verifiable';
import { EthConnectionConfig } from './state';
/**
 * OnChainRevocationStore is a class that allows to interact with the onchain contract
 * and build the revocation status.
 *
 * @public
 * @class OnChainIssuer
 */
export declare class OnChainRevocationStorage {
    private readonly onchainContract;
    private readonly provider;
    /**
     *
     * Creates an instance of OnChainIssuer.
     * @public
     * @param {string} - onhcain contract address
     * @param {string} - rpc url to connect to the blockchain
     */
    constructor(config: EthConnectionConfig, contractAddress: string);
    /**
     * Get revocation status by issuerId, issuerState and nonce from the onchain.
     * @public
     * @returns Promise<RevocationStatus>
     */
    getRevocationStatusByIdAndState(issuerID: bigint, state: bigint, nonce: number): Promise<RevocationStatus>;
    /**
     * Get revocation status by nonce from the onchain contract.
     * @public
     * @returns Promise<RevocationStatus>
     */
    getRevocationStatus(issuerID: bigint, nonce: number): Promise<RevocationStatus>;
    private static convertIssuerInfo;
    private static convertSmtProofToProof;
}
