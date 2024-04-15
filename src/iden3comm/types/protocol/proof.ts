import { BasicMessage } from '../';
import { ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from './auth';

/** ProofGenerationRequestMessage is struct the represents body for proof generation request */
export type ProofGenerationRequestMessage = Required<BasicMessage> & {
  body?: ProofGenerationRequestMessageBody;
};

/** ProofGenerationRequestMessageBody is struct the represents body for proof generation request */
export type ProofGenerationRequestMessageBody = {
  scope: Array<ZeroKnowledgeProofRequest>;
};

/** ProofGenerationResponseMessage is struct the represents body for proof generation request */
export type ProofGenerationResponseMessage = Required<BasicMessage> & {
  body?: ResponseMessageBody;
};

/** ResponseMessageBody is struct the represents request for revocation status */
export type ResponseMessageBody = {
  scope: Array<ZeroKnowledgeProofResponse>;
};
