import { ZKProof } from '@iden3/js-jwz';

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
   * @param {number} chain_id - chain id
   * @param {Map<number, ZKProof>} requestIdProofs - request id - proof data map
   * @returns {Promise<Array<string>>} - array of transaction hashes
   */
  submitZKPResponse(
    address: string,
    chain_id: number,
    requestIdProofs: Map<number, ZKProof>
  ): Promise<Array<string>>;
}
