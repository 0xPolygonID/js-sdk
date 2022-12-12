import * as entities from '../entities';


export interface IIdentityStorage {
  saveIdentity(identity: entities.Identity): Promise<void>;
  getIdentity(identifier: string): Promise<entities.Identity>;
  getAllIdentities():Promise<entities.Identity[]>;
}