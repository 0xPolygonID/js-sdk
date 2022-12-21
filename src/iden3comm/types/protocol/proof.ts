import { MediaType, ProtocolMessage } from '../';
import { ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from './auth';

// ProofGenerationRequestMessage is struct the represents body for proof generation request
export type ProofGenerationRequestMessage = {
  id: string;
  typ?: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body?: ProofGenerationRequestMessageBody;
  from?: string;
  to?: string;
};

// ProofGenerationRequestMessageBody is struct the represents body for proof generation request
export type ProofGenerationRequestMessageBody = {
  scope: Array<ZeroKnowledgeProofRequest>;
};

// ProofGenerationResponseMessage is struct the represents body for proof generation request
export type ProofGenerationResponseMessage = {
  id: string;
  typ?: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body?: ResponseMessageBody;
  from?: string;
  to?: string;
};

// ResponseMessageBody is struct the represents request for revocation status
export type ResponseMessageBody = {
  scope: Array<ZeroKnowledgeProofResponse>;
};

export type ProofData = {
  pi_a: Array<string>;
  pi_b: Array<string>;
  pi_c: Array<string>;
  protocol: string;
};

export type ZKProof = {
  proof: ProofData;
  pub_signals: Array<string>;
};
