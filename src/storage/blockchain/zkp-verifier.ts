import abi from './zkp-verifier-abi.json';
import { ethers } from 'ethers';
import { EthConnectionConfig } from './state';
import { ZKProof } from '@iden3/js-jwz';
import { IZKPVerifier } from '../interfaces/zkp-verifier';

/**
 * ZKPVerifier is a class that allows to interact with the ZKPVerifier contract
 * and submitZKPResponse.
 *
 * @beta
 * @class ZKPVerifier
 */
export class ZKPVerifier implements IZKPVerifier {
  private readonly config: EthConnectionConfig;

  /**
   * Creates an instance of ZKPVerifier.
   * @public
   * @param {EthConnectionConfig} config - eth connection config
   */
  constructor(config: EthConnectionConfig) {
    this.config = config;
  }

  /**
   * Submit ZKP Responses to ZKPVerifier contract.
   * @public
   * @param {string} address - ZKPVerifier contract address
   * @param {number} chain_id - chain id
   * @param {Map<number, ZKProof>} requestIdProofs - request id - proof data map
   * @returns {Promise<Array<string>>} - array of transaction hashes
   */
  public async submitZKPResponse(
    address: string,
    chain_id: number,
    requestIdProofs: Map<number, ZKProof>
  ): Promise<Array<string>> {
    this.config.chainId = chain_id;

    const provider = new ethers.providers.JsonRpcProvider(this.config);
    const contract: ethers.Contract = new ethers.Contract(address, abi, provider);

    const txHashes = [];
    for (const requestProof of requestIdProofs) {
      const requestID = requestProof[0];
      const proofData = requestProof[1];
      const inputs = proofData.pub_signals;
      const a = proofData.proof.pi_a;
      const b = proofData.proof.pi_b;
      const c = proofData.proof.pi_c;
      const tx = await contract.submitZKPResponse([requestID, inputs, a, b, c]);
      const txnReceipt = await tx.wait();
      const status: number = txnReceipt.status;
      const txnHash: string = txnReceipt.transactionHash;

      if (status === 0) {
        throw new Error(`transaction: ${txnHash} failed to mined`);
      }
      txHashes.push(txnHash);
    }

    return txHashes;
  }
}
