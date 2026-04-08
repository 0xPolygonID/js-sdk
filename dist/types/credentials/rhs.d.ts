import { Hash, Merkletree } from '@iden3/js-merkletree';
import { ProofNode } from './status/reverse-sparse-merkle-tree';
/**
 * Interface to unite contains three trees: claim, revocation and rootOfRoots
 * Also contains the current state of identity
 * @public
 * @interface TreesModel
 */
export interface TreesModel {
    claimsTree: Merkletree;
    revocationTree: Merkletree;
    rootsTree: Merkletree;
    state: Hash;
}
/**
 * Pushes identity state information to a reverse hash service.
 *
 * A reverse hash service (RHS) is a centralized or decentralized service for storing publicly available data about identity.
 * Such data are identity state and state of revocation tree and roots tree root tree.
 *
 * @deprecated Use `pushHashesToReverseHashService` instead.
 * @param {Hash} state - current state of identity
 * @param {TreesModel} trees - current trees of identity (claims, revocation, rootOfRoots )
 * @param {string} rhsUrl - URL of service
 * @param {number[]} [revokedNonces] - revoked nonces since last published info
 * @returns void
 */
export declare function pushHashesToRHS(state: Hash, trees: TreesModel, rhsUrl: string, revokedNonces?: number[]): Promise<void>;
/**
 * Retrieves the representation of nodes for generating a proof.
 *
 * @param revokedNonces - An array of revoked nonces.
 * @param trees - The TreesModel object containing the necessary trees.
 * @param state - The hash of the state.
 * @returns A Promise that resolves to an array of ProofNode objects.
 */
export declare function getNodesRepresentation(revokedNonces: number[] | undefined, trees: TreesModel, state: Hash): Promise<ProofNode[]>;
//# sourceMappingURL=rhs.d.ts.map