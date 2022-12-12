import { ICredentialStorage } from "./credentials";
import { IIdentityStorage } from "./identity";
import { IMerkleTreeStorage } from "./merkletree";

export interface IDataStorage {
    credential : ICredentialStorage,
    identity: IIdentityStorage,
    mt: IMerkleTreeStorage,
}
