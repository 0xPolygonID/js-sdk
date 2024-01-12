import { ProofQuery, W3CCredential } from '../../verifiable';
import { StandardJSONCredentialsQueryFilter } from '../filters';
import { ICredentialStorage } from '../interfaces/credentials';
import { IDataSource } from '../interfaces/data-source';

/**
 * Implementation of ICredentialStorage with KV Data source
 *
 * @public
 * @class CredentialStorage
 * @implements {ICredentialStorage}
 */
export class CredentialStorage implements ICredentialStorage {
  /**
   * key for storage
   *
   * @static
   */
  static readonly storageKey = 'credentials';
  /**
   * Creates an instance of CredentialStorage.
   * @param {IDataSource<W3CCredential>} _dataSource - W3CCredential credential KV data source
   */
  constructor(private readonly _dataSource: IDataSource<W3CCredential>) {}

  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async listCredentials(): Promise<W3CCredential[]> {
    const creds = await this._dataSource.load();
    return creds.filter((i) => i !== undefined).map((cred) => cred && W3CCredential.fromJSON(cred));
  }

  /** @inheritdoc */
  async saveCredential(credential: W3CCredential): Promise<void> {
    return this._dataSource.save(credential.id, credential.toJSON());
  }

  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async saveAllCredentials(credentials: W3CCredential[]): Promise<void> {
    for (const credential of credentials) {
      await this.saveCredential(credential);
    }
  }

  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async removeCredential(id: string): Promise<void> {
    return this._dataSource.delete(id);
  }

  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async findCredentialById(id: string): Promise<W3CCredential | undefined> {
    const cred = await this._dataSource.get(id);
    return cred && W3CCredential.fromJSON(cred);
  }

  /** {@inheritdoc ICredentialStorage.listCredentials }
   * uses JSON query
   */
  async findCredentialsByQuery(query: ProofQuery): Promise<W3CCredential[]> {
    const filters = StandardJSONCredentialsQueryFilter(query);
    const creds = (await this._dataSource.load()).filter((credential) =>
      filters.every((filter) => filter.execute(credential))
    );

    const mappedCreds = creds
      .filter((i) => i !== undefined)
      .map((cred) => W3CCredential.fromJSON(cred));

    return mappedCreds;
  }
}
