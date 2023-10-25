import { RevocationStatus, Issuer } from '../../verifiable';
import { BigNumber, ethers } from 'ethers';
import abi from './onchain-revocation-abi.json';
import { Proof, NodeAuxJSON, Hash } from '@iden3/js-merkletree';
import { EthConnectionConfig } from './state';

/**
 * OnChainRevocationStore is a class that allows to interact with the onchain contract
 * and build the revocation status.
 *
 * @public
 * @class OnChainIssuer
 */
export class OnChainRevocationStorage {
  private readonly onchainContract: ethers.Contract;
  private readonly provider: ethers.providers.JsonRpcProvider;

  /**
   *
   * Creates an instance of OnChainIssuer.
   * @public
   * @param {string} - onhcain contract address
   * @param {string} - rpc url to connect to the blockchain
   */

  constructor(config: EthConnectionConfig, contractAddress: string) {
    this.provider = new ethers.providers.JsonRpcProvider(config.url);
    this.onchainContract = new ethers.Contract(contractAddress, abi, this.provider);
  }

  /**
   * Get revocation status by issuerId, issuerState and nonce from the onchain.
   * @public
   * @returns Promise<RevocationStatus>
   */
  public async getRevocationStatusByIdAndState(
    issuerID: bigint,
    state: bigint,
    nonce: number
  ): Promise<RevocationStatus> {
    const response = await this.onchainContract.getRevocationStatusByIdAndState(
      issuerID,
      state,
      nonce
    );

    const issuer = OnChainRevocationStorage.convertIssuerInfo(response.issuer);
    const mtp = OnChainRevocationStorage.convertSmtProofToProof(response.mtp);

    return {
      issuer,
      mtp
    };
  }

  /**
   * Get revocation status by nonce from the onchain contract.
   * @public
   * @returns Promise<RevocationStatus>
   */
  public async getRevocationStatus(issuerID: bigint, nonce: number): Promise<RevocationStatus> {
    const response = await this.onchainContract.getRevocationStatus(issuerID, nonce);

    const issuer = OnChainRevocationStorage.convertIssuerInfo(response.issuer);
    const mtp = OnChainRevocationStorage.convertSmtProofToProof(response.mtp);

    return {
      issuer,
      mtp
    };
  }

  private static convertIssuerInfo(issuer: unknown[]): Issuer {
    return {
      state: Hash.fromBigInt(BigNumber.from(issuer[0]).toBigInt()).hex(),
      claimsTreeRoot: Hash.fromBigInt(BigNumber.from(issuer[1]).toBigInt()).hex(),
      revocationTreeRoot: Hash.fromBigInt(BigNumber.from(issuer[2]).toBigInt()).hex(),
      rootOfRoots: Hash.fromBigInt(BigNumber.from(issuer[3]).toBigInt()).hex()
    };
  }

  private static convertSmtProofToProof(mtp: {
    existence: boolean;
    auxIndex: bigint;
    auxValue: bigint;
    auxExistence: boolean;
    siblings: bigint[];
  }): Proof {
    let nodeAux: NodeAuxJSON | undefined = undefined;
    const siblings = mtp.siblings?.map((s) => s.toString());

    if (mtp.auxExistence) {
      const auxIndex = BigInt(mtp.auxIndex.toString());
      const auxValue = BigInt(mtp.auxValue.toString());
      nodeAux = {
        key: auxIndex.toString(),
        value: auxValue.toString()
      };
    }
    return Proof.fromJSON({
      existence: mtp.existence,
      nodeAux,
      siblings
    });
  }
}
