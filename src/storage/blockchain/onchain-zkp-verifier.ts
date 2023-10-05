import abi from './zkp-verifier-abi.json';
import { ethers, Signer } from 'ethers';
import { EthConnectionConfig } from './state';
import { IOnChainZKPVerifier } from '../interfaces/onchain-zkp-verifier';
import { ContractInvokeTransactionData, ZeroKnowledgeProofResponse } from '../../iden3comm';

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
   * @param {Signer} ethSigner - tx signer
   * @param {txData} ContractInvokeTransactionData - transaction data
   * @param {ZeroKnowledgeProofResponse[]} zkProofResponses - zkProofResponses
   * @returns {Promise<Map<string, ZeroKnowledgeProofResponse>>} - map of transaction hash - ZeroKnowledgeProofResponse
   */
  public async submitZKPResponse(
    ethSigner: Signer,
    txData: ContractInvokeTransactionData,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<string, ZeroKnowledgeProofResponse>> {
    const chainConfig = this._configs.find((i) => i.chainId == txData.chain_id);
    if (!chainConfig) {
      throw new Error(`config for chain id ${txData.chain_id} was not found`);
    }
    if (txData.method_id !== '0xb68967e2') {
      throw new Error(`sumbit doesn't implement requested method id`);
    }
    const provider = new ethers.providers.JsonRpcProvider(chainConfig);
    const verifierContract: ethers.Contract = new ethers.Contract(
      txData.contract_address,
      abi,
      provider
    );
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
