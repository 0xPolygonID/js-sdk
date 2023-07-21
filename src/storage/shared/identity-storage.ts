import { Identity, Profile } from '../entities';
import { IDataSource } from '../interfaces/data-source';
import { IIdentityStorage } from '../interfaces/identity';

/**
 * Implementation of the IIdentityStorage with KV data source
 *
 * @export
 * @beta
 * @class IdentityStorage
 * @implements implements IIdentityStorage interface
 */
export class IdentityStorage implements IIdentityStorage {
  /**
   * storage key for identities
   *
   * @static
   */
  static readonly identitiesStorageKey = 'identities';
  /**
   * storage key for profiles
   *
   * @static
   */
  static readonly profilesStorageKey = 'profiles';

  /**
   * Creates an instance of IdentityStorage.
   * @param {IDataSource<Identity>} _identityDataSource - data source for identities
   * @param {IDataSource<Profile>} _profileDataSource - data source for profiles
   */
  constructor(
    private readonly _identityDataSource: IDataSource<Identity>,
    private readonly _profileDataSource: IDataSource<Profile>
  ) {}

  async saveProfile(profile: Profile): Promise<void> {
    const profiles = await this._profileDataSource.load();
    const identityProfiles = profiles.filter(
      (p) => p.genesisIdentifier === profile.genesisIdentifier
    );
    const toSave = identityProfiles.length ? [...identityProfiles, profile] : [profile];
    for (let index = 0; index < toSave.length; index++) {
      const element = toSave[index];
      await this._profileDataSource.save(element.id, element);
    }
  }

  async getProfileByVerifier(verifier: string): Promise<Profile | undefined> {
    return this._profileDataSource.get(verifier, 'verifier');
  }

  async getProfileById(profileId: string): Promise<Profile | undefined> {
    return this._profileDataSource.get(profileId);
  }

  async getProfilesByGenesisIdentifier(genesisIdentifier: string): Promise<Profile[]> {
    return (await this._profileDataSource.load()).filter(
      (p) => p.genesisIdentifier === genesisIdentifier
    );
  }

  async getAllIdentities(): Promise<Identity[]> {
    return this._identityDataSource.load();
  }

  async saveIdentity(identity: Identity): Promise<void> {
    return this._identityDataSource.save(identity.did, identity, 'did');
  }

  async getIdentity(identifier: string): Promise<Identity | undefined> {
    return this._identityDataSource.get(identifier, 'did');
  }
}
