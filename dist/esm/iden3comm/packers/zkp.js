import { Token, Header, ProvingMethodAlg, proving } from '@iden3/js-jwz';
import { AuthV2PubSignals, CircuitId } from '../../circuits/index';
import { DID } from '@iden3/js-iden3-core';
import { bytesToProtocolMessage } from '../utils/envelope';
import { ErrNoProvingMethodAlg, ErrPackedWithUnsupportedCircuit, ErrProofIsInvalid, ErrSenderNotUsedTokenCreation, ErrStateVerificationFailed, ErrUnknownCircuitID } from '../errors';
import { MediaType } from '../constants';
import { byteDecoder, byteEncoder } from '../../utils';
const { getProvingMethod } = proving;
/**
 * Handler to
 *
 * @public
 * @class DataPrepareHandlerFunc
 */
export class DataPrepareHandlerFunc {
    /**
     * Creates an instance of DataPrepareHandlerFunc.
     * @param {AuthDataPrepareFunc} dataPrepareFunc - function that produces marshaled inputs for auth circuits
     */
    constructor(dataPrepareFunc) {
        this.dataPrepareFunc = dataPrepareFunc;
    }
    /**
     *
     *
     * @param {Uint8Array} hash - challenge that will be signed
     * @param {DID} did - did of identity that will prepare inputs
     * @param {CircuitId} circuitId - circuit id
     * @returns `Promise<Uint8Array>`
     */
    prepare(hash, did, circuitId) {
        return this.dataPrepareFunc(hash, did, circuitId);
    }
}
/**
 * Handler to verify public signals of authorization circuits
 *
 * @public
 * @class VerificationHandlerFunc
 */
export class VerificationHandlerFunc {
    /**
     * Creates an instance of VerificationHandlerFunc.
     * @param {StateVerificationFunc} stateVerificationFunc - state verification function
     */
    constructor(stateVerificationFunc) {
        this.stateVerificationFunc = stateVerificationFunc;
    }
    /**
     *
     *
     * @param {string} id  - id of circuit
     * @param {Array<string>} pubSignals - signals that must contain user id and state
     * @returns `Promise<boolean>`
     */
    verify(id, pubSignals) {
        return this.stateVerificationFunc(id, pubSignals);
    }
}
/**
 * Packer that can pack message to JWZ token,
 * and unpack and validate JWZ envelope
 * @public
 * @class ZKPPacker
 * @implements implements IPacker interface
 */
export class ZKPPacker {
    /**
     * Creates an instance of ZKPPacker.
     * @param {Map<string, ProvingParams>} provingParamsMap - string is derived by JSON.parse(ProvingMethodAlg)
     * @param {Map<string, VerificationParams>} verificationParamsMap - string is derived by JSON.parse(ProvingMethodAlg)
     */
    constructor(provingParamsMap, verificationParamsMap) {
        this.provingParamsMap = provingParamsMap;
        this.verificationParamsMap = verificationParamsMap;
    }
    /**
     * creates JSON Web Zeroknowledge token
     *
     * @param {Uint8Array} payload - serialized message
     * @param {ZKPPackerParams} params - sender id and proving alg are required
     * @returns `Promise<Uint8Array>`
     */
    async pack(payload, params) {
        const provingMethod = await getProvingMethod(params.provingMethodAlg);
        const provingParams = this.provingParamsMap.get(params.provingMethodAlg.toString());
        if (!provingParams) {
            throw new Error(ErrNoProvingMethodAlg);
        }
        const token = new Token(provingMethod, byteDecoder.decode(payload), (hash, circuitId) => {
            return provingParams?.dataPreparer?.prepare(hash, params.senderDID, circuitId);
        });
        token.setHeader(Header.Type, MediaType.ZKPMessage);
        const tokenStr = await token.prove(provingParams.provingKey, provingParams.wasm);
        return byteEncoder.encode(tokenStr);
    }
    /**
     * validate envelope which is jwz token
     *
     * @param {Uint8Array} envelope
     * @returns `Promise<BasicMessage>`
     */
    async unpack(envelope) {
        const token = await Token.parse(byteDecoder.decode(envelope));
        const provingMethodAlg = new ProvingMethodAlg(token.alg, token.circuitId);
        const verificationParams = this.verificationParamsMap.get(provingMethodAlg.toString());
        if (!verificationParams?.key) {
            throw new Error(ErrPackedWithUnsupportedCircuit);
        }
        const isValid = await token.verify(verificationParams?.key);
        if (!isValid) {
            throw new Error(ErrProofIsInvalid);
        }
        const verificationResult = await verificationParams?.verificationFn?.verify(token.circuitId, token.zkProof.pub_signals);
        if (!verificationResult) {
            throw new Error(ErrStateVerificationFailed);
        }
        const message = bytesToProtocolMessage(byteEncoder.encode(token.getPayload()));
        // should throw if error
        verifySender(token, message);
        return message;
    }
    mediaType() {
        return MediaType.ZKPMessage;
    }
}
const verifySender = (token, msg) => {
    switch (token.circuitId) {
        case CircuitId.AuthV2:
            if (!msg.from || !verifyAuthV2Sender(msg.from, token.zkProof.pub_signals)) {
                throw new Error(ErrSenderNotUsedTokenCreation);
            }
            break;
        default:
            throw new Error(ErrUnknownCircuitID);
    }
};
const verifyAuthV2Sender = (from, pubSignals) => {
    const authSignals = new AuthV2PubSignals();
    const pubSig = authSignals.pubSignalsUnmarshal(byteEncoder.encode(JSON.stringify(pubSignals)));
    return pubSig.userID ? checkSender(from, pubSig.userID) : false;
};
const checkSender = (from, id) => {
    const did = DID.parseFromId(id);
    return from === did.string();
};
//# sourceMappingURL=zkp.js.map