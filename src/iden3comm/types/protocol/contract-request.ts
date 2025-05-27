import { GlobalStateUpdate, IdentityStateUpdate } from '../../../storage/entities/state';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { BasicMessage } from '../packer';
import {
  DIDDocument,
  ZeroKnowledgeProofAuthResponse,
  ZeroKnowledgeProofRequest,
  ZeroKnowledgeProofResponse
} from './auth';
import { DID } from '@iden3/js-iden3-core';

/** ContractInvokeRequest represents structure of contract invoke request object */
export type ContractInvokeRequest = BasicMessage & {
  body: ContractInvokeRequestBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE;
};

/** ContractInvokeRequestBody represents structure of contract invoke request body object */
export type ContractInvokeRequestBody = {
  reason?: string;
  transaction_data: ContractInvokeTransactionData;
  scope: Array<ZeroKnowledgeProofRequest>;
  did_doc?: DIDDocument;
  accept?: string[];
};

/** ContractInvokeResponse represents structure of contract invoke response object */
export type ContractInvokeResponse = BasicMessage & {
  body: ContractInvokeResponseBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_RESPONSE_MESSAGE_TYPE;
};

/** ContractInvokeResponseBody represents structure of contract invoke response body object */
export type ContractInvokeResponseBody = {
  scope: Array<OnChainZeroKnowledgeProofResponse>;
  transaction_data: ContractInvokeTransactionData;
  did_doc?: DIDDocument;
  crossChainProof?: CrossChainProof;
  authProof?: AuthProof;
};

/** OnChainZeroKnowledgeProofResponse represents structure of onchain zero knowledge proof response */
export type OnChainZeroKnowledgeProofResponse = ZeroKnowledgeProofResponse & {
  txHash?: string;
};

/** ContractInvokeTransactionData represents structure of contract invoke transaction data object */
export type ContractInvokeTransactionData = {
  contract_address: string;
  method_id: string;
  chain_id: number;
  network?: string;
};

export type AuthProofEthIdentity = {
  userDid: DID;
};
export type AuthProofZKP = {
  zkp: ZeroKnowledgeProofAuthResponse;
};

/** AuthProofResponse represents structure of zkp response */
export type AuthProof = {
  authMethod: AuthMethod;
} & (AuthProofEthIdentity | AuthProofZKP);

export type CrossChainProof = {
  globalStateProofs: GlobalStateUpdate[];
  identityStateProofs: IdentityStateUpdate[];
};

export enum AuthMethod {
  AUTHV2 = 'authV2',
  ETH_IDENTITY = 'ethIdentity'
}
