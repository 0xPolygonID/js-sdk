import { CircuitId } from '../../circuits/models';
import { IProofService } from '../../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import { ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from '../types';

import * as uuid from 'uuid';
import { ProofQuery } from '../../verifiable';
import { ContractInvokeRequest, ContractInvokeResponse } from '../types/protocol/contract-request';
import { DID } from '@iden3/js-iden3-core';

/**
 * Interface that allows the processing of the contract request
 *
 * @public
 * @interface IContractRequestHandler
 */
export interface IContractRequestHandler {
  /**
   * handle contract invoker request
   * @public
   * @param {did} did  - sender DID
   * @param {ContractInvokeRequest} request  - contract invoke request
   * @returns `Promise<{
    response: ContractInvokeResponse;
  }>`
   */
  handleContractInvokeRequest(
    did: DID,
    request: ContractInvokeRequest
  ): Promise<{
    response: ContractInvokeResponse;
  }>;
}
/**
 *
 * Allows to process ContractInvokeRequest protocol message
 *
 * @public

 * @class ContractRequestHandler
 * @implements implements IContractRequestHandler interface
 */
export class ContractRequestHandler implements IContractRequestHandler {
  /**
   * Creates an instance of ContractRequestHandler.
   * @param {IProofService} _proofService -  proof service to verify zk proofs
   *
   */
  constructor(private readonly _proofService: IProofService) {}

  /**
   * handle contract invoker request
   * @public
   * @param {did} did  - sender DID
   * @param {ContractInvokeRequest} request  - contract invoke request
   * @returns `Promise<{
    response: ContractInvokeResponse;
  }>`
   */
  async handleContractInvokeRequest(
    did: DID,
    request: ContractInvokeRequest
  ): Promise<{
    response: ContractInvokeResponse;
  }> {
    if (request.type !== PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid message type for contract invoke request');
    }

    const guid = uuid.v4();

    const ciResponse: ContractInvokeResponse = {
      id: guid,
      typ: request.typ,
      type: PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE,
      thid: request.thid ?? guid,
      body: {
        transaction_data: request.body.transaction_data,
        scope: []
      }
    };

    for (const proofReq of request.body.scope) {
      const zkpReq: ZeroKnowledgeProofRequest = {
        id: proofReq.id,
        circuitId: proofReq.circuitId as CircuitId,
        query: proofReq.query
      };

      const query = proofReq.query as unknown as ProofQuery;

      const zkpRes: ZeroKnowledgeProofResponse = await this._proofService.generateProof(
        zkpReq,
        did,
        {
          skipRevocation: query.skipClaimRevocationCheck ?? false
        }
      );

      ciResponse.body.scope.push(zkpRes);
    }

    return { response: ciResponse };
  }
}
