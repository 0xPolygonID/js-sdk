import { JsonRpcProvider, Signer, Contract, TransactionRequest } from 'ethers';
import { EthConnectionConfig } from './state';
import { IOnChainZKPVerifier } from '../interfaces/onchain-zkp-verifier';
import { ContractInvokeTransactionData, ZeroKnowledgeProofResponse } from '../../iden3comm';
import abi from './abi/ZkpVerifier.json';
import { ITransactionService, TransactionService } from '../../blockchain';

/**
 * OnChainZKPVerifier is a class that allows to interact with the OnChainZKPVerifier contract
 * and submitZKPResponse.
 *
 * @beta
 * @class OnChainZKPVerifier
 */
export class OnChainZKPVerifier implements IOnChainZKPVerifier {
  /**
   * solidity identifier for function signature:
   * function submitZKPResponse(uint64 requestId, uint256[] calldata inputs,
   * uint256[2] calldata a, uint256[2][2] calldata b, uint256[2] calldata c) public
   */
  private readonly _supportedMethodId = 'b68967e2';
  private readonly _transactionService: ITransactionService;
  /**
   *
   * Creates an instance of OnChainZKPVerifier.
   * @beta
   * @param {EthConnectionConfig[]} - array of ETH configs
   */

  constructor(private readonly _configs: EthConnectionConfig[]) {
    this._transactionService = new TransactionService(_configs);
  }

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
    if (txData.method_id.replace('0x', '') !== this._supportedMethodId) {
      throw new Error(
        `submit doesn't implement requested method id. Only '0x${this._supportedMethodId}' is supported.`
      );
    }
    const provider = new JsonRpcProvider(chainConfig.url, chainConfig.chainId);
    const verifierContract = new Contract(txData.contract_address, abi, provider);
    ethSigner = ethSigner.connect(provider);
    const contract = verifierContract.connect(ethSigner) as Contract;

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

      const feeData = await provider.getFeeData();
      const maxFeePerGas = chainConfig.maxFeePerGas
        ? BigInt(chainConfig.maxFeePerGas)
        : feeData.maxFeePerGas;
      const maxPriorityFeePerGas = chainConfig.maxPriorityFeePerGas
        ? BigInt(chainConfig.maxPriorityFeePerGas)
        : feeData.maxPriorityFeePerGas;

      const gasLimit = await contract.submitZKPResponse.estimateGas(...payload);
      const txData = await contract.submitZKPResponse.populateTransaction(...payload);

      const request: TransactionRequest = {
        to: txData.to,
        data: txData.data,
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas
      };

      const { txnHash } = await this._transactionService.sendTransactionRequest(ethSigner, request);
      response.set(txnHash, zkProof);
    }

    return response;
  }
}
