import { ProofQuery, W3CCredential } from '../../verifiable';
import { StorageErrors } from '../errors';
import { StandardJSONCredentielsQueryFilter } from '../filters/jsonQuery';
import { ICredentialStorage } from '../interfaces/credentials';

export class InMemoryCredentialStorage implements ICredentialStorage {
  constructor(
    private secret: string = 'main',
    private readonly _data: {
      [v in string]: W3CCredential[];
    } = {}
  ) {
    this._data[secret] = [];
  }

  get data() {
    return this._data[this.secret];
  }

  set data(v) {
    this._data[this.secret] = v;
  }

  async listCredentials(): Promise<W3CCredential[]> {
    return this.data;
  }

  async saveCredential(credential: W3CCredential): Promise<void> {
    // todo check if present the same id before save
    this._data[this.secret].push(credential);
  }

  async saveAllCredentials(credentials: W3CCredential[]): Promise<void> {
    this._data[this.secret].push(...credentials);
  }

  async removeCredential(id: string): Promise<void> {
    const newData = this.data.filter((credential) => credential.id !== id);

    if (newData.length === this.data.length) {
      throw new Error(StorageErrors.NotFoundCredentialForRemove);
    }

    this.data = newData;
  }

  findCredentialById(id: string): Promise<W3CCredential | undefined> {
    return Promise.resolve(this.data.find((cred) => cred.id === id));
  }

  async findCredentialByQuery(query: ProofQuery): Promise<W3CCredential[]> {
    const filters = StandardJSONCredentielsQueryFilter(query);
    return this.data.filter((credential) => filters.every((f) => f(credential)));
  }
}
