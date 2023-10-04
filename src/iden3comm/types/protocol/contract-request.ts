import { ZeroKnowledgeProofRequest } from './auth';

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
