import { Signer } from 'ethers';
import { ZeroKnowledgeProofResponse } from '../../iden3comm';
import { EthConnectionConfig } from '../blockchain';

/**
 * Interface that defines methods for ZKP verifier
 *
 * @beta
 * @interface IZKPVerifier
 */
export interface IZKPVerifier {
  /**
   * Submit ZKP Responses to ZKPVerifier contract.
   * @public
   * @param {string} address - ZKPVerifier contract address
   * @param {Signer} ethSigner - tx signer
   * @param {EthConnectionConfig} ethConfig - ETH config
   * @param {ZeroKnowledgeProofResponse[]} zkProofResponses - zkProofResponses
   * @returns {Promise<Map<string, ZeroKnowledgeProofResponse>>} - map of transaction hash - ZeroKnowledgeProofResponse
   */
  submitZKPResponse(
    address: string,
    ethSigner: Signer,
    ethConfig: EthConnectionConfig,
    zkProofResponses: ZeroKnowledgeProofResponse[]
  ): Promise<Map<string, ZeroKnowledgeProofResponse>>;
}
