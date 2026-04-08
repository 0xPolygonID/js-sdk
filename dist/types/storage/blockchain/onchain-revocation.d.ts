import { RevocationStatus } from '../../verifiable';
import { Signer, TransactionReceipt } from 'ethers';
import { EthConnectionConfig } from './state';
/**
 * OnChainRevocationStore is a class that allows to interact with the onchain contract
 * and build the revocation status.
 *
 * @public
 * @class OnChainIssuer
 */
export declare class OnChainRevocationStorage {
    private readonly _config;
    private _signer?;
    private readonly _contract;
    private readonly _provider;
    private readonly _transactionService;
    /**
     *
     * Creates an instance of OnChainIssuer.
     * @public
     * @param {string} - onchain contract address
     * @param {string} - rpc url to connect to the blockchain
     */
    constructor(_config: EthConnectionConfig, contractAddress: string, _signer?: Signer | undefined);
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
    saveNodes(payload: bigint[][]): Promise<TransactionReceipt>;
    private static convertIssuerInfo;
    private static convertSmtProofToProof;
}
//# sourceMappingURL=onchain-revocation.d.ts.map