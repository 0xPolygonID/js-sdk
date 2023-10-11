import { Identity, Profile } from '../entities';
import { IDataSource } from '../interfaces/data-source';
import { IIdentityStorage } from '../interfaces/identity';
/**
 * Implementation of the IIdentityStorage with KV data source
 *
 * @public
 * @class IdentityStorage
 * @implements implements IIdentityStorage interface
 */
export declare class IdentityStorage implements IIdentityStorage {
    private readonly _identityDataSource;
    private readonly _profileDataSource;
    /**
     * storage key for identities
     *
     * @static
     */
    static readonly identitiesStorageKey = "identities";
    /**
     * storage key for profiles
     *
     * @static
     */
    static readonly profilesStorageKey = "profiles";
    /**
     * Creates an instance of IdentityStorage.
     * @param {IDataSource<Identity>} _identityDataSource - data source for identities
     * @param {IDataSource<Profile>} _profileDataSource - data source for profiles
     */
    constructor(_identityDataSource: IDataSource<Identity>, _profileDataSource: IDataSource<Profile>);
    saveProfile(profile: Profile): Promise<void>;
    getProfileByVerifier(verifier: string): Promise<Profile | undefined>;
    getProfileById(profileId: string): Promise<Profile | undefined>;
    getProfilesByGenesisIdentifier(genesisIdentifier: string): Promise<Profile[]>;
    getAllIdentities(): Promise<Identity[]>;
    saveIdentity(identity: Identity): Promise<void>;
    getIdentity(identifier: string): Promise<Identity | undefined>;
}
