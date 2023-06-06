import {
  Hash,
  newHashFromBigInt,
  NodeAux,
  ZERO_HASH,
  setBitBigEndian,
  testBit,
  Merkletree,
  NodeLeaf,
  Siblings
} from '@iden3/js-merkletree';
import { IStateStorage } from '../storage/interfaces';

import { NODE_TYPE_LEAF, Proof } from '@iden3/js-merkletree';
import { hashElems } from '@iden3/js-merkletree';
import { DID } from '@iden3/js-iden3-core';
import { CredentialStatus, Issuer, RevocationStatus } from '../verifiable';
import { strMTHex } from '../circuits';

/**
 * Interface to unite contains three trees: claim, revocation and rootOfRoots
 * Also contains the current state of identity
 * @export
 * @beta
 * @interface TreesModel
 */
export interface TreesModel {
  claimsTree: Merkletree;
  revocationTree: Merkletree;
  rootsTree: Merkletree;
  state: Hash;
}

enum NodeType {
  Unknown = 0,
  Middle = 1,
  Leaf = 2,
  State = 3
}

/**
 * ProofNode is a partial Reverse Hash Service result
 * it contains the current node hash and its children
 *
 * @export
 * @beta
 * @class ProofNode
 */
export class ProofNode {
  /**
   *
   * Creates an instance of ProofNode.
   * @param {Hash} [hash=ZERO_HASH] - current node hash
   * @param {Hash[]} [children=[]] -  children of the node
   */
  constructor(public hash: Hash = ZERO_HASH, public children: Hash[] = []) {}

  /**
   * Determination of Node type
   * Can be: Leaf, Middle or State node
   *
   * @returns NodeType
   */
  nodeType(): NodeType {
    if (this.children.length === 2) {
      return NodeType.Middle;
    }

    if (
      this.children.length === 3 &&
      this.children[2].hex() === newHashFromBigInt(BigInt(1)).hex()
    ) {
      return NodeType.Leaf;
    }

    if (this.children.length === 3) {
      return NodeType.State;
    }

    return NodeType.Unknown;
  }
  /**
   * JSON Representation of ProofNode with a hex values
   *
   * @returns {*} - ProofNode with hexes
   */
  toJSON() {
    return {
      hash: this.hash.hex(),
      children: this.children.map((h) => h.hex())
    };
  }
  /**
   * Creates ProofNode Hashes from hex values
   *
   * @static
   * @param {ProofNodeHex} hexNode
   * @returns ProofNode
   */
  static fromHex(hexNode: ProofNodeHex): ProofNode {
    return new ProofNode(
      strMTHex(hexNode.hash),
      hexNode.children.map((ch) => strMTHex(ch))
    );
  }
}

interface ProofNodeHex {
  hash: string;
  children: string[];
}

interface NodeHexResponse {
  node: ProofNodeHex;
  status: string;
}

/**
 *
 * Fetches and Builds a revocation status for a given credential
 * Supported types for credentialStatus field: SparseMerkleTreeProof, Iden3ReverseSparseMerkleTreeProof
 *
 * @export
 * @param {DID} issuer - issuer identity
 * @param {(CredentialStatus)} credStatus - credentialStatus field from the W3C verifiable credential
 * @param {IStateStorage} stateStorage - storage to fetch current issuer status
 * @returns Promise<RevocationStatus>
 */
export async function getStatusFromRHS(
  issuer: DID,
  credStatus: CredentialStatus,
  stateStorage: IStateStorage
): Promise<RevocationStatus> {
  const latestStateInfo = await stateStorage.getLatestStateById(issuer.id.bigInt());
  const hashedRevNonce = newHashFromBigInt(BigInt(credStatus.revocationNonce ?? 0));
  const hashedIssuerRoot = newHashFromBigInt(BigInt(latestStateInfo?.state ?? 0));
  return getRevocationStatusFromRHS(hashedRevNonce, hashedIssuerRoot, credStatus.id);
}

/**
 * Gets partial revocation status info from rhs service.
 *
 * @param {Hash} data - hash to fetch
 * @param {Hash} issuerRoot - issuer root which is a part of url
 * @param {string} rhsURL - base URL for reverse hash service
 * @returns Promise<RevocationStatus>
 */
async function getRevocationStatusFromRHS(
  data: Hash,
  issuerRoot: Hash,
  rhsURL: string
): Promise<RevocationStatus> {
  if (!rhsURL) throw new Error('HTTP reverse hash service URL is not specified');

  const resp = await fetch(`${rhsURL}/node/${issuerRoot.hex()}`);
  const treeRoots = ((await resp.json()) as NodeHexResponse)?.node;
  if (treeRoots.children.length !== 3) {
    throw new Error('state should has tree children');
  }

  const s = issuerRoot.hex();
  const cTR = treeRoots.children[0];
  const rTR = treeRoots.children[1];
  const roTR = treeRoots.children[2];

  const rtrHashed = strMTHex(rTR);
  const nonRevProof = await rhsGenerateProof(rtrHashed, data, `${rhsURL}/node`);

  return {
    mtp: nonRevProof,
    issuer: {
      state: s,
      claimsTreeRoot: cTR,
      revocationTreeRoot: rTR,
      rootOfRoots: roTR
    }
  };
}

