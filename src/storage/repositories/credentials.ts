import { ProofQuery, W3CCredential } from '../../verifiable';
import { StandardJSONCredentielsQueryFilter } from '../filters/jsonQuery';
import { ICredentialStorage } from '../interfaces/credentials';
import { IDataSource } from '../interfaces/data-source';

export class CredentialRepository implements ICredentialStorage {
  constructor(private source: IDataSource<W3CCredential>) {}

  get data() {
    return this.source.load();
  }

  async listCredentials(): Promise<W3CCredential[]> {
    return this.data;
  }

  async saveCredential(credential: W3CCredential): Promise<void> {
    this.source.save(credential.id, credential, 'id');
  }

  async saveAllCredentials(credentials: W3CCredential[]): Promise<void> {
    credentials.forEach((credential) => {
      this.saveCredential(credential);
    });
  }

  async removeCredential(id: string): Promise<void> {
    this.source.delete(id, 'id');
  }

  async findCredentialById(id: string): Promise<W3CCredential | undefined> {
    return this.data.find((cred) => cred.id === id);
  }

  async findCredentialsByQuery(query: ProofQuery): Promise<W3CCredential[]> {
    const filters = StandardJSONCredentielsQueryFilter(query);
    return this.data.filter((credential) => filters.every((filter) => filter.execute(credential)));
  }
}
