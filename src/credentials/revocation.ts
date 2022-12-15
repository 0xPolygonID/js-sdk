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
  Siblings,
  Node
} from '@iden3/js-merkletree';
import { IStateStorage } from '../storage/interfaces';
import { RevocationStatus, VerifiableConstants, W3CCredential } from '../schema-processor';
import axios from 'axios';
import { NODE_TYPE_LEAF, Proof } from '@iden3/js-merkletree';
import { NODE_TYPE_MIDDLE } from '@iden3/js-merkletree';
import { hashElems } from '@iden3/js-merkletree';
import { TreeState } from '../circuits';

export enum NodeType {
  Unknown = 0,
  Middle = 1,
  Leaf = 2,
  State = 3
}

export interface IRevocationService {
  getStatusFromRHS(cred: W3CCredential, stateStorage: IStateStorage): Promise<RevocationStatus>;
  pushHashesToRHS(treeState: TreeState): Promise<void>;
}

export class ProofNode {
  constructor(public readonly hash: Hash = ZERO_HASH, public readonly children: Hash[] = []) {}

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

export class RevocationService implements IRevocationService {
  // http://localhost:8003
  constructor(private readonly _rhsURL: string) {
    const nodeUrl = this._rhsURL.endsWith('/') ? `${this._rhsURL}node` : `${this._rhsURL}/node`;
  }

  async getStatusFromRHS(
    cred: W3CCredential,
    stateStorage: IStateStorage
  ): Promise<RevocationStatus> {
    //todo: check what is ID should be bigint
    const latestStateInfo = await stateStorage.getLatestStateById(cred.id);
    if (latestStateInfo?.state === BigInt(0)) {
      throw new Error(VerifiableConstants.ERRORS.ISSUER_STATE_NOT_FOUND);
    }
    const hashedRevNonce = newHashFromBigInt(BigInt(cred?.credentialStatus?.revocationNonce ?? 0));
    const hashedIssuerRoot = newHashFromBigInt(BigInt(latestStateInfo?.state ?? 0));
    return this.getNonRevocationStatusFromRHS(hashedRevNonce, hashedIssuerRoot);
  }

  private async getNonRevocationStatusFromRHS(
    data: Hash,
    issuerRoot: Hash
  ): Promise<RevocationStatus> {
    if (!this._rhsURL) throw new Error('HTTP reverse hash service url is not specified');
    const treeRoots = (await axios.get<NodeResponse>(`${this._rhsURL}/${issuerRoot.hex()}`)).data
      ?.node;
    if (treeRoots.children.length !== 3) {
      throw new Error('state should has tree children');
    }

    const s = issuerRoot.hex();
    const cTR = treeRoots.children[0].hex();
    const rTR = treeRoots.children[1].hex();
    const roTR = treeRoots.children[2].hex();

    const rtrHashed = newHashFromString(rTR);
    const nonRevProof = await this.rhsGenerateProof(rtrHashed, data);

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

  private newProofFromData(existence: boolean, allSiblings: Hash[], nodeAux: NodeAux): Proof {
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

  private async rhsGenerateProof(treeRoot: Hash, key: Hash): Promise<Proof> {
    let exists: boolean;
    const siblings: Hash[] = [];
    let nodeAux: NodeAux;

    const mkProof = () => this.newProofFromData(exists, siblings, nodeAux);

    let nextKey = treeRoot;
    for (let depth = 0; depth < key.bytes.length * 8; depth++) {
      if (nextKey.bytes.every((i) => i === 0)) {
        return mkProof();
      }
      const n = (await axios.get<NodeResponse>(`${this._rhsURL}/${nextKey.hex()}`)).data?.node;

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
  async pushHashesToRHS(treeState: TreeState): Promise<void> {
    const nb = new NodesBuilder();

    // this.addRoRNode(nb, trees);

    // add new state node
    if (!treeState.state.bytes.every((b) => b === 0)) {
      nb.addProofNode(
        new ProofNode(treeState.state, [
          treeState.revocationRoot,
          treeState.rootOfRoots,
          treeState.claimsRoot
        ])
      );
    }

    if (nb.nodes.length > 0) {
      await this.saveNodes(nb.nodes);
    }
  }

  private async saveNodes(nodes: Node[]): Promise<boolean> {
    const nodeUrl = this._rhsURL.endsWith('/') ? `${this._rhsURL}node` : `${this._rhsURL}/node`;
    return (await (await axios.post(nodeUrl, nodes)).status) === 200;
  }

  addRoRNode(nb: NodesBuilder, treeState: TreeState): Promise<void> {
    //todo: root
    const currentRootsTree = treeState.rootOfRoots;

    const claimsTree = treeState.claimsRoot;
    //to
    return nb.addKey(currentRootsTree, claimsTree?.root.bigInt());
  }
}

class NodesBuilder {
  constructor(
    public readonly nodes: Node[] = [],
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

async function buildNodesUp(siblings: Siblings, node: Node): Promise<ProofNode[]> {
  if (node.type !== NODE_TYPE_LEAF) {
    throw new Error('node is not a leaf');
  }
  node = node as NodeLeaf;

  let prevHash = await node.getKey();
  const sl = siblings.length;
  const nodes = new Array<Node>(sl + 1);
  nodes[sl].hash = prevHash;
  const hashOfOne = newHashFromBigInt(BigInt(1));

  nodes[sl].children = [node.entry[0], node.entry[1], hashOfOne];

  const pathKey: Hash = node.entry[0];
  for (let i = sl - 1; i >= 0; i--) {
    const isRight = testBit(pathKey, i);
    nodes[i].children = new Array<Hash>(2);
    if (isRight) {
      nodes[i].children[0] = siblings[i];
      nodes[i].children[1] = prevHash;
    } else {
      nodes[i].children[0] = prevHash;
      nodes[i].children[1] = siblings[i];
    }
    nodes[i].hash = hashElems(nodes[i].children[0].bigInt(), nodes[i].children[1].bigInt());

    prevHash = nodes[i].hash;
  }

  return nodes;
}
