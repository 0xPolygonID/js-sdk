import abi from './zkp-verifier-abi.json';
import { ethers, Signer } from 'ethers';
import { EthConnectionConfig } from './state';
import { IOnChainZKPVerifier } from '../interfaces/onchain-zkp-verifier';
import { ZeroKnowledgeProofResponse } from '../../iden3comm';

/**
 * OnChainZKPVerifier is a class that allows to interact with the OnChainZKPVerifier contract
 * and submitZKPResponse.
 *
 * @beta
 * @class OnChainZKPVerifier
 */
export class OnChainZKPVerifier implements IOnChainZKPVerifier {
  /**
   *
   * Creates an instance of OnChainZKPVerifier.
   * @beta
   * @param {EthConnectionConfig[]} - array of ETH configs
   */

  constructor(private readonly _configs: EthConnectionConfig[]) {}

  /**
   * Submit ZKP Responses to OnChainZKPVerifier contract.
   * @beta
   * @param {string} address - OnChainZKPVerifier contract address
   * @param {Signer} ethSigner - tx signer
   * @param {number} chainId - chain Id
   * @param {ZeroKnowledgeProofResponse[]} zkProofResponses - zkProofResponses
   * @returns {Promise<Map<string, ZeroKnowledgeProofResponse>>} - map of transaction hash - ZeroKnowledgeProofResponse
   */
  public async submitZKPResponse(
    address: string,
    ethSigner: Signer,
    chainId: number,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<string, ZeroKnowledgeProofResponse>> {
    const chainConfig = this._configs.find((i) => i.chainId == chainId);
    if (!chainConfig) {
      throw new Error(`config for chain id ${chainId} was not found`);
    }
    const provider = new ethers.providers.JsonRpcProvider(chainConfig);
    const verifierContract: ethers.Contract = new ethers.Contract(address, abi, provider);
    ethSigner = ethSigner.connect(provider);
    const contract = verifierContract.connect(ethSigner);

    const response = new Map<string, ZeroKnowledgeProofResponse>();
    for (const zkProof of zkProofResponses) {
      const requestID = zkProof.id;
      const inputs = zkProof.pub_signals;

      const payload = [
        requestID,
        inputs,
        zkProof.proof.pi_a.slice(0, 2),
        [
          [zkProof.proof.pi_b[0][1], zkProof.proof.pi_b[0][0]],
          [zkProof.proof.pi_b[1][1], zkProof.proof.pi_b[1][0]]
        ],
        zkProof.proof.pi_c.slice(0, 2)
      ];

      const tx = await contract.submitZKPResponse(...payload);
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
