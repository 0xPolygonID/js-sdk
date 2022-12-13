import {
  Hash,
  newHashFromBigInt,
  newHashFromString,
  NodeAux,
  Proof,
  ZERO_HASH,
  setBitBigEndian,
  testBit
} from '@iden3/js-merkletree';
import { IStateStorage } from '../blockchain';
import { RevocationStatus, VerifiableConstants, W3CCredential } from '../schema-processor';
import axios from 'axios';

export interface Node {
  hash: Hash;
  children: Hash[];
}

enum NodeType {
  NodeTypeUnknown = 0,
  Middle = 1,
  Leaf = 2,
  State = 3,
  Unknown = 4
}

interface NodeResponse {
  node: Node;
  status: string;
}

export async function getStatusFromRHS(
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
  return await getNonRevocationStatusFromRHS(
    cred.credentialStatus?.id,
    hashedRevNonce,
    hashedIssuerRoot
  );
}

export async function getNonRevocationStatusFromRHS(
  rhsURL: string | undefined,
  data: Hash,
  issuerRoot: Hash
) {
  if (!rhsURL) throw new Error('HTTP reverse hash service url is not specified');
  const nodeUrl = rhsURL.endsWith('/') ? `${rhsURL}node` : `${rhsURL}/node`;
  const treeRoots = (await axios.get<NodeResponse>(`${nodeUrl}/${issuerRoot.hex()}`)).data?.node;
  if (treeRoots.children.length !== 3) {
    throw new Error('state should has tree children');
  }

  const s = issuerRoot.hex();
  const cTR = treeRoots.children[0].hex();
  const rTR = treeRoots.children[1].hex();
  const roTR = treeRoots.children[2].hex();

  const rtrHashed = newHashFromString(rTR);
  const nonRevProof = await rhsGenerateProof(nodeUrl, rtrHashed, data);

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

export function newProofFromData(existence: boolean, allSiblings: Hash[], nodeAux: NodeAux): Proof {
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

function nodeType(node: Node): NodeType {
  if (node.children.length === 2) {
    return NodeType.Middle;
  }

  if (node.children.length === 3 && node.children[2] === newHashFromBigInt(BigInt(1))) {
    return NodeType.Leaf;
  }

  if (node.children.length === 3) {
    return NodeType.State;
  }

  return NodeType.Unknown;
}

export async function rhsGenerateProof(nodeUrl: string, treeRoot: Hash, key: Hash): Promise<Proof> {
  let exists: boolean;
  const siblings: Hash[] = [];
  let nodeAux: NodeAux;

  const mkProof = () => newProofFromData(exists, siblings, nodeAux);

  let nextKey = treeRoot;
  for (let depth = 0; depth < key.bytes.length * 8; depth++) {
    if (nextKey.bytes.every((i) => i === 0)) {
      return mkProof();
    }
    const n = (await axios.get<NodeResponse>(`${nodeUrl}/${nextKey.hex()}`)).data?.node;

    switch (nodeType(n)) {
      case NodeType.Leaf:
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
