// Envelope Errors
export const ErrNotProtocolMessage = 'the envelope is not a protocol message';
export const ErrNotEnvelopeStub = "the envelope doesn't contain field protected";
export const ErrNotHeaderStub = "the envelope doesn't contain field typ";
// Token Errors
export const ErrUnknownCircuitID = "unknown circuit ID. can't verify msg sender";
export const ErrSenderNotUsedTokenCreation = 'sender of message is not used for jwz token creation';
// ZKP-Packer Errors
export const ErrPackedWithUnsupportedCircuit = 'message was packed with unsupported circuit';
export const ErrProofIsInvalid = 'message proof is invalid';
export const ErrStateVerificationFailed = 'message state verification failed';
export const ErrNoProvingMethodAlg = 'unknown proving method algorithm';
//# sourceMappingURL=errors.js.map