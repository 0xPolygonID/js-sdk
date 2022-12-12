import { Identity } from '../entities';
import { IIdentityStorage } from '../interfaces/identity';

export class InMemoryIdentityStorage implements IIdentityStorage {
  _data: Map<string,Identity>;
  constructor() {
    this._data = new Map<string,Identity>();
  }

  async getAllIdentities(): Promise<Identity[]> {
    return Array.from(this._data.values())
  }

  async saveIdentity(identity: Identity): Promise<void> {
    this._data[identity.identifier] = identity;
  }

  async getIdentity(identifier: string): Promise<Identity> {
    return this._data[identifier];
  }
}
