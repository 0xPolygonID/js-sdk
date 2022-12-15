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
import { toLittleEndian } from '@iden3/js-iden3-core';
import { IStateStorage } from '../storage/interfaces';
import {
  BJJSignatureProof2021,
  Iden3SparseMerkleTreeProof,
  RevocationStatus,
  VerifiableConstants,
  W3CCredential
} from '../schema-processor';
import axios from 'axios';
import { BytesHelper, DID } from '@iden3/js-iden3-core';

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

export async function getStatusFromRHS(
  cred: W3CCredential,
  stateStorage: IStateStorage
): Promise<RevocationStatus> {
  //todo: check what is ID should be bigint
  const latestStateInfo = await stateStorage.getLatestStateById(cred.id);
  const credProof = cred.proof![0] as Iden3SparseMerkleTreeProof // TODO: find proof in other way. Auth BJJ credentials have only mtp proof
  if (latestStateInfo?.state === BigInt(0) && isIssuerGenesis(cred.issuer, credProof)) {
    return {
      mtp: new Proof(),
      issuer:{
        state: credProof.issuerData.state.value,
        revocationTreeRoot: credProof.issuerData.state.revocationTreeRoot,
        rootOfRoots: credProof.issuerData.state.rootOfRoots,
        claimsTreeRoot: credProof.issuerData.state.claimsTreeRoot,
      }
    };
  } else if (latestStateInfo?.state === BigInt(0)) {
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
