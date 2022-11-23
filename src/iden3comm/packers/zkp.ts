import {
  AuthDataPrepareFunc,
  BasicMessage,
  Bytes,
  IPacker,
  MediaType,
  StateVerificationFunc,
  ZKPPackerParams
} from '../types';
import { jwz, Token, ProvingMethod } from '@iden3/js-jwz';
import { CircuitID, circuits } from '../mock/jsCircuits';
import { Id } from '@iden3/js-iden3-core';
import { bytesToString, stringToBytes } from '../utils';
import { bytesToProtocolMessage } from '../utils/envelope';
import {
  ErrPackedWithUnsupportedCircuit,
  ErrProofIsInvalid,
  ErrSenderNotUsedTokenCreation,
  ErrStateVerificationFailed,
  ErrUnkownCircuitID
} from '../errors';

export const MEDIA_TYPE_ZKP_MESSAGE: MediaType = 'application/iden3-zkp-json';

export class AuthDataPrepareHandlerFunc {
  constructor(public readonly authDataPrepareFunc: AuthDataPrepareFunc) {}

  prepare(hash: Bytes, id: Id, circuitID: CircuitID) {
    return this.authDataPrepareFunc(hash, id, circuitID);
  }
}

export class StateVerificationHandlerFunc {
  constructor(public readonly stateVerificationFunc: StateVerificationFunc) {}

  verify(id: CircuitID, pubSignals: Array<string>): Promise<boolean> {
    return this.stateVerificationFunc(id, pubSignals);
  }
}

class ZKPPacker implements IPacker {
  constructor(
    public provingMethod: ProvingMethod,
    public authDataPreparer: AuthDataPrepareHandlerFunc,
    public stateVerifier: StateVerificationHandlerFunc,
    public provingKey: Bytes,
    public wasm: Bytes,
    public verificationKeys: Map<CircuitID, Bytes>
  ) {}

  async pack(payload: Bytes, params: ZKPPackerParams): Promise<Bytes> {
    const token = new Token(
      this.provingMethod,
      bytesToString(payload),
      (hash: Bytes, circuitID: CircuitID) => {
        return this.authDataPreparer.prepare(hash, params.senderID, circuitID);
      }
    );
    token.setHeader(jwz.headerType, MEDIA_TYPE_ZKP_MESSAGE);
    const tokenStr = await token.prove(this.provingKey, this.wasm);
    return stringToBytes(tokenStr);
  }

  async unpack(envelope: Bytes): Promise<BasicMessage> {
    const token = await Token.parse(bytesToString(envelope));
    const verificationKey = this.verificationKeys.get(token.circuitId);
    if (!verificationKey) {
      throw ErrPackedWithUnsupportedCircuit;
    }
    const isValid = await token.verify(verificationKey);
    if (!isValid) {
      throw ErrProofIsInvalid;
    }

    const sVerficationRes = await this.stateVerifier.verify(
      token.circuitId,
      token.zkProof.pub_signals
    );
    if (!sVerficationRes) {
      throw ErrStateVerificationFailed;
    }

    const messg = bytesToProtocolMessage(stringToBytes(token.getPayload()));

    // should throw if errror
    verifySender(token, messg);

    return messg;
  }

  mediaType(): MediaType {
    return MEDIA_TYPE_ZKP_MESSAGE;
  }
}

const verifySender = (token: Token, msg: BasicMessage): void => {
  switch (token.circuitId) {
    case circuits.authCircuitID:
      // eslint-disable-next-line no-case-declarations
      const authPubSigs = circuits.unmarshallToAuthPubSignals(token.zkProof.pub_signals);
      // eslint-disable-next-line no-case-declarations
      const { userId } = authPubSigs;
      if (userId.string() !== msg.from) {
        throw ErrSenderNotUsedTokenCreation;
      }
      break;
    default:
      throw ErrUnkownCircuitID;
  }
};

export default ZKPPacker;
