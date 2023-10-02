import abi from './zkp-verifier-abi.json';
import { ethers, Signer } from 'ethers';
import { EthConnectionConfig } from './state';
import { IZKPVerifier } from '../interfaces/zkp-verifier';
import { ZeroKnowledgeProofResponse } from '../../iden3comm';

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
   * @param {Signer} ethSigner - tx signer
   * @param {ZeroKnowledgeProofResponse[]} zkProofResponses - zkProofResponses
   * @returns {Promise<Map<string, ZeroKnowledgeProofResponse>>} - map of transaction hash - ZeroKnowledgeProofResponse
   */
  public async submitZKPResponse(
    address: string,
    chain_id: number,
    ethSigner: Signer,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<string, ZeroKnowledgeProofResponse>> {
    this.config.chainId = chain_id;

    const provider = new ethers.providers.JsonRpcProvider(this.config);
    const verifierContract: ethers.Contract = new ethers.Contract(address, abi, provider);
    const contract = verifierContract.connect(ethSigner);

    const response = new Map<string, ZeroKnowledgeProofResponse>();
    for (const zkProof of zkProofResponses) {
      const requestID = zkProof.id;
      const inputs = zkProof.pub_signals;
      const a = zkProof.proof.pi_a;
      const b = zkProof.proof.pi_b;
      const c = zkProof.proof.pi_c;
      const tx = await contract.submitZKPResponse([requestID, inputs, a, b, c]);
      const txnReceipt = await tx.wait();
      const status: number = txnReceipt.status;
      const txnHash: string = txnReceipt.transactionHash;

      if (status === 0) {
        throw new Error(`transaction: ${txnHash} failed to mined`);
      }
      response.set(txnHash, zkProof);
    }

    return response;
  }
}
