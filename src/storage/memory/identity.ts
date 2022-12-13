import { Identity, Profile } from '../entities';
import { IIdentityStorage } from '../interfaces/identity';

export class InMemoryIdentityStorage implements IIdentityStorage {
  _identities: Map<string, Identity>;
  _profiles: Map<string, Profile[]>; // link between genesis identifier and its profiles

  constructor() {
    this._identities = new Map<string, Identity>();
    this._profiles = new Map<string, Profile[]>();
  }

  async saveProfile(profile: Profile): Promise<void> {
    if (!this._profiles.get(profile.genesisIdentifier)) {
      this._profiles[profile.genesisIdentifier] = [];
    }
    this._profiles[profile.genesisIdentifier].push(profile);
  }

  async getProfileByVerifier(verifier: string): Promise<Profile> {
    console.log(this._profiles.values())
    for (let [, profiles] of this._profiles) {
      for (let index = 0; index < profiles.length; index++) {
        if (profiles[index].verifier == verifier) {
          return profiles[index];
        }
      }
    }
    throw new Error('profile not found');
  }
  async getProfileById(profileId: string): Promise<Profile> {
    for (let [_, profiles] of this._profiles.entries()) {
      profiles.forEach((profile) => {
        if (profile.id == profileId) {
          return profile;
        }
      });
    }
    throw new Error('profile not found');
  }
  async getProfilesByGenesisIdentifier(genesisIdentifier: string): Promise<Profile[]> {
    const profiles = this._profiles.get(genesisIdentifier);
    if (!profiles) {
      return [];
    }
    return profiles;
  }

  async getAllIdentities(): Promise<Identity[]> {
    return Array.from(this._identities.values());
  }

  async saveIdentity(identity: Identity): Promise<void> {
    this._identities[identity.identifier] = identity;
  }

  async getIdentity(identifier: string): Promise<Identity> {
    return this._profiles[identifier];
  }
}
