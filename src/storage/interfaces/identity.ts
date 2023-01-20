import { Identity } from '../entities';
import { Profile } from '../entities';

export interface IIdentityStorage {
  saveIdentity(identity: Identity): Promise<void>;
  getIdentity(identifier: string): Promise<Identity | undefined>;
  getAllIdentities(): Promise<Identity[]>;

  saveProfile(identity: Profile): Promise<void>;
  getProfileByVerifier(verifier: string): Promise<Profile>;
  getProfileById(identifier: string): Promise<Profile>;
  getProfilesByGenesisIdentifier(genesisIdentifier: string): Promise<Profile[]>;
}
