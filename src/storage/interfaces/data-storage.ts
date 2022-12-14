import { ICredentialStorage } from "./credentials";
import { IIdentityStorage } from "./identity";
import { IMerkleTreeStorage } from "./merkletree";
import { IStateStorage } from "./state";


export interface IDataStorage {
    credential : ICredentialStorage,
    identity: IIdentityStorage,
    mt: IMerkleTreeStorage,
    states:IStateStorage
}
