import { BasicMessage } from '../';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from './auth';

/** ProofGenerationRequestMessage is struct the represents body for proof generation request */
export type ProofGenerationRequestMessage = Required<BasicMessage> & {
  body?: ProofGenerationRequestMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.PROOF_GENERATION_REQUEST_MESSAGE_TYPE;
};

/** ProofGenerationRequestMessageBody is struct the represents body for proof generation request */
export type ProofGenerationRequestMessageBody = {
  scope: Array<ZeroKnowledgeProofRequest>;
};

/** ProofGenerationResponseMessage is struct the represents body for proof generation request */
export type ProofGenerationResponseMessage = Required<BasicMessage> & {
  body?: ResponseMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.PROOF_GENERATION_RESPONSE_MESSAGE_TYPE;
};

/** ResponseMessageBody is struct the represents request for revocation status */
export type ResponseMessageBody = {
  scope: Array<ZeroKnowledgeProofResponse>;
};
