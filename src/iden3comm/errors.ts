// Envelope Errors
export const ErrNotProtocolMesg = 'the envelope is not a protocol message';
export const ErrNotEnvelopeStub = "the envelope doesn't contain field protected";
export const ErrNotHeaderStub = "the envelope doesn't contain field typ";

// Token Errors
export const ErrUnkownCircuitID = "unknow circuit ID. can't verify msg sender";
export const ErrSenderNotUsedTokenCreation = 'sender of message is not used for jwz token creation';

// ZKP-Packer Errors
export const ErrPackedWithUnsupportedCircuit = 'message was packed with unsupported circuit';
export const ErrProofIsInvalid = 'message proof is invalid';
export const ErrStateVerificationFailed = 'message state verification failed';
