import { buildDIDType, BytesHelper, DID, Id } from '@iden3/js-iden3-core';
import { newHashFromBigInt, Proof, ZERO_HASH, setBitBigEndian, testBit } from '@iden3/js-merkletree';
import { strMTHex } from '../../circuits';
import { VerifiableConstants, CredentialStatusType } from '../../verifiable/constants';
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
    constructor(hash = ZERO_HASH, children = []) {
        this.hash = hash;
        this.children = children;
    }
    /**
     * Determination of Node type
     * Can be: Leaf, Middle or State node
     *
     * @returns NodeType
     */
    nodeType() {
        if (this.children.length === 2) {
            return NodeType.Middle;
        }
        if (this.children.length === 3 &&
            this.children[2].hex() === newHashFromBigInt(BigInt(1)).hex()) {
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
    static fromHex(hexNode) {
        return new ProofNode(strMTHex(hexNode.hash), hexNode.children.map((ch) => strMTHex(ch)));
    }
}
var NodeType;
(function (NodeType) {
    NodeType[NodeType["Unknown"] = 0] = "Unknown";
    NodeType[NodeType["Middle"] = 1] = "Middle";
    NodeType[NodeType["Leaf"] = 2] = "Leaf";
    NodeType[NodeType["State"] = 3] = "State";
})(NodeType || (NodeType = {}));
/**
 * RHSResolver is a class that allows to interact with the RHS service to get revocation status.
 *
 * @public
 * @class RHSResolver
 */
export class RHSResolver {
    constructor(_state) {
        this._state = _state;
    }
    /**
     * resolve is a method to resolve a credential status from the blockchain.
     *
     * @public
     * @param {CredentialStatus} credentialStatus -  credential status to resolve
     * @param {CredentialStatusResolveOptions} credentialStatusResolveOptions -  options for resolver
     * @returns `{Promise<RevocationStatus>}`
     */
    async resolve(credentialStatus, credentialStatusResolveOptions) {
        if (!credentialStatusResolveOptions?.issuerDID) {
            throw new Error('IssuerDID is not set in options');
        }
        try {
            return await this.getStatus(credentialStatus, credentialStatusResolveOptions.issuerDID);
        }
        catch (e) {
            const errMsg = e?.reason ?? e.message ?? e;
            if (!!credentialStatusResolveOptions.issuerData &&
                errMsg.includes(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST) &&
                isIssuerGenesis(credentialStatusResolveOptions.issuerDID.string(), credentialStatusResolveOptions.issuerData.state.value)) {
                return {
                    mtp: new Proof(),
                    issuer: {
                        state: credentialStatusResolveOptions.issuerData.state.value,
                        revocationTreeRoot: credentialStatusResolveOptions.issuerData.state.revocationTreeRoot,
                        rootOfRoots: credentialStatusResolveOptions.issuerData.state.rootOfRoots,
                        claimsTreeRoot: credentialStatusResolveOptions.issuerData.state.claimsTreeRoot
                    }
                };
            }
            if (credentialStatus?.statusIssuer?.type === CredentialStatusType.SparseMerkleTreeProof) {
                try {
                    return await (await fetch(credentialStatus.id)).json();
                }
                catch (e) {
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
     * @returns Promise<RevocationStatus>
     */
    async getStatus(credentialStatus, issuerDID) {
        const id = DID.idFromDID(issuerDID);
        const latestStateInfo = await this._state.getLatestStateById(id.bigInt());
        const hashedRevNonce = newHashFromBigInt(BigInt(credentialStatus.revocationNonce ?? 0));
        const hashedIssuerRoot = newHashFromBigInt(BigInt(latestStateInfo?.state ?? 0));
        return await this.getRevocationStatusFromRHS(hashedRevNonce, hashedIssuerRoot, credentialStatus.id);
    }
    /**
     * Gets partial revocation status info from rhs service.
     *
     * @param {Hash} data - hash to fetch
     * @param {Hash} issuerRoot - issuer root which is a part of url
     * @param {string} rhsUrl - base URL for reverse hash service
     * @returns Promise<RevocationStatus>
     */
    async getRevocationStatusFromRHS(data, issuerRoot, rhsUrl) {
        if (!rhsUrl)
            throw new Error('HTTP reverse hash service URL is not specified');
        const resp = await fetch(`${rhsUrl}/node/${issuerRoot.hex()}`);
        const treeRoots = (await resp.json())?.node;
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
    async rhsGenerateProof(treeRoot, key, rhsUrl) {
        let exists = false;
        const siblings = [];
        let nodeAux;
        const mkProof = () => this.newProofFromData(exists, siblings, nodeAux);
        let nextKey = treeRoot;
        for (let depth = 0; depth < key.bytes.length * 8; depth++) {
            if (nextKey.bytes.every((i) => i === 0)) {
                return mkProof();
            }
            const data = await fetch(`${rhsUrl}/${nextKey.hex()}`);
            const resp = (await data.json())?.node;
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
                    }
                    else {
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
    async newProofFromData(existence, allSiblings, nodeAux) {
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
}
/**
 * Checks if issuer did is created from given state is genesis
 *
 * @param {string} issuer - did (string)
 * @param {string} state  - hex state
 * @returns boolean
 */
export function isIssuerGenesis(issuer, state) {
    const did = DID.parse(issuer);
    const id = DID.idFromDID(did);
    const { method, blockchain, networkId } = DID.decodePartsFromId(id);
    const arr = BytesHelper.hexToBytes(state);
    const stateBigInt = BytesHelper.bytesToInt(arr);
    const type = buildDIDType(method, blockchain, networkId);
    return isGenesisStateId(DID.idFromDID(did).bigInt(), stateBigInt, type);
}
/**
 * Checks if id is created from given state and type is genesis
 *
 * @param {bigint} id
 * @param {bigint} state
 * @param {Uint8Array} type
 * @returns boolean - returns if id is genesis
 */
export function isGenesisStateId(id, state, type) {
    const idFromState = Id.idGenesisFromIdenState(type, state);
    return id.toString() === idFromState.bigInt().toString();
}
//# sourceMappingURL=reverse-sparse-merkle-tree.js.map