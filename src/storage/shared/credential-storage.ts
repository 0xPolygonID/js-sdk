import { ProofQuery, W3CCredential } from '../../verifiable';
import { StandardJSONCredentialsQueryFilter } from '../filters';
import { ICredentialStorage } from '../interfaces/credentials';
import { IDataSource } from '../interfaces/data-source';

/**
 * Implementation of ICredentialStorage with KV Data source
 *
 * @export
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
    return this._dataSource.load();
  }

  /** @inheritdoc */
  async saveCredential(credential: W3CCredential): Promise<void> {
    this._dataSource.save(credential.id, credential);
  }

  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async saveAllCredentials(credentials: W3CCredential[]): Promise<void> {
    for (const credential of credentials) {
      this._dataSource.save(credential.id, credential);
    }
  }

  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async removeCredential(id: string): Promise<void> {
    this._dataSource.delete(id);
  }

  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async findCredentialById(id: string): Promise<W3CCredential | undefined> {
    return this._dataSource.get(id);
  }

  /** {@inheritdoc ICredentialStorage.listCredentials }
   * uses JSON query
   */
  async findCredentialsByQuery(query: ProofQuery): Promise<W3CCredential[]> {
    const filters = StandardJSONCredentialsQueryFilter(query);
    return this._dataSource
      .load()
      .filter((credential) => filters.every((filter) => filter.execute(credential)));
  }
}
