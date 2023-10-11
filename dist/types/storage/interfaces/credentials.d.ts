import { ProofQuery, W3CCredential } from '../../verifiable';
/**
 * Interface for credential storages
 *
 * @public
 * @interface   ICredentialStorage
 */
export interface ICredentialStorage {
    /**
     *
     * save credential to the storage
     *
     * @param {W3CCredential} credential - credential to save
     * @returns `{Promise<void>}`
     */
    saveCredential(credential: W3CCredential): Promise<void>;
    /**
     *
     * save all credential (upsert) to the storage
     *
     * @param {W3CCredential[]} credentials - credentials to save
     * @returns `Promise<void>`
     */
    saveAllCredentials(credentials: W3CCredential[]): Promise<void>;
    /**
     * returns all credentials in the storage
     *
     * @returns `Promise<W3CCredential[]>`
     */
    listCredentials(): Promise<W3CCredential[]>;
    /**
     * Removes credential from storage
     *
     * @param {string} id  - id of credential
     * @returns `Promise<void>`
     */
    removeCredential(id: string): Promise<void>;
    /**
     * finds credential in the storage for given query
     *
     * @param {ProofQuery} query - query to apply
     * @returns `{Promise<W3CCredential[]>}`
     */
    findCredentialsByQuery(query: ProofQuery): Promise<W3CCredential[]>;
    /**
     * finds credential by identifier
     *
     * @param {string} id - id of credential
     * @returns `{(Promise<W3CCredential | undefined>)}`
     */
    findCredentialById(id: string): Promise<W3CCredential | undefined>;
}
