import { ProofQuery, W3CCredential } from '../../verifiable';
import { ICredentialStorage } from '../interfaces/credentials';
import { IDataSource } from '../interfaces/data-source';
/**
 * Implementation of ICredentialStorage with KV Data source
 *
 * @public
 * @class CredentialStorage
 * @implements {ICredentialStorage}
 */
export declare class CredentialStorage implements ICredentialStorage {
    private readonly _dataSource;
    /**
     * key for storage
     *
     * @static
     */
    static readonly storageKey = "credentials";
    /**
     * Creates an instance of CredentialStorage.
     * @param {IDataSource<W3CCredential>} _dataSource - W3CCredential credential KV data source
     */
    constructor(_dataSource: IDataSource<W3CCredential>);
    /** {@inheritdoc ICredentialStorage.listCredentials } */
    listCredentials(): Promise<W3CCredential[]>;
    /** @inheritdoc */
    saveCredential(credential: W3CCredential): Promise<void>;
    /** {@inheritdoc ICredentialStorage.listCredentials } */
    saveAllCredentials(credentials: W3CCredential[]): Promise<void>;
    /** {@inheritdoc ICredentialStorage.listCredentials } */
    removeCredential(id: string): Promise<void>;
    /** {@inheritdoc ICredentialStorage.listCredentials } */
    findCredentialById(id: string): Promise<W3CCredential | undefined>;
    /** {@inheritdoc ICredentialStorage.listCredentials }
     * uses JSON query
     */
    findCredentialsByQuery(query: ProofQuery): Promise<W3CCredential[]>;
}
