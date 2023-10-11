import { ICredentialStorage } from './credentials';
import { IIdentityStorage } from './identity';
import { IMerkleTreeStorage } from './merkletree';
import { IStateStorage } from './state';
/**
 * General Data storage interface that union identity, credential, merkletree and states storage.
 *
 * @public
 * @interface   IDataStorage
 */
export interface IDataStorage {
    credential: ICredentialStorage;
    identity: IIdentityStorage;
    mt: IMerkleTreeStorage;
    states: IStateStorage;
}
