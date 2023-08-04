import { Signature } from '@iden3/js-crypto';
import { DID } from '@iden3/js-iden3-core';
import { CircuitId, Query, TreeState } from '../circuits';
import { ICredentialWallet } from '../credentials';
import { IIdentityWallet } from '../identity';
import { W3CCredential } from '../verifiable';
import { Options } from '@iden3/js-jsonld-merklization';
import { ZKProof } from '@iden3/js-jwz';
import { Signer } from 'ethers';
import { ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from '../iden3comm';
import { ICircuitStorage, IStateStorage } from '../storage';
export interface QueryWithFieldName {
    query: Query;
    fieldName: string;
    rawValue?: unknown;
    isSelectiveDisclosure?: boolean;
}
export interface ProofGenerationOptions {
    skipRevocation: boolean;
    challenge?: bigint;
    credential?: W3CCredential;
}
export interface DIDProfileMetadata {
    authProfileNonce: number;
    credentialSubjectProfileNonce: number;
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
     * generates auth inputs
     *
     * @param {Uint8Array} hash - challenge that will be signed
     * @param {DID} did - identity that will generate a proof
     * @param {Number} profileNonce - identity that will generate a proof
     * @param {CircuitId} circuitId - circuit id for authentication
     * @returns `Promise<Uint8Array>`
     */
    generateAuthV2Inputs(hash: Uint8Array, did: DID, circuitId: CircuitId): Promise<Uint8Array>;
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
     * @param {IStateStorage} stateStorage - storage of identity states (only eth based storage currently)
     * @param {Signer} ethSigner - signer for transaction
     * @returns `{Promise<string>}` - transaction hash is returned
     */
    transitState(did: DID, oldTreeState: TreeState, isOldStateGenesis: boolean, stateStorage: IStateStorage, ethSigner: Signer): Promise<string>;
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
    private readonly _ldLoader;
    /**
     * Creates an instance of ProofService.
     * @param {IIdentityWallet} _identityWallet - identity wallet
     * @param {ICredentialWallet} _credentialWallet - credential wallet
     * @param {ICircuitStorage} _circuitStorage - circuit storage to load proving / verification files
     * @param {IStateStorage} _stateStorage - state storage to get GIST proof / publish state
     */
    constructor(_identityWallet: IIdentityWallet, _credentialWallet: ICredentialWallet, _circuitStorage: ICircuitStorage, _stateStorage: IStateStorage, opts?: Options);
    /** {@inheritdoc IProofService.verifyProof} */
    verifyProof(zkp: ZKProof, circuitId: CircuitId): Promise<boolean>;
    /** {@inheritdoc IProofService.generateProof} */
    generateProof(proofReq: ZeroKnowledgeProofRequest, identifier: DID, opts?: ProofGenerationOptions): Promise<ZeroKnowledgeProofResponse>;
    /** {@inheritdoc IProofService.transitState} */
    transitState(did: DID, oldTreeState: TreeState, isOldStateGenesis: boolean, stateStorage: IStateStorage, ethSigner: Signer): Promise<string>;
    private getPreparedCredential;
    private prepareAuthBJJCredential;
    private generateInputs;
    private generateMTPV2Inputs;
    private generateMTPV2OnChainInputs;
    private generateQuerySigV2Inputs;
    private generateQuerySigV2OnChainInputs;
    private newCircuitClaimData;
    private toCircuitsQuery;
    private prepareMerklizedQuery;
    private prepareNonMerklizedQuery;
    private parseRequest;
    transformQueryValueToBigInts(value: unknown, ldType: string): Promise<bigint[]>;
    /** {@inheritdoc IProofService.generateAuthV2Inputs} */
    generateAuthV2Inputs(hash: Uint8Array, did: DID, circuitId: CircuitId): Promise<Uint8Array>;
    verifyState(circuitId: string, pubSignals: Array<string>): Promise<boolean>;
    private findCredential;
}
export declare const bJJSignatureFromHexString: (sigHex: string) => Promise<Signature>;
