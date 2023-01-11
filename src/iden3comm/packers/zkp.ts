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
  ErrPackedWithUnsupportedCircuit,
  ErrProofIsInvalid,
  ErrSenderNotUsedTokenCreation,
  ErrStateVerificationFailed,
  ErrUnkownCircuitID
} from '../errors';
import { byteDecoder, byteEncoder } from '../utils';
import { MediaType } from '../constants';

const { getProvingMethod } = proving;

export class DataPrepareHandlerFunc {
  constructor(public readonly dataPrepareFunc: AuthDataPrepareFunc) {}

  prepare(hash: Uint8Array, id: DID, circuitId: CircuitId): Promise<Uint8Array> {
    return this.dataPrepareFunc(hash, id, circuitId);
  }
}

export class VerificationHandlerFunc {
  constructor(public readonly stateVerificationFunc: StateVerificationFunc) {}

  verify(id: string, pubSignals: Array<string>): Promise<boolean> {
    return this.stateVerificationFunc(id, pubSignals);
  }
}

class ZKPPacker implements IPacker {
  constructor(
    // string is derived by JSON.parse(ProvingMethodAlg)
    public provingParamsMap: Map<string, ProvingParams>,
    // string is derived by JSON.parse(ProvingMethodAlg)
    public verificationParamsMap: Map<string, VerificationParams>
  ) {}

  async pack(payload: Uint8Array, params: ZKPPackerParams): Promise<Uint8Array> {
    const provingMethod = await getProvingMethod(params.provingMethodAlg);
    const { provingKey, wasm, dataPreparer } = this.provingParamsMap.get(
      params.provingMethodAlg.toString()
    );

    const token = new Token(
      provingMethod,
      byteDecoder.decode(payload),
      (hash: Uint8Array, circuitID: CircuitId) => {
        return dataPreparer.prepare(hash, params.senderID, circuitID);
      }
    );
    token.setHeader(Header.Type, MediaType.ZKPMessage);
    const tokenStr = await token.prove(provingKey, wasm);
    return byteEncoder.encode(tokenStr);
  }

  async unpack(envelope: Uint8Array): Promise<BasicMessage> {
    const token = await Token.parse(byteDecoder.decode(envelope));
    const provingMethodAlg = new ProvingMethodAlg(token.alg, token.circuitId);
    const { key: verificationKey, verificationFn } = this.verificationParamsMap.get(
      provingMethodAlg.toString()
    );
    if (!verificationKey) {
      throw new Error(ErrPackedWithUnsupportedCircuit);
    }
    const isValid = await token.verify(verificationKey);
    if (!isValid) {
      throw new Error(ErrProofIsInvalid);
    }

    const sVerficationRes = await verificationFn.verify(token.circuitId, token.zkProof.pub_signals);
    if (!sVerficationRes) {
      throw new Error(ErrStateVerificationFailed);
    }

    const messg = bytesToProtocolMessage(byteEncoder.encode(token.getPayload()));

    // should throw if errror
    verifySender(token, messg);

    return messg;
  }

  mediaType(): MediaType {
    return MediaType.ZKPMessage;
  }
}

const verifySender = (token: Token, msg: BasicMessage): void => {
  switch (token.circuitId) {
    case CircuitId.AuthV2:
      if (!verifyAuthV2Sender(msg.from, token.zkProof.pub_signals)) {
        throw new Error(ErrSenderNotUsedTokenCreation);
      }
      break;
    default:
      throw new Error(ErrUnkownCircuitID);
  }
};

const verifyAuthV2Sender = (from: string, pubSignals: Array<string>): boolean => {
  const byteEncoder = new TextEncoder();
  const authSignals = new AuthV2PubSignals();

  const pubSig = authSignals.pubSignalsUnmarshal(byteEncoder.encode(JSON.stringify(pubSignals)));
  return checkSender(from, pubSig.userID);
};

const checkSender = (from: string, id: Id): boolean => {
  const did = DID.parseFromId(id);
  return from === did.toString();
};

export default ZKPPacker;
