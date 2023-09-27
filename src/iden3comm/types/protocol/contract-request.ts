import { ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from './auth';

/** ContractInvokeRequest represents structure of contract invoke request object */
export type ContractInvokeRequest = {
  id: string;
  typ: string;
  type: string;
  thid: string;
  body: ContractInvokeRequestBody;
};

/** ContractInvokeRequestBody represents structure of contract invoke request body object */
export type ContractInvokeRequestBody = {
  reason: string;
  transaction_data: ContractInvokeTransactionData;
  scope: Array<ZeroKnowledgeProofRequest>;
};

/** ContractInvokeTransactionData represents structure of contract invoke transaction data object */
export type ContractInvokeTransactionData = {
  contract_address: string;
  method_id: string;
  chain_id: number;
  network?: string;
};

/** ContractInvokeResponse represents structure of contract invoke response object */
export type ContractInvokeResponse = {
  id: string;
  typ: string;
  type: string;
  thid: string;
  body: ContractInvokeResponseBody;
};

/** ContractInvokeResponseBody represents structure of contract invoke response body object */
export type ContractInvokeResponseBody = {
  scope: Array<ZeroKnowledgeProofResponse>;
  transaction_data: ContractInvokeTransactionData;
};
