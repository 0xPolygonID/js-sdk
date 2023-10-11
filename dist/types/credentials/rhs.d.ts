import { Hash, Merkletree } from '@iden3/js-merkletree';
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
 * @param {Hash} state - current state of identity
 * @param {TreesModel} trees - current trees of identity (claims, revocation, rootOfRoots )
 * @param {string} rhsUrl - URL of service
 * @param {number[]} [revokedNonces] - revoked nonces since last published info
 * @returns void
 */
export declare function pushHashesToRHS(state: Hash, trees: TreesModel, rhsUrl: string, revokedNonces?: number[]): Promise<void>;
