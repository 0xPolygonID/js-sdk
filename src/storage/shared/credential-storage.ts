import { ProofQuery, W3CCredential } from '../../verifiable';
import { StandardJSONCredentialsQueryFilter } from '../filters/jsonQuery';
import { ICredentialStorage } from '../interfaces/credentials';
import { IDataSource } from '../interfaces/data-source';

export class CredentialStorage implements ICredentialStorage {
  static readonly storageKey = 'credentials';
  constructor(private readonly _dataSource: IDataSource<W3CCredential>) {}

  async listCredentials(): Promise<W3CCredential[]> {
    return this._dataSource.load();
  }

  async saveCredential(credential: W3CCredential): Promise<void> {
    this._dataSource.save(credential.id, credential);
  }

  async saveAllCredentials(credentials: W3CCredential[]): Promise<void> {
    for (const credential of credentials) {
      this._dataSource.save(credential.id, credential);
    }
  }

  async removeCredential(id: string): Promise<void> {
    this._dataSource.delete(id);
  }

  async findCredentialById(id: string): Promise<W3CCredential | undefined> {
    return this._dataSource.get(id);
  }

  async findCredentialsByQuery(query: ProofQuery): Promise<W3CCredential[]> {
    const filters = StandardJSONCredentialsQueryFilter(query);
    return this._dataSource
      .load()
      .filter((credential) => filters.every((filter) => filter.execute(credential)));
  }
}
