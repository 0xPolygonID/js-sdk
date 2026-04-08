import { TransactionReceipt } from 'ethers';
import { JSONObject } from '../../iden3comm';
import { OnChainRevocationStorage } from '../../storage';
import { CredentialStatusType } from '../../verifiable';
import { ProofNode } from './reverse-sparse-merkle-tree';
import { PublishMode } from '../models';
/**
 * Represents a credential status publisher.
 */
export interface ICredentialStatusPublisher {
    /**
     * Publishes the credential status.
     * @param params - The parameters for publishing the status.
     * @returns A promise that resolves when the status is published.
     */
    publish(params: JSONObject): Promise<void>;
}
/**
 * Registry for managing credential status publishers.
 */
export declare class CredentialStatusPublisherRegistry {
    private _publishers;
    /**
     * Registers one or more credential status publishers for a given type.
     * @param type - The credential status type.
     * @param publisher - One or more credential status publishers.
     */
    register(type: CredentialStatusType, ...publisher: ICredentialStatusPublisher[]): void;
    /**
     * Retrieves the credential status publishers for a given type.
     * @param type - The credential status type.
     * @returns An array of credential status publishers or undefined if none are registered for the given type.
     */
    get(type: CredentialStatusType): ICredentialStatusPublisher[] | undefined;
}
/**
 * Implementation of the ICredentialStatusPublisher interface for publishing on-chain credential status.
 */
export declare class Iden3OnchainSmtCredentialStatusPublisher implements ICredentialStatusPublisher {
    private readonly _storage;
    constructor(_storage: OnChainRevocationStorage);
    /**
     * Publishes the credential status to the blockchain.
     * @param params - The parameters for publishing the credential status.
     */
    publish(params: {
        nodes: ProofNode[];
        credentialStatusType: CredentialStatusType;
        onChain?: {
            txCallback?: (tx: TransactionReceipt) => Promise<void>;
            publishMode?: PublishMode;
        };
    }): Promise<void>;
}
/**
 * Implementation of the ICredentialStatusPublisher interface for publishing off-chain credential status.
 */
export declare class Iden3SmtRhsCredentialStatusPublisher implements ICredentialStatusPublisher {
    /**
     * Publishes the credential status to a specified node URL.
     * @param params - The parameters for publishing the credential status.
     * @param params.nodes - The proof nodes to be published.
     * @param params.rhsUrl - The URL of the node to publish the credential status to.
     * @returns A promise that resolves when the credential status is successfully published.
     * @throws An error if the publishing fails.
     */
    publish(params: {
        nodes: ProofNode[];
        credentialStatusType: CredentialStatusType;
        rhsUrl: string;
    }): Promise<void>;
}
//# sourceMappingURL=credential-status-publisher.d.ts.map