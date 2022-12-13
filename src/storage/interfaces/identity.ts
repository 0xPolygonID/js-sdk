import * as entities from '../entities';
import { Profile } from '../entities';


export interface IIdentityStorage {
  saveIdentity(identity: entities.Identity): Promise<void>;
  getIdentity(identifier: string): Promise<entities.Identity>;
  getAllIdentities():Promise<entities.Identity[]>;

  saveProfile(identity: entities.Profile): Promise<void>;
  getProfileByVerifier(verifier: string): Promise<Profile>;
  getProfileById(identifier: string): Promise<Profile>;
  getProfilesByGenesisIdentifier(genesisIdentifier: string): Promise<Profile[]>;

}