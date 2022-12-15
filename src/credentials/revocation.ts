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
import { toLittleEndian } from '@iden3/js-iden3-core';
import { IStateStorage } from '../storage/interfaces';
import {
  BJJSignatureProof2021,
  Iden3SparseMerkleTreeProof,
  RevocationStatus,
  W3CCredential
} from '../schema-processor';
import axios from 'axios';
import { NODE_TYPE_LEAF, Proof } from '@iden3/js-merkletree';
import { NODE_TYPE_MIDDLE } from '@iden3/js-merkletree';
import { hashElems } from '@iden3/js-merkletree';
import { TreeState } from '../circuits';
import { BytesHelper, DID } from '@iden3/js-iden3-core';

export interface TreesModel {
  claimsTree: Merkletree;
  revocationTree: Merkletree;
  rootsTree: Merkletree;
}

export enum NodeType {
  Unknown = 0,
  Middle = 1,
  Leaf = 2,
  State = 3
}

export interface IRevocationService {
  getStatusFromRHS(cred: W3CCredential, stateStorage: IStateStorage): Promise<RevocationStatus>;
  pushHashesToRHS(state: Hash, trees: TreesModel): Promise<void>;
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
export function isIssuerGenesis(
  issuer: string,
  proof: BJJSignatureProof2021 | Iden3SparseMerkleTreeProof
): boolean {
  const did = DID.parse(issuer);
  const arr = BytesHelper.hexToBytes(proof.issuerData.state.value!);
  const stateBigInt = BytesHelper.bytesToInt(arr);
  return isGenesisStateId(did.id.bigInt(), stateBigInt);
}

export function isGenesisStateId(id: bigint, state: bigint): boolean {
  const idBytes = toLittleEndian(id, 31);

  const typeBJP0 = new Uint8Array(2);
  const stateBytes = toLittleEndian(id, 32);
  const idGenesisBytes = stateBytes.slice(-27);

  // we take last 27 bytes, because of swapped endianness
  const idFromStateBytes = Uint8Array.from([
    ...typeBJP0,
    ...idGenesisBytes,
    ...BytesHelper.calculateChecksum(typeBJP0, idGenesisBytes)
  ]);

  if (JSON.stringify(idBytes) !== JSON.stringify(idFromStateBytes)) {
    return false;
  }

  return true;
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
    const credProof = cred.proof![0] as Iden3SparseMerkleTreeProof; // TODO: find proof in other way. Auth BJJ credentials have only mtp proof
    if (latestStateInfo?.state === BigInt(0) && isIssuerGenesis(cred.issuer, credProof)) {
      return {
        mtp: new Proof(),
        issuer: {
          state: credProof.issuerData.state.value,
          revocationTreeRoot: credProof.issuerData.state.revocationTreeRoot,
          rootOfRoots: credProof.issuerData.state.rootOfRoots,
          claimsTreeRoot: credProof.issuerData.state.claimsTreeRoot
        }
      };
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
  async pushHashesToRHS(state: Hash, trees: TreesModel): Promise<void> {
    const nb = new NodesBuilder();

    await this.addRoRNode(nb, trees);

    // add new state node
    if (!state.bytes.every((b) => b === 0)) {
      nb.addProofNode(
        new ProofNode(state, [
          trees.revocationTree.root,
          trees.rootsTree.root,
          trees.claimsTree.root
        ])
      );
    }

    if (nb.nodes.length > 0) {
      await this.saveNodes(nb.nodes);
    }
  }

  private async saveNodes(nodes: ProofNode[]): Promise<boolean> {
    const nodeUrl = this._rhsURL.endsWith('/') ? `${this._rhsURL}node` : `${this._rhsURL}/node`;
    return (await (await axios.post(nodeUrl, nodes)).status) === 200;
  }

  addRoRNode(nb: NodesBuilder, trees: TreesModel): Promise<void> {
    //todo: root
    const currentRootsTree = trees.rootsTree;

    const claimsTree = trees.claimsTree;
    //to
    return nb.addKey(currentRootsTree, claimsTree.root.bigInt());
  }
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
