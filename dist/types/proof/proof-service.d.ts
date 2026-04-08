import { DID } from '@iden3/js-iden3-core';
import { CircuitId, Query, TreeState } from '../circuits';
import { ICredentialWallet } from '../credentials';
import { IIdentityWallet } from '../identity';
import { ProofQuery, RevocationStatus, W3CCredential } from '../verifiable';
import { IZKProver } from './provers/prover';
import { Options } from '@iden3/js-jsonld-merklization';
import { ZKProof } from '@iden3/js-jwz';
import { Signer } from 'ethers';
import { StateVerificationOpts, JSONObject, ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse, ZeroKnowledgeProofAuthResponse } from '../iden3comm';
import { ICircuitStorage, IProofStorage, IStateStorage } from '../storage';
import { AuthProofGenerationOptions, ProofGenerationOptions } from './provers/inputs-generator';
import { VerifyOpts } from './verifiers';
export interface QueryWithFieldName {
    query: Query;
    fieldName: string;
    rawValue?: unknown;
    isSelectiveDisclosure?: boolean;
}
/**
 *  Metadata that returns on verification
 * @type VerificationResultMetadata
 */
export type VerificationResultMetadata = {
    linkID?: bigint;
};
/**
 *  List of options to customize ProofService
 */
export type ProofServiceOptions = Options & {
    prover?: IZKProver;
    proofsCacheStorage?: IProofStorage;
};
export interface ProofVerifyOpts {
    query: ProofQuery;
    sender: string;
    opts?: VerifyOpts;
    params?: JSONObject;
}
export interface IProofService {
    /**
     * Verification of zkp proof for given circuit id
     *
     * @param {ZKProof} zkp  - proof to verify
     * @param {CircuitId} circuitId - circuit id
     * @returns `{Promise<boolean>}`
     */
    verifyProof(zkp: ZKProof, circuitName: CircuitId): Promise<boolean>;
    /**
     * Verification of zkp proof and pub signals for given circuit id
     *
     * @param {ZeroKnowledgeProofResponse} response  - zero knowledge proof response
     * @param {ProofVerifyOpts} opts - proof verification options
     * @returns `{Promise<VerificationResultMetadata>}`
     */
    verifyZKPResponse(proofResp: ZeroKnowledgeProofResponse, opts: ProofVerifyOpts): Promise<VerificationResultMetadata>;
    /**
     * Generate proof from given identity and credential for protocol proof request
     *
     * @param {ZeroKnowledgeProofRequest} proofReq - protocol zkp request
     * @param {DID} identifier - did that will generate proof
     * @param {W3CCredential} credential - credential that will be used for proof generation
     * @param {ProofGenerationOptions} opts - options that will be used for proof generation
     *
     * @returns `Promise<ZeroKnowledgeProofResponse>`
     */
    generateProof(proofReq: ZeroKnowledgeProofRequest, identifier: DID, opts?: ProofGenerationOptions): Promise<ZeroKnowledgeProofResponse>;
    /**
     * @deprecated, use generateAuthInputs with CircuitId.AuthV2 instead
     * generates auth inputs
     *
     * @param {Uint8Array} hash - challenge that will be signed
     * @param {DID} did - identity that will generate a proof
     * @param {CircuitId} circuitId - circuit id for authentication
     * @returns `Promise<Uint8Array>`
     */
    generateAuthV2Inputs(hash: Uint8Array, did: DID, circuitId: CircuitId): Promise<Uint8Array>;
    /**
     * generates Auth inputs
     *
     * @param {Uint8Array} hash - challenge that will be signed
     * @param {DID} did - identity that will generate a proof
     * @param {CircuitId} circuitId - circuit id for authentication
     * @returns `Promise<Uint8Array>`
     */
    generateAuthInputs(hash: Uint8Array, did: DID, circuitId: CircuitId): Promise<Uint8Array>;
    /**
     * @deprecated, use generateAuthProof with CircuitId.AuthV2 instead
     * generates auth v2 proof from given identity
     *
     * @param {Uint8Array} hash - challenge that will be signed
     * @param {DID} did - identity that will generate a proof
     * @returns `Promise<ZKProof>`
     */
    generateAuthV2Proof(hash: Uint8Array, did: DID): Promise<ZKProof>;
    /**
     * Generate auth proof from given identity with generic params
     *
     * @param {CircuitId} circuitId - circuitId for the proof generation
     * @param {DID} identifier - did that will generate proof
     * @param {ProofGenerationOptions} opts - options that will be used for proof generation
     *
     * @returns `Promise<ZeroKnowledgeProofResponse>`
     */
    generateAuthProof(circuitId: CircuitId, identifier: DID, opts?: AuthProofGenerationOptions): Promise<ZeroKnowledgeProofAuthResponse>;
    /**
     * state verification function
     *
     * @param {string} circuitId - id of authentication circuit
     * @param {Array<string>} pubSignals - public signals of authentication circuit
     * @returns `Promise<boolean>`
     */
    verifyState(circuitId: string, pubSignals: Array<string>): Promise<boolean>;
    /**
     * transitState is done always to the latest state
     *
     * Generates a state transition proof and publishes state to the blockchain
     *
     * @param {DID} did - identity that will transit state
     * @param {TreeState} oldTreeState - previous tree state
     * @param {boolean} isOldStateGenesis - is a transition state is done from genesis state
     * @param {Signer} ethSigner - signer for transaction
     * @returns `{Promise<string>}` - transaction hash is returned
     */
    transitState(did: DID, oldTreeState: TreeState, isOldStateGenesis: boolean, stateStorage: IStateStorage, ethSigner: Signer): Promise<string>;
    findCredentialByProofQuery(did: DID, query: ProofQuery, opts?: {
        skipClaimRevocationCheck: boolean;
    }): Promise<{
        cred: W3CCredential;
        revStatus: RevocationStatus | undefined;
    }>;
}
/**
 * Proof service is an implementation of IProofService
 * that works with a native groth16 prover
 *
 * @public
 * @class ProofService
 * @implements implements IProofService interface
 */
