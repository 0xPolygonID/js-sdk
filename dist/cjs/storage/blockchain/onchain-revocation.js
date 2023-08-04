"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnChainRevocationStorage = void 0;
const ethers_1 = require("ethers");
const onchain_revocation_abi_json_1 = __importDefault(require("./onchain-revocation-abi.json"));
const js_merkletree_1 = require("@iden3/js-merkletree");
/**
 * OnChainRevocationStore is a class that allows to interact with the onchain contract
 * and build the revocation status.
 *
 * @public
 * @class OnChainIssuer
 */
class OnChainRevocationStorage {
    /**
     *
     * Creates an instance of OnChainIssuer.
     * @public
     * @param {string} - onhcain contract address
     * @param {string} - rpc url to connect to the blockchain
     */
    constructor(config, contractAddress) {
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(config.url);
        this.onchainContract = new ethers_1.ethers.Contract(contractAddress, onchain_revocation_abi_json_1.default, this.provider);
    }
    /**
     * Get revocation status by nonce from the onchain contract.
     * @public
     * @returns Promise<RevocationStatus>
     */
    async getRevocationStatus(issuerID, nonce) {
        const response = await this.onchainContract.getRevocationStatus(issuerID, nonce);
        const issuer = OnChainRevocationStorage.convertIssuerInfo(response.issuer);
        const mtp = OnChainRevocationStorage.convertSmtProofToProof(response.mtp);
        return {
            issuer,
            mtp
        };
    }
    static convertIssuerInfo(issuer) {
        return {
            state: (0, js_merkletree_1.newHashFromBigInt)(ethers_1.BigNumber.from(issuer[0]).toBigInt()).hex(),
            claimsTreeRoot: (0, js_merkletree_1.newHashFromBigInt)(ethers_1.BigNumber.from(issuer[1]).toBigInt()).hex(),
            revocationTreeRoot: (0, js_merkletree_1.newHashFromBigInt)(ethers_1.BigNumber.from(issuer[2]).toBigInt()).hex(),
            rootOfRoots: (0, js_merkletree_1.newHashFromBigInt)(ethers_1.BigNumber.from(issuer[3]).toBigInt()).hex()
        };
    }
    static convertSmtProofToProof(mtp) {
        const p = new js_merkletree_1.Proof();
        p.existence = mtp.existence;
        if (p.existence) {
            p.nodeAux = {};
        }
        else {
            if (mtp.auxExistence) {
                const auxIndex = BigInt(mtp.auxIndex.toString());
                const auxValue = BigInt(mtp.auxValue.toString());
                p.nodeAux = {
                    key: (0, js_merkletree_1.newHashFromBigInt)(auxIndex),
                    value: (0, js_merkletree_1.newHashFromBigInt)(auxValue)
                };
            }
            else {
                p.nodeAux = {};
            }
        }
        const s = mtp.siblings?.map((s) => (0, js_merkletree_1.newHashFromBigInt)(BigInt(s.toString())));
        p.siblings = [];
        p.depth = s.length;
        for (let lvl = 0; lvl < s.length; lvl++) {
            if (s[lvl].bigInt() !== BigInt(0)) {
                (0, js_merkletree_1.setBitBigEndian)(p.notEmpties, lvl);
                p.siblings.push(s[lvl]);
            }
            else {
                p.siblings.push(js_merkletree_1.ZERO_HASH);
            }
        }
        return p;
    }
}
exports.OnChainRevocationStorage = OnChainRevocationStorage;
//# sourceMappingURL=onchain-revocation.js.map