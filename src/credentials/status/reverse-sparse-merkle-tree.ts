import { buildDIDType, BytesHelper, DID, Id } from '@iden3/js-iden3-core';

import {
  newHashFromBigInt,
  Hash,
  Proof,
  NodeAux,
  ZERO_HASH,
  setBitBigEndian,
  testBit,
  newHashFromHex
} from '@iden3/js-merkletree';
import { IStateStorage } from '../../storage';
import { CredentialStatusResolver, CredentialStatusResolveOptions } from './resolver';
import { CredentialStatus, IssuerData, RevocationStatus } from '../../verifiable';
import { strMTHex } from '../../circuits';
import { VerifiableConstants, CredentialStatusType } from '../../verifiable/constants';
import { isGenesisState } from './utils';

/**
 * ProofNode is a partial Reverse Hash Service result
 * it contains the current node hash and its children
 *
 * @public
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

enum NodeType {
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
export class RHSResolver implements CredentialStatusResolver {
  constructor(private readonly _state: IStateStorage) {}

  /**
   * resolve is a method to resolve a credential status from the blockchain.
   *
   * @public
   * @param {CredentialStatus} credentialStatus -  credential status to resolve
   * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
   * @returns `{Promise<RevocationStatus>}`
   */
  async resolve(
    credentialStatus: CredentialStatus,
    credentialStatusResolveOptions?: CredentialStatusResolveOptions
  ): Promise<RevocationStatus> {
    if (!credentialStatusResolveOptions?.issuerDID) {
      throw new Error('IssuerDID is not set in options');
    }

    try {
      return await this.getStatus(
        credentialStatus,
        credentialStatusResolveOptions.issuerDID,
        credentialStatusResolveOptions.issuerData
      );
    } catch (e: unknown) {
      if (credentialStatus?.statusIssuer?.type === CredentialStatusType.SparseMerkleTreeProof) {
        try {
          return await (await fetch(credentialStatus.id)).json();
        } catch (e) {
          throw new Error(`can't fetch revocation status from backup endpoint`);
        }
      }
      throw new Error(`can't fetch revocation status`);
    }
  }

  /**
   * Gets revocation status from rhs service.
   * @param {CredentialStatus} credentialStatus
   * @param {DID} issuerDID
   * @param {IssuerData} issuerData
   * @returns Promise<RevocationStatus>
   */
  private async getStatus(
    credentialStatus: CredentialStatus,
    issuerDID: DID,
    issuerData?: IssuerData
  ): Promise<RevocationStatus> {
    const issuerId = DID.idFromDID(issuerDID);

    let latestState: bigint;
    try {
      const latestStateInfo = await this._state.getLatestStateById(issuerId.bigInt());
      if (!latestStateInfo.state) {
        throw new Error('state contract returned empty state');
      }
      latestState = latestStateInfo.state;
    } catch (e) {
      const errMsg = (e as { reason: string })?.reason ?? (e as Error).message ?? (e as string);
      if (!errMsg.includes(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST)) {
        throw e;
      }
      const stateHex = this.extractState(credentialStatus.id);
      if (!stateHex) {
        return this.getRevocationStatusFromIssuerData(issuerDID, issuerData);
      }
      const currentStateBigInt = newHashFromHex(stateHex).bigInt();
      if (!isGenesisState(issuerDID, currentStateBigInt)) {
        throw new Error(
          `latest state not found and state prameter ${stateHex} is not genesis state`
        );
      }
      latestState = currentStateBigInt;
    }

    const rhsHost = credentialStatus.id.split('/node')[0];
    const hashedRevNonce = newHashFromBigInt(BigInt(credentialStatus.revocationNonce ?? 0));
    const hashedIssuerRoot = newHashFromBigInt(latestState);
    return await this.getRevocationStatusFromRHS(hashedRevNonce, hashedIssuerRoot, rhsHost);
  }

  /**
   * Extract revocation status from issuer data.
   * @param {DID} issuerDID
   * @param {IssuerData} issuerData
   */
  private getRevocationStatusFromIssuerData(
    issuerDID: DID,
    issuerData?: IssuerData
  ): RevocationStatus {
    if (!!issuerData && isIssuerGenesis(issuerDID.string(), issuerData.state.value)) {
      return {
        mtp: new Proof(),
        issuer: {
          state: issuerData.state.value,
          revocationTreeRoot: issuerData.state.revocationTreeRoot,
          rootOfRoots: issuerData.state.rootOfRoots,
          claimsTreeRoot: issuerData.state.claimsTreeRoot
        }
      };
    }
    throw new Error(`issuer data is empty`);
  }

  /**
   * Gets partial revocation status info from rhs service.
   *
   * @param {Hash} data - hash to fetch
   * @param {Hash} issuerRoot - issuer root which is a part of url
   * @param {string} rhsUrl - base URL for reverse hash service
   * @returns Promise<RevocationStatus>
   */
  private async getRevocationStatusFromRHS(
    data: Hash,
    issuerRoot: Hash,
    rhsUrl: string
  ): Promise<RevocationStatus> {
    if (!rhsUrl) throw new Error('HTTP reverse hash service URL is not specified');

    const resp = await fetch(`${rhsUrl}/node/${issuerRoot.hex()}`);
    const treeRoots = ((await resp.json()) as NodeHexResponse)?.node;
    if (treeRoots.children.length !== 3) {
      throw new Error('state should has tree children');
    }

    const s = issuerRoot.hex();
    const [cTR, rTR, roTR] = treeRoots.children;

    const rtrHashed = strMTHex(rTR);
    const nonRevProof = await this.rhsGenerateProof(rtrHashed, data, `${rhsUrl}/node`);

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

  async rhsGenerateProof(treeRoot: Hash, key: Hash, rhsUrl: string): Promise<Proof> {
    let exists = false;
    const siblings: Hash[] = [];
    let nodeAux: NodeAux;

    const mkProof = () => this.newProofFromData(exists, siblings, nodeAux);

    let nextKey = treeRoot;
    for (let depth = 0; depth < key.bytes.length * 8; depth++) {
      if (nextKey.bytes.every((i) => i === 0)) {
        return mkProof();
      }
      const data = await fetch(`${rhsUrl}/${nextKey.hex()}`);
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

  async newProofFromData(
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

  /**
   * Get state param from rhs url
   * @param {string} id
   * @returns string | null
   */
  private extractState(id: string): string | null {
    const u = new URL(id);
    return u.searchParams.get('state');
  }
}

/**
 * @deprecated The method should not be used. Use isGenesisState instead.
 * Checks if issuer did is created from given state is genesis
 *
 * @param {string} issuer - did (string)
 * @param {string} state  - hex state
 * @returns boolean
 */
export function isIssuerGenesis(issuer: string, state: string): boolean {
  const did = DID.parse(issuer);
  const id = DID.idFromDID(did);
  const { method, blockchain, networkId } = DID.decodePartsFromId(id);
  const arr = BytesHelper.hexToBytes(state);
  const stateBigInt = BytesHelper.bytesToInt(arr);
  const type = buildDIDType(method, blockchain, networkId);
  return isGenesisStateId(DID.idFromDID(did).bigInt(), stateBigInt, type);
}

/**
 * @deprecated The method should not be used. Use isGenesisStateId instead.
 * Checks if id is created from given state and type is genesis
 *
 * @param {bigint} id
 * @param {bigint} state
 * @param {Uint8Array} type
 * @returns boolean - returns if id is genesis
 */
export function isGenesisStateId(id: bigint, state: bigint, type: Uint8Array): boolean {
  const idFromState = Id.idGenesisFromIdenState(type, state);
  return id.toString() === idFromState.bigInt().toString();
}