export declare class ProofService implements IProofService {
    private readonly _identityWallet;
    private readonly _credentialWallet;
    private readonly _stateStorage;
    private readonly _prover;
    private readonly _ldOptions;
    private readonly _inputsGenerator;
    private readonly _pubSignalsVerifier;
    private readonly _proofsCacheStorage?;
    /**
     * Creates an instance of ProofService.
     * @param {IIdentityWallet} _identityWallet - identity wallet
     * @param {ICredentialWallet} _credentialWallet - credential wallet
     * @param {ICircuitStorage} _circuitStorage - circuit storage to load proving / verification files
     * @param {IStateStorage} _stateStorage - state storage to get GIST proof / publish state
     */
    constructor(_identityWallet: IIdentityWallet, _credentialWallet: ICredentialWallet, _circuitStorage: ICircuitStorage, _stateStorage: IStateStorage, opts?: ProofServiceOptions);
    /** {@inheritdoc IProofService.verifyProof} */
    verifyProof(zkp: ZKProof, circuitId: CircuitId): Promise<boolean>;
    /** {@inheritdoc IProofService.verify} */
    verifyZKPResponse(proofResp: ZeroKnowledgeProofResponse, opts: ProofVerifyOpts): Promise<VerificationResultMetadata>;
    /** {@inheritdoc IProofService.generateProof} */
    generateProof(proofReq: ZeroKnowledgeProofRequest, identifier: DID, opts?: ProofGenerationOptions): Promise<ZeroKnowledgeProofResponse>;
    private _generateProof;
    /** {@inheritdoc IProofService.generateAuthProof} */
    generateAuthProof(circuitId: CircuitId, identifier: DID, opts?: AuthProofGenerationOptions): Promise<ZeroKnowledgeProofAuthResponse>;
    /** {@inheritdoc IProofService.transitState} */
    transitState(did: DID, oldTreeState: TreeState, isOldStateGenesis: boolean, stateStorage: IStateStorage, // for compatibility with previous versions we leave this parameter
    ethSigner: Signer): Promise<string>;
    private generateInputs;
    private toCircuitsQuery;
    private loadLdContext;
    /** {@inheritdoc IProofService.generateAuthV2Inputs} */
    generateAuthV2Inputs(hash: Uint8Array, did: DID, circuitId: CircuitId): Promise<Uint8Array>;
    /** {@inheritdoc IProofService.generateAuthInputs} */
    generateAuthInputs(hash: Uint8Array, did: DID, circuitId: CircuitId): Promise<Uint8Array>;
    private generateAuthInputsCommon;
    /** {@inheritdoc IProofService.generateAuthV2Proof} */
    generateAuthV2Proof(challenge: Uint8Array, did: DID): Promise<ZKProof>;
    verifyState(circuitId: string, pubSignals: string[], opts?: StateVerificationOpts): Promise<boolean>;
    findCredentialByProofQuery(did: DID, query: ProofQuery): Promise<{
        cred: W3CCredential;
        revStatus: RevocationStatus | undefined;
    }>;
}
//# sourceMappingURL=proof-service.d.ts.map