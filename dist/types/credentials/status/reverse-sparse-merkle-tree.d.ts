import { Hash, Proof, NodeAux } from '@iden3/js-merkletree';
import { IStateStorage } from '../../storage';
import { CredentialStatusResolver, CredentialStatusResolveOptions } from './resolver';
import { CredentialStatus, RevocationStatus } from '../../verifiable';
/**
 * ProofNode is a partial Reverse Hash Service result
 * it contains the current node hash and its children
 *
 * @public
 * @class ProofNode
 */
export declare class ProofNode {
    hash: Hash;
    children: Hash[];
    /**
     *
     * Creates an instance of ProofNode.
     * @param {Hash} [hash=ZERO_HASH] - current node hash
     * @param {Hash[]} [children=[]] -  children of the node
     */
    constructor(hash?: Hash, children?: Hash[]);
    /**
     * Determination of Node type
     * Can be: Leaf, Middle or State node
     *
     * @returns NodeType
     */
    nodeType(): NodeType;
    /**
     * JSON Representation of ProofNode with a hex values
     *
     * @returns {*} - ProofNode with hexes
     */
    toJSON(): {
        hash: string;
        children: string[];
    };
    /**
     * Creates ProofNode Hashes from hex values
     *
     * @static
     * @param {ProofNodeHex} hexNode
     * @returns ProofNode
     */
    static fromHex(hexNode: ProofNodeHex): ProofNode;
}
interface ProofNodeHex {
    hash: string;
    children: string[];
}
declare enum NodeType {
    Unknown = 0,
    Middle = 1,
    Leaf = 2,
    State = 3
}
/**
 * RHSResolver is a class that allows to interact with the RHS service to get revocation status.
 *
 * @public
 * @class RHSResolver
 */
export declare class RHSResolver implements CredentialStatusResolver {
    private readonly _state;
    constructor(_state: IStateStorage);
    /**
     * resolve is a method to resolve a credential status from the blockchain.
     *
     * @public
     * @param {CredentialStatus} credentialStatus -  credential status to resolve
     * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
     * @returns `{Promise<RevocationStatus>}`
     */
    resolve(credentialStatus: CredentialStatus, credentialStatusResolveOptions?: CredentialStatusResolveOptions): Promise<RevocationStatus>;
    /**
     * Gets revocation status from rhs service.
     * @param {CredentialStatus} credentialStatus
     * @param {DID} issuerDID
     * @returns Promise<RevocationStatus>
     */
    private getStatus;
    /**
     * Gets partial revocation status info from rhs service.
     *
     * @param {Hash} data - hash to fetch
     * @param {Hash} issuerRoot - issuer root which is a part of url
     * @param {string} rhsUrl - base URL for reverse hash service
     * @returns Promise<RevocationStatus>
     */
    private getRevocationStatusFromRHS;
    rhsGenerateProof(treeRoot: Hash, key: Hash, rhsUrl: string): Promise<Proof>;
    newProofFromData(existence: boolean, allSiblings: Hash[], nodeAux: NodeAux): Promise<Proof>;
}
/**
 * Checks if issuer did is created from given state is genesis
 *
 * @param {string} issuer - did (string)
 * @param {string} state  - hex state
 * @returns boolean
 */
export declare function isIssuerGenesis(issuer: string, state: string): boolean;
/**
 * Checks if id is created from given state and type is genesis
 *
 * @param {bigint} id
 * @param {bigint} state
 * @param {Uint8Array} type
 * @returns boolean - returns if id is genesis
 */
export declare function isGenesisStateId(id: bigint, state: bigint, type: Uint8Array): boolean;
export {};
