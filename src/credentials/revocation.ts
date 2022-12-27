import {
  Hash,
  newHashFromBigInt,
  newHashFromString,
  NodeAux,
  ZERO_HASH,
  setBitBigEndian,
  testBit,
  Merkletree,
  NodeLeaf,
  Siblings
} from '@iden3/js-merkletree';
import { IStateStorage } from '../storage/interfaces';

import axios from 'axios';
import { NODE_TYPE_LEAF, Proof } from '@iden3/js-merkletree';
import { NODE_TYPE_MIDDLE } from '@iden3/js-merkletree';
import { hashElems } from '@iden3/js-merkletree';
import { BytesHelper, DID } from '@iden3/js-iden3-core';
import {
  CredentialStatus,
  RevocationStatus,
  RHSCredentialStatus,
  VerifiableConstants
} from '../verifiable';

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

export class ProofNode {
  constructor(public hash: Hash = ZERO_HASH, public children: Hash[] = []) {}

  nodeType(): NodeType {
    if (this.children.length === 2) {
      return NodeType.Middle;
    }

    if (this.children.length === 3 && this.children[2] === newHashFromBigInt(BigInt(1))) {
      return NodeType.Leaf;
    }

    if (this.children.length === 3) {
      return NodeType.State;
    }

    return NodeType.Unknown;
  }
}

interface NodeResponse {
  node: ProofNode;
  status: string;
}

export async function getStatusFromRHS(
  issuer: DID,
  credStatus: CredentialStatus | RHSCredentialStatus,
  stateStorage: IStateStorage
): Promise<RevocationStatus> {
  const latestStateInfo = await stateStorage.getLatestStateById(issuer.id.bigInt());
  if (latestStateInfo?.state === BigInt(0)) {
    throw new Error(VerifiableConstants.ERRORS.ISSUER_STATE_NOT_FOUND);
  }
  const hashedRevNonce = newHashFromBigInt(BigInt(credStatus.revocationNonce ?? 0));
  const hashedIssuerRoot = newHashFromBigInt(BigInt(latestStateInfo?.state ?? 0));
  return getNonRevocationStatusFromRHS(hashedRevNonce, hashedIssuerRoot, credStatus.id);
}

async function getNonRevocationStatusFromRHS(
  data: Hash,
  issuerRoot: Hash,
  rhsURL: string
): Promise<RevocationStatus> {
  if (!rhsURL) throw new Error('HTTP reverse hash service url is not specified');

  const treeRoots = (await axios.get<NodeResponse>(`${rhsURL}/${issuerRoot.hex()}`)).data?.node;
  if (treeRoots.children.length !== 3) {
    throw new Error('state should has tree children');
  }

  const s = issuerRoot.hex();
  const cTR = treeRoots.children[0].hex();
  const rTR = treeRoots.children[1].hex();
  const roTR = treeRoots.children[2].hex();

  const rtrHashed = newHashFromString(rTR);
  const nonRevProof = await rhsGenerateProof(rtrHashed, data, rhsURL);

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
  let exists: boolean;
  const siblings: Hash[] = [];
  let nodeAux: NodeAux;

  const mkProof = () => newProofFromData(exists, siblings, nodeAux);

  let nextKey = treeRoot;
  for (let depth = 0; depth < key.bytes.length * 8; depth++) {
    if (nextKey.bytes.every((i) => i === 0)) {
      return mkProof();
    }
    const n = (await axios.get<NodeResponse>(`${rhsURL}/${nextKey.hex()}`)).data?.node;

    switch (n.nodeType()) {
      case NODE_TYPE_LEAF:
        if (key.bytes.every((b, index) => b === n.children[0][index])) {
          exists = true;
          return mkProof();
        }
        // We found a leaf whose entry didn't match hIndex
        nodeAux = {
          key: n.children[0],
          value: n.children[1]
        };
        return mkProof();
      case NODE_TYPE_MIDDLE:
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
export async function pushHashesToRHS(
  state: Hash,
  trees: TreesModel,
  rhsUrl: string
): Promise<void> {
  const nb = new NodesBuilder();

  await addRoRNode(nb, trees);

  // add new state node
  if (!state.bytes.every((b) => b === 0)) {
    nb.addProofNode(
      new ProofNode(state, [trees.revocationTree.root, trees.rootsTree.root, trees.claimsTree.root])
    );
  }

  if (nb.nodes.length > 0) {
    await saveNodes(nb.nodes, rhsUrl);
  }
}

async function saveNodes(nodes: ProofNode[], nodeUrl: string): Promise<boolean> {
  return (await (await axios.post(nodeUrl, nodes)).status) === 200;
}

function addRoRNode(nb: NodesBuilder, trees: TreesModel): Promise<void> {
  const currentRootsTree = trees.rootsTree;
  const claimsTree = trees.claimsTree;
  
  return nb.addKey(currentRootsTree, claimsTree.root.bigInt());
}

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
