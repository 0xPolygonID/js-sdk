import { Identity } from '../entities';
import { Profile } from '../entities';
/**
 * storage for identities and profiles
 *
 * @public
 * @interface   IIdentityStorage
 */
export interface IIdentityStorage {
    /**
     * saves identity to the data source
     *
     * @param {Identity} identity
     * @returns `{Promise<void>}`
     */
    saveIdentity(identity: Identity): Promise<void>;
    /**
     * gets identity from the the data source
     *
     *
     * @param {string} identifier - id of identity
     * @returns `{(Promise<Identity | undefined>)}`
     */
    getIdentity(identifier: string): Promise<Identity | undefined>;
    /**
     *
     * gets all identity from the data source
     *
     * @returns `{Promise<Identity[]>}`
     */
    getAllIdentities(): Promise<Identity[]>;
    /**
     *
     * saves profile identity to data
     *
     * @param {Profile} profile - identity profile
     * @returns `{Promise<void>}`
     */
    saveProfile(profile: Profile): Promise<void>;
    /**
     * gets profile by verifier
     *
     * @param {string} verifier - verifier to which profile has been shared
     * @returns `{Promise<Profile>}`
     */
    getProfileByVerifier(verifier: string): Promise<Profile | undefined>;
    /**
     * gets profile by identifier
     *
     * @param {string} identifier - profile id
     * @returns `{Promise<Profile>}`
     */
    getProfileById(identifier: string): Promise<Profile | undefined>;
    /**
     *
     * gets profile identity by genesis identifiers
     *
     * @param {string} genesisIdentifier - genesis identifier from which profile has been derived
     * @returns `{Promise<Profile[]>}`
     */
    getProfilesByGenesisIdentifier(genesisIdentifier: string): Promise<Profile[]>;
}