async function newProofFromData(
  existence: boolean,
  allSiblings: Hash[],
  nodeAux: NodeAux
): Promise<Proof> {
  const p = new Proof();
  p.existence = existence;
  p.nodeAux = nodeAux;
  p.depth = allSiblings.length;

  for (let i = 0; i < allSiblings.length; i++) {
    const sibling = allSiblings[i];
    if (JSON.stringify(allSiblings[i]) !== JSON.stringify(ZERO_HASH)) {
      setBitBigEndian(p.notEmpties, i);
      p.siblings.push(sibling);
    }
  }
  return p;
}

async function rhsGenerateProof(treeRoot: Hash, key: Hash, rhsURL: string): Promise<Proof> {
  let exists = false;
  const siblings: Hash[] = [];
  let nodeAux: NodeAux;

  const mkProof = () => newProofFromData(exists, siblings, nodeAux);

  let nextKey = treeRoot;
  for (let depth = 0; depth < key.bytes.length * 8; depth++) {
    if (nextKey.bytes.every((i) => i === 0)) {
      return mkProof();
    }
    const data = await fetch(`${rhsURL}/${nextKey.hex()}`);
    const resp = ((await data.json()) as NodeHexResponse)?.node;

    const n = ProofNode.fromHex(resp);
    switch (n.nodeType()) {
      case NodeType.Leaf:
        if (key.bytes.every((b, index) => b === n.children[0].bytes[index])) {
          exists = true;
          return mkProof();
        }
        // We found a leaf whose entry didn't match hIndex
        nodeAux = {
          key: n.children[0],
          value: n.children[1]
        };
        return mkProof();
      case NodeType.Middle:
        if (testBit(key.bytes, depth)) {
          nextKey = n.children[1];
          siblings.push(n.children[0]);
        } else {
          nextKey = n.children[0];
          siblings.push(n.children[1]);
        }
        break;
      default:
        throw new Error(`found unexpected node type in tree ${n.hash.hex()}`);
    }
  }

  throw new Error('tree depth is too high');
}

/**
 * Pushes identity state information to a reverse hash service.
 *
 * A reverse hash service (RHS) is a centralized or decentralized service for storing publicly available data about identity.
 * Such data are identity state and state of revocation tree and roots tree root tree.
 *
 * @export
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

  if (nb.nodes.length > 0) {
    await saveNodes(nb.nodes, rhsUrl);
  }
}

async function saveNodes(nodes: ProofNode[], nodeUrl: string): Promise<boolean> {
  const nodesJSON = nodes.map((n) => n.toJSON());
  const resp = await fetch(nodeUrl + '/node', { method: 'post', body: JSON.stringify(nodesJSON) });
  const status = resp.status;
  return status === 200;
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
 * @beta
 * @class NodesBuilder
 */
class NodesBuilder {
  constructor(
    public readonly nodes: ProofNode[] = [],
    public readonly seen: Map<string, boolean> = new Map()
  ) {}

  async addKey(tree: Merkletree, nodeKey: bigint): Promise<void> {
    const { value: nodeValue, siblings } = await tree.get(nodeKey);

    const nodeKeyHash = newHashFromBigInt(nodeKey);

    const nodeValueHash = newHashFromBigInt(nodeValue);

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
  const hashOfOne = newHashFromBigInt(BigInt(1));

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
    nodes[i].hash = await hashElems([nodes[i].children[0].bigInt(), nodes[i].children[1].bigInt()]);

    prevHash = nodes[i].hash;
  }

  return nodes;
}
/**
 *  Proof dto as a partial result of fetching credential status with type SparseMerkleTreeProof
 *
 * @export
 * @class ProofDTO
 */
export class ProofDTO {
  existence: boolean;
  siblings: string[];
  node_aux: {
    key: string;
    value: string;
  };
}

/**
 * RevocationStatusDTO is a result of fetching credential status with type SparseMerkleTreeProof
 *
 * @beta
 * @export
 * @class RevocationStatusDTO
 */
export class RevocationStatusDTO {
  issuer: Issuer;
  mtp: ProofDTO;

  toRevocationStatus(): RevocationStatus {
    const p = new Proof();
    p.existence = this.mtp.existence;
    p.nodeAux = this.mtp.node_aux
      ? ({
          key: newHashFromBigInt(BigInt(this.mtp.node_aux.key)),
          value: newHashFromBigInt(BigInt(this.mtp.node_aux.value))
        } as NodeAux)
      : undefined;

    const s = this.mtp.siblings.map((s) => newHashFromBigInt(BigInt(s)));

    p.siblings = [];
    p.depth = s.length;

    for (let lvl = 0; lvl < s.length; lvl++) {
      if (s[lvl].bigInt() !== BigInt(0)) {
        setBitBigEndian(p.notEmpties, lvl);
        p.siblings.push(s[lvl]);
      }
    }
    return {
      mtp: p,
      issuer: this.issuer
    };
  }
}
