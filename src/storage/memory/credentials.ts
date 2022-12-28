import { ProofQuery, W3CCredential } from '../../verifiable';
import { StorageErrors } from '../errors';
import { StandardJSONCredentielsQueryFilter } from '../filters/jsonQuery';
import { ICredentialStorage } from '../interfaces/credentials';

export class InMemoryCredentialStorage implements ICredentialStorage {
  private _data: W3CCredential[];
  constructor() {
    this._data = [];
  }

  get data() {
    return this._data;
  }

  set data(v) {
    this._data = v;
  }

  async listCredentials(): Promise<W3CCredential[]> {
    return this.data;
  }

  async saveCredential(credential: W3CCredential): Promise<void> {
    // upsert
    const index = this._data.findIndex((c) => c.id === credential.id);
    if (index === -1) {
      this._data.push(credential);
    } else {
      this._data[index] = credential;
    }
  }

  async saveAllCredentials(credentials: W3CCredential[]): Promise<void> {
    credentials.forEach(credential => {
        this.saveCredential(credential);
    });
  }

  async removeCredential(id: string): Promise<void> {
    const newData = this.data.filter((credential) => credential.id !== id);

    if (newData.length === this.data.length) {
      throw new Error(StorageErrors.NotFoundCredentialForRemove);
    }

    this.data = newData;
  }

  async findCredentialById(id: string): Promise<W3CCredential | undefined> {
    return this.data.find((cred) => cred.id === id);
  }

  async findCredentialsByQuery(query: ProofQuery): Promise<W3CCredential[]> {
    const filters = StandardJSONCredentielsQueryFilter(query);
    const credentials = this.data.filter((credential) => filters.every((f) => f(credential)));
    return credentials;
  }
}
