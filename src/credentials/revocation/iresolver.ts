import { EthConnectionConfig, EthStateStorage, defaultEthConnectionConfig } from "../../storage";
import { CredentialStatus, CredentialStatusType, RevocationStatus } from "../../verifiable";
import { CredentialWallet } from "../credential-wallet";
import { RevocationStatusDTO } from "../revocation";

export interface CredentialStatusChecker {
    resolve(credentialStatus: CredentialStatus, params: Iparams): RevocationStatus;
} 

export class SparseMerkleTreeProofCredentialStatusChecker implements CredentialStatusChecker {
    async resolve(credentialStatus: CredentialStatus): Promise<RevocationStatus> {
        const revStatusDTO = await (await fetch(credentialStatus.id)).json();
        return Object.assign(new RevocationStatusDTO(), revStatusDTO).toRevocationStatus();
    }

}

export class RHSStatusChecker implements CredentialStatusChecker {
    constructor(state:EthStateStorage){

    }
    async resolve(credentialStatus: CredentialStatus): Promise<RevocationStatus> {
    }
}

export class CredentialStatusService {
    private registry: Record<CredentialStatusType, CredentialStatusChecker>

    constructor(){
           new SparseMerkleTreeProofCredentialStatusChecker()
    }
    registerChecker(t, CredentialStatusChecker){
        this.registerChecker
    }
}


const s = new CredentialStatusService();
s.registerChecker(CredentialStatusType.Iden3ReverseSparseMerkleTreeProof, new RHSStatusChecker(datastorage.states))
s.registerChecker(CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023, new RHSStatusChecker([] as EthConnectionConfig[]))

new CredentialWallet(s)

