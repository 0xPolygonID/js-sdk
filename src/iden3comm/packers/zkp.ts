import {
  AuthDataPrepareFunc,
  BasicMessage,
  IPacker,
  ProvingParams,
  StateVerificationFunc,
  VerificationParams,
  ZKPPackerParams
} from '../types';
import { Token, Header, ProvingMethodAlg, proving } from '@iden3/js-jwz';
import { AuthV2PubSignals, CircuitId } from '../../circuits/index';
import { DID, Id } from '@iden3/js-iden3-core';
import { bytesToProtocolMessage } from '../utils/envelope';
import {
  ErrNoProvingMethodAlg,
  ErrPackedWithUnsupportedCircuit,
  ErrProofIsInvalid,
  ErrSenderNotUsedTokenCreation,
  ErrStateVerificationFailed,
  ErrUnknownCircuitID
} from '../errors';
import { MediaType } from '../constants';
import { byteDecoder, byteEncoder } from '../../utils';

const { getProvingMethod } = proving;

/**
 * Handler to
 *
 * @export
 * @beta
 * @class DataPrepareHandlerFunc
 */
export class DataPrepareHandlerFunc {
  /**
   * Creates an instance of DataPrepareHandlerFunc.
   * @param {AuthDataPrepareFunc} dataPrepareFunc - function that produces marshaled inputs for auth circuits
   */
  constructor(public readonly dataPrepareFunc: AuthDataPrepareFunc) {}

  /**
   *
   *
   * @param {Uint8Array} hash - challenge that will be signed
   * @param {DID} did - did of identity that will prepare inputs
   * @param {Number} profileNonce - nonce for profile (genesis id must be 0)
   * @param {CircuitId} circuitId - circuit id
   * @returns `Promise<Uint8Array>`
   */
  prepare(
    hash: Uint8Array,
    did: DID,
    profileNonce: number,
    circuitId: CircuitId
  ): Promise<Uint8Array> {
    return this.dataPrepareFunc(hash, did, profileNonce, circuitId);
  }
}

/**
 * Handler to verify public signals of authorization circuits
 *
 * @export
 * @beta
 * @class VerificationHandlerFunc
 */
export class VerificationHandlerFunc {
  /**
   * Creates an instance of VerificationHandlerFunc.
   * @param {StateVerificationFunc} stateVerificationFunc - state verification function
   */
  constructor(public readonly stateVerificationFunc: StateVerificationFunc) {}

  /**
   *
   *
   * @param {string} id  - id of circuit
   * @param {Array<string>} pubSignals - signals that must contain user id and state
   * @returns `Promise<boolean>`
   */
  verify(id: string, pubSignals: Array<string>): Promise<boolean> {
    return this.stateVerificationFunc(id, pubSignals);
  }
}

/**
 * Packer that can pack message to JWZ token,
 * and unpack and validate JWZ envelope
 * @exports
 * @beta
 * @class ZKPPacker
 * @implements implements IPacker interface
 */
export class ZKPPacker implements IPacker {
  /**
   * Creates an instance of ZKPPacker.
   * @param {Map<string, ProvingParams>} provingParamsMap - string is derived by JSON.parse(ProvingMethodAlg)
   * @param {Map<string, VerificationParams>} verificationParamsMap - string is derived by JSON.parse(ProvingMethodAlg)
   */
  constructor(
    public provingParamsMap: Map<string, ProvingParams>,
    public verificationParamsMap: Map<string, VerificationParams>
  ) {}

  /**
   * creates JSON Web Zeroknowledge token
   *
   * @param {Uint8Array} payload - serialized message
   * @param {ZKPPackerParams} params - sender id and proving alg are required
   * @returns `Promise<Uint8Array>`
   */
  async pack(payload: Uint8Array, params: ZKPPackerParams): Promise<Uint8Array> {
    const provingMethod = await getProvingMethod(params.provingMethodAlg);
    const provingParams = this.provingParamsMap.get(params.provingMethodAlg.toString());

    if (!provingParams) {
      throw new Error(ErrNoProvingMethodAlg);
    }

    const token = new Token(
      provingMethod,
      byteDecoder.decode(payload),
      (hash: Uint8Array, circuitId: string) => {
        return provingParams?.dataPreparer?.prepare(
          hash,
          params.senderDID,
          params.profileNonce,
          circuitId as CircuitId
        );
      }
    );
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
  async unpack(envelope: Uint8Array): Promise<BasicMessage> {
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

    const verificationResult = await verificationParams?.verificationFn?.verify(
      token.circuitId,
      token.zkProof.pub_signals
    );
    if (!verificationResult) {
      throw new Error(ErrStateVerificationFailed);
    }

    const message = bytesToProtocolMessage(byteEncoder.encode(token.getPayload()));

    // should throw if error
    verifySender(token, message);

    return message;
  }

  mediaType(): MediaType {
    return MediaType.ZKPMessage;
  }
}

const verifySender = (token: Token, msg: BasicMessage): void => {
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

const verifyAuthV2Sender = (from: string, pubSignals: Array<string>): boolean => {
  const authSignals = new AuthV2PubSignals();

  const pubSig = authSignals.pubSignalsUnmarshal(byteEncoder.encode(JSON.stringify(pubSignals)));
  return pubSig.userID ? checkSender(from, pubSig.userID) : false;
};

const checkSender = (from: string, id: Id): boolean => {
  const did = DID.parseFromId(id);
  return from === did.string();
};
