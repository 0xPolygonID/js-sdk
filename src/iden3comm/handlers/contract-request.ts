import { CircuitId } from '../../circuits/models';
import { IProofService } from '../../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import { IPackageManager, ZeroKnowledgeProofResponse } from '../types';

import { RevocationStatus, W3CCredential } from '../../verifiable';
import { ContractInvokeRequest } from '../types/protocol/contract-request';
import { DID, ChainIds } from '@iden3/js-iden3-core';
import { IOnChainZKPVerifier } from '../../storage';
import { Signer } from 'ethers';
import { swapEndianness } from '@iden3/js-merkletree';
import { Hex } from '@iden3/js-crypto';
import { findCombinedQueries } from './utils';

/**
 * Interface that allows the processing of the contract request
 *
 * @beta
 * @interface IContractRequestHandler
 */
export interface IContractRequestHandler {
  /**
   * unpacks contract invoker request
   * @beta
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<ContractInvokeRequest>`
   */
  parseContractInvokeRequest(request: Uint8Array): Promise<ContractInvokeRequest>;

  /**
   * handle contract invoker request
   * @beta
   * @param {did} did  - sender DID
   * @param {Uint8Array} request - raw byte message
   * @param {ContractInvokeHandlerOptions} opts - handler options
   * @returns {Map<string, ZeroKnowledgeProofResponse>}` -  map of transaction hash - ZeroKnowledgeProofResponse
   */
  handleContractInvokeRequest(
    did: DID,
    request: Uint8Array,
    opts?: ContractInvokeHandlerOptions
  ): Promise<Map<string, ZeroKnowledgeProofResponse>>;
}

/** ContractInvokeHandlerOptions represents contract invoke handler options */
export type ContractInvokeHandlerOptions = {
  ethSigner: Signer;
  challenge?: bigint;
};

/**
 *
 * Allows to process ContractInvokeRequest protocol message
 *
 * @beta

 * @class ContractRequestHandler
 * @implements implements IContractRequestHandler interface
 */
export class ContractRequestHandler implements IContractRequestHandler {
  private readonly _allowedCircuits = [
    CircuitId.AtomicQueryMTPV2OnChain,
    CircuitId.AtomicQuerySigV2OnChain,
    CircuitId.AtomicQueryV3OnChain
  ];

  /**
   * Creates an instance of ContractRequestHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IProofService} _proofService -  proof service to verify zk proofs
   * @param {IOnChainZKPVerifier} _zkpVerifier - zkp verifier to submit response
   *
   */

  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _proofService: IProofService,
    private readonly _zkpVerifier: IOnChainZKPVerifier
  ) {}

  /**
   * unpacks contract-invoke request
   * @beta
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
   * @beta
   * @param {did} did  - sender DID
   * @param {ContractInvokeRequest} request  - contract invoke request
   * @param {ContractInvokeHandlerOptions} opts - handler options
   * @returns {Map<string, ZeroKnowledgeProofResponse>}` - map of transaction hash - ZeroKnowledgeProofResponse
   */
  async handleContractInvokeRequest(
    did: DID,
    request: Uint8Array,
    opts: ContractInvokeHandlerOptions
  ): Promise<Map<string, ZeroKnowledgeProofResponse>> {
    const ciRequest = await this.parseContractInvokeRequest(request);

    if (ciRequest.type !== PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid message type for contract invoke request');
    }

    if (!opts.ethSigner) {
      throw new Error("Can't sign transaction. Provide Signer in options.");
    }

    const zkRequests = [];
    const { contract_address, chain_id } = ciRequest.body.transaction_data;
    const networkFlag = Object.keys(ChainIds).find((key) => ChainIds[key] === chain_id);

    if (!networkFlag) {
      throw new Error(`Invalid chain id ${chain_id}`);
    }

    const requestScope = ciRequest.body.scope;
    const combinedQueries = findCombinedQueries(requestScope);
    const groupedCredentialsCache = new Map<
      number,
      { cred: W3CCredential; revStatus?: RevocationStatus }
    >();

    for (const proofReq of requestScope) {
      if (!this._allowedCircuits.includes(proofReq.circuitId as CircuitId)) {
        throw new Error(
          `Can't handle circuit ${proofReq.circuitId}. Only onchain circuits are allowed.`
        );
      }
      const query = proofReq.query;
      const groupId = query.groupId as number | undefined;
      const combinedQueryData = combinedQueries.get(groupId as number);

      if (groupId) {
        if (!combinedQueryData) {
          throw new Error(`Invalid group id ${query.groupId}`);
        }
        const combinedQuery = combinedQueryData.query;

        if (!groupedCredentialsCache.has(groupId)) {
          const credWithRevStatus = await this._proofService.findCredentialByProofQuery(
            did,
            combinedQueryData.query
          );
          if (!credWithRevStatus.cred) {
            throw new Error(`Credential not found for query ${JSON.stringify(combinedQuery)}`);
          }

          groupedCredentialsCache.set(groupId, credWithRevStatus);
        }
      }

      const credWithRevStatus = groupedCredentialsCache.get(groupId as number);

      const verifier = this.verifierFromContractAddr(contract_address);

      const zkpRes: ZeroKnowledgeProofResponse = await this._proofService.generateProof(
        proofReq,
        did,
        {
          verifier,
          skipRevocation: Boolean(query.skipClaimRevocationCheck),
          challenge: opts.challenge,
          credential: credWithRevStatus?.cred,
          credentialRevocationStatus: credWithRevStatus?.revStatus,
          linkNonce: combinedQueryData?.linkNonce ? BigInt(combinedQueryData.linkNonce) : undefined
        }
      );

      zkRequests.push(zkpRes);
    }

    return this._zkpVerifier.submitZKPResponse(
      opts.ethSigner,
      ciRequest.body.transaction_data,
      zkRequests
    );
  }

  private verifierFromContractAddr(address: string): bigint {
    return BigInt(
      '0x' + Hex.encodeString(swapEndianness(Hex.decodeString(address.replace('0x', ''))))
    );
  }
}
