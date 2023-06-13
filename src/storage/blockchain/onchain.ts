import { RevocationStatus, Issuer } from './../../../src/verifiable';
import { BigNumber, ethers } from 'ethers';
import abi from './onchain-abi.json';
import {
  newHashFromBigInt,
  Proof,
  NodeAux,
  setBitBigEndian,
  ZERO_HASH
} from '@iden3/js-merkletree';

/**
 * OnChainIssuer is a class that allows to interact with the onchain contract
 * and build the revocation status.
 *
 * @export
 * @beta
 * @class OnChainIssuer
 */
export class OnChainIssuer {
  private readonly onchainContract: ethers.Contract;
  private readonly provider: ethers.providers.JsonRpcProvider;

  /**
   *
   * Creates an instance of OnChainIssuer.
   * @param {string} - onhcain contract address
   * @param {string} - rpc url to connect to the blockchain
   */
  constructor(contractAddress: string, rpcURL: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcURL);
    this.onchainContract = new ethers.Contract(contractAddress, abi, this.provider);
  }

  /**
   * Get revocation status by nonce from the onchain contract.
   *
   * @returns Promise<RevocationStatus>
   */
  public async getRevocationStatus(nonce: number): Promise<RevocationStatus> {
    const response = await this.onchainContract.getRevocationStatus(nonce);

    const issuer = OnChainIssuer.convertIssuerInfo(response.issuer);
    const mtp = OnChainIssuer.convertSmtProofToProof(response.mtp);

    return {
      issuer,
      mtp
    };
  }

  private static convertIssuerInfo(issuer: unknown): Issuer {
    return {
      state: newHashFromBigInt(BigNumber.from(issuer[0]).toBigInt()).hex(),
      claimsTreeRoot: newHashFromBigInt(BigNumber.from(issuer[1]).toBigInt()).hex(),
      revocationTreeRoot: newHashFromBigInt(BigNumber.from(issuer[2]).toBigInt()).hex(),
      rootOfRoots: newHashFromBigInt(BigNumber.from(issuer[3]).toBigInt()).hex()
    };
  }

  private static convertSmtProofToProof(mtp: {
    existence: boolean;
    auxIndex: bigint;
    auxValue: bigint;
    siblings: bigint[];
  }): Proof {
    const p = new Proof();
    p.existence = mtp.existence;
    if (p.existence) {
      p.nodeAux = {
        key: undefined,
        value: undefined
      } as NodeAux;
    } else {
      const auxIndex = BigInt(mtp.auxIndex.toString());
      const auxValue = BigInt(mtp.auxValue.toString());
      if (auxIndex !== 0n && auxValue !== 0n) {
        p.nodeAux = {
          key: newHashFromBigInt(auxIndex),
          value: newHashFromBigInt(auxValue)
        } as NodeAux;
      } else {
        p.nodeAux = {
          key: undefined,
          value: undefined
        } as NodeAux;
      }
    }

    const s = mtp.siblings?.map((s) => newHashFromBigInt(BigInt(s.toString())));

    p.siblings = [];
    p.depth = s.length;

    for (let lvl = 0; lvl < s.length; lvl++) {
      if (s[lvl].bigInt() !== BigInt(0)) {
        setBitBigEndian(p.notEmpties, lvl);
        p.siblings.push(s[lvl]);
      } else {
        p.siblings.push(ZERO_HASH);
      }
    }

    return p;
  }
}
