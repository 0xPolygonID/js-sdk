import { ProofQuery, W3CCredential } from "../../verifiable";

export interface ICredentialStorage {
    saveCredential(credential: W3CCredential): Promise<void>;
    saveAllCredentials(credentials: W3CCredential[]): Promise<void>;
    listCredentials(): Promise<W3CCredential[]>;
    removeCredential(id: string): Promise<void>;
    findCredentialByQuery(query: ProofQuery): Promise<W3CCredential[]>;
    findCredentialById(id: string): Promise<W3CCredential | undefined>;
}