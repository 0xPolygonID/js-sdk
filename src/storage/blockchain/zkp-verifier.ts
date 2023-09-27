import { ethers } from 'ethers';
import abi from './onchain-revocation-abi.json';
import { defaultEthConnectionConfig } from './state';
import { ContractInvokeRequest, IContractRequestHandler } from '../../iden3comm';
import { DID } from '@iden3/js-iden3-core';

/**
 * ZKPVerifier is a class that allows to interact with the ZKPVerifier contract
 * and submitZKPResponse.
 *
 * @public
 * @class ZKPVerifier
 */
export class ZKPVerifier {
  private readonly contractRequestHandler: IContractRequestHandler;

  /**
   *
   * Creates an instance of ZKPVerifier.
   * @public
   * @param {IContractRequestHandler} - contract request handler
   */

  constructor(contractRequestHandler: IContractRequestHandler) {
    this.contractRequestHandler = contractRequestHandler;
  }

  /**
   * Submit ZKP Response to ZKPVerifier contract.
   * @public
   * @returns Promise<string>
   */
  public async submitZKPResponse(
    requestID: number,
    request: ContractInvokeRequest,
    did: DID,
  ): Promise<void> {
    const ciResponse = await this.contractRequestHandler.handleContractInvokeRequest(did, request);
    const txData = ciResponse.response.body.transaction_data;

    const config = defaultEthConnectionConfig;
    config.chainId = txData.chain_id;

    const provider = new ethers.providers.JsonRpcProvider(config);
    const contract: ethers.Contract = new ethers.Contract(txData.contract_address, abi, provider);

    for (const proofRes of ciResponse.response.body.scope) {
      const inputs = proofRes.pub_signals;
      const a = proofRes.proof.pi_a;
      const b = proofRes.proof.pi_b;
      const c = proofRes.proof.pi_c;
      const response = await contract.submitZKPResponse([requestID, inputs, a, b, c]);
    }
  }
}
