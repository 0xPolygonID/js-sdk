import { CircuitId } from '../../circuits/models';
import { IProofService } from '../../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import { IPackageManager, ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from '../types';

import { ProofQuery } from '../../verifiable';
import {
  ContractInvokeHandlerOptions,
  ContractInvokeRequest
} from '../types/protocol/contract-request';
import { DID } from '@iden3/js-iden3-core';
import { ZKProof } from '@iden3/js-jwz';
import { IZKPVerifier } from '../../storage';

/**
 * Interface that allows the processing of the contract request
 *
 * @public
 * @interface IContractRequestHandler
 */
export interface IContractRequestHandler {
  /**
   * unpacks contract invoker request
   * @public
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<ContractInvokeRequest>`
   */
  parseContractInvokeRequest(request: Uint8Array): Promise<ContractInvokeRequest>;

  /**
   * handle contract invoker request
   * @public
   * @param {did} did  - sender DID
   * @param {Uint8Array} request - raw byte message
   * @param {ContractInvokeHandlerOptions} opts - handler options
   * @returns {Array<string>}` - array of transaction hashes
   */
  handleContractInvokeRequest(
    did: DID,
    request: Uint8Array,
    opts?: ContractInvokeHandlerOptions
  ): Promise<Array<string>>;
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
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IProofService} _proofService -  proof service to verify zk proofs
   * @param {IZKPVerifier} _zkpVerifier - zkp verifier to submit response
   *
   */

  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _proofService: IProofService,
    private readonly _zkpVerifier: IZKPVerifier
  ) {}

  /**
   * unpacks contract-request request
   * @public
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<ContractInvokeRequest>`
   */
  async parseContractInvokeRequest(request: Uint8Array): Promise<ContractInvokeRequest> {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const ciRequest = message as unknown as ContractInvokeRequest;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    return ciRequest;
  }

  /**
   * handle contract invoker request
   * @public
   * @param {did} did  - sender DID
   * @param {ContractInvokeRequest} request  - contract invoke request
   * @param {ContractInvokeHandlerOptions} opts - handler options
   * @returns {Array<string>}` - array of transaction hashes
   */
  async handleContractInvokeRequest(
    did: DID,
    request: Uint8Array,
    opts?: ContractInvokeHandlerOptions //eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<Array<string>> {
    const ciRequest = await this.parseContractInvokeRequest(request);

    if (ciRequest.type !== PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid message type for contract invoke request');
    }

    const reqIdProofMap = new Map<number, ZKProof>();
    for (const proofReq of ciRequest.body.scope) {
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

      reqIdProofMap.set(proofReq.id, zkpRes as ZKProof);
    }

    const txData = ciRequest.body.transaction_data;

    return this._zkpVerifier.submitZKPResponse(
      txData.contract_address,
      txData.chain_id,
      reqIdProofMap
    );
  }
}
