import { BigNumber, ethers } from 'ethers';
import abi from './onchain-revocation-abi.json';
import { newHashFromBigInt, Proof, setBitBigEndian, ZERO_HASH } from '@iden3/js-merkletree';
/**
 * OnChainRevocationStore is a class that allows to interact with the onchain contract
 * and build the revocation status.
 *
 * @public
 * @class OnChainIssuer
 */
export class OnChainRevocationStorage {
    /**
     *
     * Creates an instance of OnChainIssuer.
     * @public
     * @param {string} - onhcain contract address
     * @param {string} - rpc url to connect to the blockchain
     */
    constructor(config, contractAddress) {
        this.provider = new ethers.providers.JsonRpcProvider(config.url);
        this.onchainContract = new ethers.Contract(contractAddress, abi, this.provider);
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
            state: newHashFromBigInt(BigNumber.from(issuer[0]).toBigInt()).hex(),
            claimsTreeRoot: newHashFromBigInt(BigNumber.from(issuer[1]).toBigInt()).hex(),
            revocationTreeRoot: newHashFromBigInt(BigNumber.from(issuer[2]).toBigInt()).hex(),
            rootOfRoots: newHashFromBigInt(BigNumber.from(issuer[3]).toBigInt()).hex()
        };
    }
    static convertSmtProofToProof(mtp) {
        const p = new Proof();
        p.existence = mtp.existence;
        if (p.existence) {
            p.nodeAux = {};
        }
        else {
            if (mtp.auxExistence) {
                const auxIndex = BigInt(mtp.auxIndex.toString());
                const auxValue = BigInt(mtp.auxValue.toString());
                p.nodeAux = {
                    key: newHashFromBigInt(auxIndex),
                    value: newHashFromBigInt(auxValue)
                };
            }
            else {
                p.nodeAux = {};
            }
        }
        const s = mtp.siblings?.map((s) => newHashFromBigInt(BigInt(s.toString())));
        p.siblings = [];
        p.depth = s.length;
        for (let lvl = 0; lvl < s.length; lvl++) {
            if (s[lvl].bigInt() !== BigInt(0)) {
                setBitBigEndian(p.notEmpties, lvl);
                p.siblings.push(s[lvl]);
            }
            else {
                p.siblings.push(ZERO_HASH);
            }
        }
        return p;
    }
}
//# sourceMappingURL=onchain-revocation.js.map