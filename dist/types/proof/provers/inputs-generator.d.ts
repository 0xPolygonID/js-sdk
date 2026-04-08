import { DID } from '@iden3/js-iden3-core';
import { RevocationStatus, W3CCredential } from '../../verifiable';
import { ZeroKnowledgeProofRequest } from '../../iden3comm';
import { CircuitClaim, CircuitId, Query, TreeState } from '../../circuits';
import { PreparedAuthBJJCredential, PreparedCredential } from '../common';
import { IIdentityWallet } from '../../identity';
import { IStateStorage } from '../../storage';
import { ICredentialWallet } from '../../credentials';
export type DIDProfileMetadata = {
    authProfileNonce: number | string;
    credentialSubjectProfileNonce: number | string;
};
export type ProofGenerationOptions = {
    skipRevocation: boolean;
    challenge?: bigint;
    credential?: W3CCredential;
    credentialRevocationStatus?: RevocationStatus;
    verifierDid?: DID;
    linkNonce?: bigint;
    bypassCache?: boolean;
    allowExpiredCredentials?: boolean;
};
export type AuthProofGenerationOptions = {
    challenge?: bigint;
};
export type ProofInputsParams = ProofGenerationOptions & DIDProfileMetadata;
type InputContext = {
    preparedCredential: PreparedCredential;
    identifier: DID;
    proofReq: ZeroKnowledgeProofRequest;
    params: ProofInputsParams;
    circuitQueries: Query[];
};
export type GenerateInputsResult = {
    inputs: Uint8Array;
    metadata?: {
        targetCircuitId: CircuitId | string;
    };
};
export declare class InputGenerator {
    private readonly _identityWallet;
    private readonly _credentialWallet;
    private readonly _stateStorage;
    constructor(_identityWallet: IIdentityWallet, _credentialWallet: ICredentialWallet, _stateStorage: IStateStorage);
    generateInputs(ctx: InputContext): Promise<GenerateInputsResult>;
    newCircuitClaimData(preparedCredential: PreparedCredential): Promise<CircuitClaim>;
    prepareAuthBJJCredential(did: DID, treeStateInfo?: TreeState): Promise<PreparedAuthBJJCredential>;
    private credentialAtomicQueryMTPV2PrepareInputs;
    private authPrepareInputs;
    private credentialAtomicQueryMTPV2OnChainPrepareInputs;
    private credentialAtomicQuerySigV2PrepareInputs;
    private credentialAtomicQuerySigV2OnChainPrepareInputs;
    private credentialAtomicQueryV3PrepareInputs;
    private credentialAtomicQueryV3OnChainPrepareInputs;
    private linkedMultiQueryPrepareInputs;
    linkedMultiQuery10PrepareInputs: (ctx: InputContext) => Promise<GenerateInputsResult>;
    private transformV2QueryOperator;
    private checkOperatorSupport;
}
export {};
//# sourceMappingURL=inputs-generator.d.ts.map