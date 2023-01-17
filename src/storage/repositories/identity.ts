import { Identity, Profile } from '../entities';
import { IDataSource } from '../interfaces/data-source';
import { IIdentityStorage } from '../interfaces/identity';

export class IdentityRepository implements IIdentityStorage {
  constructor(
    private identitySource: IDataSource<Identity>,
    private profileSource: IDataSource<Profile>
  ) {}

  async saveProfile(profile: Profile): Promise<void> {
    this.profileSource.save(profile.id, profile, 'id');
  }

  async getProfileByVerifier(verifier: string): Promise<Profile> {
    const profiles = this.profileSource.load();
    for (const profile of profiles) {
      if (profile.verifier === verifier) {
        return profile;
      }
    }
    throw new Error('profile not found');
  }
  async getProfile(profileId: string): Promise<Profile> {
    return this.profileSource.get(profileId, 'id');
  }

  async getProfilesByGenesisIdentifier(genesisIdentifier: string): Promise<Profile[]> {
    const profiles = this.profileSource.load();
    return profiles.filter((p) => p.genesisIdentifier === genesisIdentifier);
  }

  async getAllIdentities(): Promise<Identity[]> {
    return this.identitySource.load();
  }

  async saveIdentity(identity: Identity): Promise<void> {
    this.identitySource.save(identity.identifier, identity, 'id');
  }

  async getIdentity(identifier: string): Promise<Identity> {
    return this.identitySource.get(identifier, 'id');
  }
}
