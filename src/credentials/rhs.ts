import { Hash, testBit, Merkletree, NodeLeaf, Siblings } from '@iden3/js-merkletree';

import { NODE_TYPE_LEAF } from '@iden3/js-merkletree';
import { hashElems } from '@iden3/js-merkletree';
import { ProofNode } from './status/reverse-sparse-merkle-tree';
import { Iden3SmtRhsCredentialStatusPublisher } from './status/credential-status-publisher';
import { CredentialStatusType } from '../verifiable';
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
export async function pushHashesToRHS(
  state: Hash,
  trees: TreesModel,
  rhsUrl: string,
  revokedNonces?: number[]
): Promise<void> {
  const nodes = await getNodesRepresentation(revokedNonces, trees, state);
  const publisher = new Iden3SmtRhsCredentialStatusPublisher();
  await publisher.publish({
    nodes,
    credentialStatusType: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
    rhsUrl: rhsUrl
  });
}

/**
 * Retrieves the representation of nodes for generating a proof.
 *
 * @param revokedNonces - An array of revoked nonces.
 * @param trees - The TreesModel object containing the necessary trees.
 * @param state - The hash of the state.
 * @returns A Promise that resolves to an array of ProofNode objects.
 */
export async function getNodesRepresentation(
  revokedNonces: number[] | undefined,
  trees: TreesModel,
  state: Hash
): Promise<ProofNode[]> {
  const nb = new NodesBuilder();

  if (revokedNonces) {
    await addRevocationNode(nb, trees, revokedNonces);
  }

  await addRoRNode(nb, trees);

  // add new state node
  if (!state.bytes.every((b) => b === 0)) {
    nb.addProofNode(
      new ProofNode(state, [
        await trees.claimsTree.root(),
        await trees.revocationTree.root(),
        await trees.rootsTree.root()
      ])
    );
  }

  return nb.nodes;
}

async function addRoRNode(nb: NodesBuilder, trees: TreesModel): Promise<void> {
  const currentRootsTree = trees.rootsTree;
  const claimsTree = trees.claimsTree;

  return nb.addKey(currentRootsTree, (await claimsTree.root()).bigInt());
}

async function addRevocationNode(
  nb: NodesBuilder,
  trees: TreesModel,
  revokedNonces: number[]
): Promise<void> {
  const revocationTree = trees.revocationTree;

  for (const nonce of revokedNonces) {
    await nb.addKey(revocationTree, BigInt(nonce));
  }
}

/**
 * Builder to send state information to Reverse hash Service
 *
 * @public
 * @class NodesBuilder
 */
class NodesBuilder {
  constructor(
    public readonly nodes: ProofNode[] = [],
    public readonly seen: Map<string, boolean> = new Map()
  ) {}

  async addKey(tree: Merkletree, nodeKey: bigint): Promise<void> {
    const { value: nodeValue, siblings } = await tree.get(nodeKey);

    const nodeKeyHash = Hash.fromBigInt(nodeKey);

    const nodeValueHash = Hash.fromBigInt(nodeValue);

    const node = new NodeLeaf(nodeKeyHash, nodeValueHash);
    const newNodes: ProofNode[] = await buildNodesUp(siblings, node);

    for (const n of newNodes) {
      if (!this.seen.get(n.hash.hex())) {
        this.nodes.push(n);
        this.seen.set(n.hash.hex(), true);
      }
    }
  }

  addProofNode(node: ProofNode): void {
    const hex = node.hash.hex();
    const isSeen = this.seen.get(hex);
    if (!isSeen) {
      this.nodes.push(node);
      this.seen.set(hex, true);
    }
  }
}

async function buildNodesUp(siblings: Siblings, node: NodeLeaf): Promise<ProofNode[]> {
  if (node.type !== NODE_TYPE_LEAF) {
    throw new Error('node is not a leaf');
  }

  let prevHash = await node.getKey();
  const sl = siblings.length;
  const nodes = new Array<ProofNode>(sl + 1);
  for (let index = 0; index < nodes.length; index++) {
    nodes[index] = new ProofNode();
  }
  nodes[sl].hash = prevHash;
  const hashOfOne = Hash.fromBigInt(BigInt(1));

  nodes[sl].children = [node.entry[0], node.entry[1], hashOfOne];

  const pathKey: Hash = node.entry[0];
  for (let i = sl - 1; i >= 0; i--) {
    const isRight = testBit(pathKey.bytes, i);
    nodes[i].children = new Array<Hash>(2);
    if (isRight) {
      nodes[i].children[0] = siblings[i];
      nodes[i].children[1] = prevHash;
    } else {
      nodes[i].children[0] = prevHash;
      nodes[i].children[1] = siblings[i];
    }
    nodes[i].hash = hashElems([nodes[i].children[0].bigInt(), nodes[i].children[1].bigInt()]);

    prevHash = nodes[i].hash;
  }

  return nodes;
}
