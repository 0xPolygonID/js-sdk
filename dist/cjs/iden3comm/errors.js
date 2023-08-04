"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrNoProvingMethodAlg = exports.ErrStateVerificationFailed = exports.ErrProofIsInvalid = exports.ErrPackedWithUnsupportedCircuit = exports.ErrSenderNotUsedTokenCreation = exports.ErrUnknownCircuitID = exports.ErrNotHeaderStub = exports.ErrNotEnvelopeStub = exports.ErrNotProtocolMessage = void 0;
// Envelope Errors
exports.ErrNotProtocolMessage = 'the envelope is not a protocol message';
exports.ErrNotEnvelopeStub = "the envelope doesn't contain field protected";
exports.ErrNotHeaderStub = "the envelope doesn't contain field typ";
// Token Errors
exports.ErrUnknownCircuitID = "unknown circuit ID. can't verify msg sender";
exports.ErrSenderNotUsedTokenCreation = 'sender of message is not used for jwz token creation';
// ZKP-Packer Errors
exports.ErrPackedWithUnsupportedCircuit = 'message was packed with unsupported circuit';
exports.ErrProofIsInvalid = 'message proof is invalid';
exports.ErrStateVerificationFailed = 'message state verification failed';
exports.ErrNoProvingMethodAlg = 'unknown proving method algorithm';
//# sourceMappingURL=errors.js.map