import {
  StateVerificationOpts,
  AuthDataPrepareFunc,
  BasicMessage,
  IPacker,
  ProvingParams,
  StateVerificationFunc,
  VerificationParams,
  ZKPPackerParams,
  AuthCircuitDataPrepareFunc
} from '../types';
import { Token, Header, ProvingMethodAlg, proving } from '@iden3/js-jwz';
import { AuthV3PubSignals, CircuitId, getCircuitIdsWithSubVersions } from '../../circuits/index';
import { BytesHelper, DID } from '@iden3/js-iden3-core';
import {
  ErrNoProvingMethodAlg,
  ErrPackedWithUnsupportedCircuit,
  ErrProofIsInvalid,
  ErrSenderNotUsedTokenCreation,
  ErrStateVerificationFailed,
  ErrUnknownCircuitID
} from '../errors';
import { AcceptJwzAlgorithms, MediaType, ProtocolVersion } from '../constants';
import { byteDecoder, byteEncoder } from '../../utils';
import { DEFAULT_AUTH_VERIFY_DELAY } from '../constants';
import { parseAcceptProfile } from '../utils';

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
   * @param {AuthDataPrepareFunc | AuthCircuitDataPrepareFunc} dataPrepareFunc - function that produces marshaled inputs for auth circuits
   */
  constructor(public readonly dataPrepareFunc: AuthDataPrepareFunc | AuthCircuitDataPrepareFunc) {}

  /**
   *
   *
   * @param {Uint8Array} hash - challenge that will be signed
   * @param {DID} did - did of identity that will prepare inputs
   * @param {CircuitId} circuitId - circuit id
   * @returns `Promise<Uint8Array>`
   */
  prepare(
    hash: Uint8Array,
    did: DID,
    circuitId: CircuitId
  ): Promise<Uint8Array | { inputs: Uint8Array; targetCircuitId: CircuitId }> {
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
  constructor(public readonly stateVerificationFunc: StateVerificationFunc) {}

  /**
   *
   *
   * @param {string} id  - id of circuit
   * @param {Array<string>} pubSignals - signals that must contain user id and state
   * @returns `Promise<boolean>`
   */
  verify(id: string, pubSignals: Array<string>, opts?: StateVerificationOpts): Promise<boolean> {
    return this.stateVerificationFunc(id, pubSignals, opts);
  }
}

/**
 * Packer that can pack message to JWZ token,
 * and unpack and validate JWZ envelope
 * @public
 * @class ZKPPacker
 * @implements implements IPacker interface
 */
export class ZKPPacker implements IPacker {
  private readonly supportedProtocolVersions = [ProtocolVersion.V1];
  private readonly supportedAlgorithms = [AcceptJwzAlgorithms.Groth16];
  private readonly supportedCircuitIds: string[];
  /**
   * Creates an instance of ZKPPacker.
   * @param {Map<string, ProvingParams>} provingParamsMap - string is derived by JSON.parse(ProvingMethodAlg)
   * @param {Map<string, VerificationParams>} verificationParamsMap - string is derived by JSON.parse(ProvingMethodAlg)
   */
  constructor(
    public readonly provingParamsMap: Map<string, ProvingParams>,
    public readonly verificationParamsMap: Map<string, VerificationParams>,
    private readonly _opts: StateVerificationOpts = {
      acceptedStateTransitionDelay: DEFAULT_AUTH_VERIFY_DELAY
    }
  ) {
    const supportedProvers = Array.from(this.provingParamsMap.keys()).map(
      (alg) => alg.split(':')[1]
    );

    const supportedVerifiers = Array.from(this.verificationParamsMap.keys()).map(
      (alg) => alg.split(':')[1]
    );
    this.supportedCircuitIds = [...new Set([...supportedProvers, ...supportedVerifiers])];
  }

  /**
   * Packs a basic message using the specified parameters.
   * @param msg - The basic message to pack.
   * @param param - The parameters for the ZKPPacker.
   * @returns A promise that resolves to a Uint8Array representing the packed message.
   */
  packMessage(msg: BasicMessage, param: ZKPPackerParams): Promise<Uint8Array> {
    return this.pack(byteEncoder.encode(JSON.stringify(msg)), param as ZKPPackerParams);
  }

  /**
   * creates JSON Web Zeroknowledge token
   *
   * @param {Uint8Array} payload - serialized message
   * @param {ZKPPackerParams} params - sender id and proving alg are required
   * @returns `Promise<Uint8Array>`
   */
  async pack(payload: Uint8Array, params: ZKPPackerParams): Promise<Uint8Array> {
    let provingMethodAlg = params.provingMethodAlg;

    let provingMethod = await getProvingMethod(provingMethodAlg);
    let provingParams = this.provingParamsMap.get(provingMethodAlg.toString());

    if (!provingParams) {
      throw new Error(ErrNoProvingMethodAlg);
    }

    let targetCircuitId = provingMethodAlg.circuitId as CircuitId;

    const testHash = Uint8Array.from(new Array(32).fill(0).map(() => 1));

    const testResult = await provingParams?.dataPreparer?.prepare(
      testHash,
      params.senderDID,
      provingMethodAlg.circuitId as CircuitId
    );

    if (typeof testResult === 'object' && 'targetCircuitId' in testResult) {
      targetCircuitId = testResult.targetCircuitId;
    }

    const token = new Token(
      provingMethod,
      byteDecoder.decode(payload),
      async (hash: Uint8Array, circuitId: string) => {
        const result = await provingParams?.dataPreparer?.prepare(
          hash,
          params.senderDID,
          circuitId as CircuitId
        );

        if (!result) {
          throw new Error(ErrNoProvingMethodAlg);
        }

        if (typeof result === 'object' && 'inputs' in result) {
          return result.inputs;
        }

        return result;
      }
    );

    if (targetCircuitId !== params.provingMethodAlg.circuitId) {
      provingMethodAlg = new ProvingMethodAlg(params.provingMethodAlg.alg, targetCircuitId);
      provingMethod = await getProvingMethod(provingMethodAlg);
      provingParams = this.provingParamsMap.get(provingMethodAlg.toString());
      if (!provingParams) {
        throw new Error(ErrNoProvingMethodAlg);
      }
    }

    token.setHeader(Header.CircuitId, targetCircuitId);
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
      token.zkProof.pub_signals,
      this._opts
    );

    if (!verificationResult) {
      throw new Error(ErrStateVerificationFailed);
    }

    const message = JSON.parse(token.getPayload());

    // should throw if error
    verifySender(token, message, this.supportedCircuitIds as CircuitId[]);

    return message;
  }

  mediaType(): MediaType {
    return MediaType.ZKPMessage;
  }

  /** {@inheritDoc IPacker.getSupportedProfiles} */
  getSupportedProfiles(): string[] {
    return this.supportedProtocolVersions.map(
      (v) =>
        `${v};env=${this.mediaType()};alg=${this.supportedAlgorithms.join(
          ','
        )};circuitIds=${this.supportedCircuitIds.join(',')}`
    );
  }

  /** {@inheritDoc IPacker.isProfileSupported} */
  isProfileSupported(profile: string) {
    const { protocolVersion, env, circuits, alg } = parseAcceptProfile(profile);

    if (!this.supportedProtocolVersions.includes(protocolVersion)) {
      return false;
    }

    if (env !== this.mediaType()) {
      return false;
    }

    const supportedCircuitIds = this.supportedCircuitIds;
    const circuitIdSupported =
      !circuits?.length || circuits.some((c) => supportedCircuitIds.includes(c));

    const supportedAlgArr = this.supportedAlgorithms;
    const algSupported =
      !alg?.length || alg.some((a) => supportedAlgArr.includes(a as AcceptJwzAlgorithms));
    return algSupported && circuitIdSupported;
  }
}

const verifySender = async (
  token: Token,
  msg: BasicMessage,
  supportedCircuits: CircuitId[]
): Promise<void> => {
  const supportedCircuitIdWithSubVersions = getCircuitIdsWithSubVersions(supportedCircuits);

  if (!supportedCircuitIdWithSubVersions.includes(token.circuitId as CircuitId)) {
    throw new Error(ErrUnknownCircuitID);
  }

  if (!msg.from) {
    throw new Error(ErrSenderNotUsedTokenCreation);
  }
  const authSignals = new AuthV3PubSignals().pubSignalsUnmarshal(
    byteEncoder.encode(JSON.stringify(token.zkProof.pub_signals))
  );
  const did = DID.parseFromId(authSignals.userID);

  const msgHash = await token.getMessageHash();
  const challenge = BytesHelper.bytesToInt(msgHash.reverse());

  if (challenge !== authSignals.challenge) {
    throw new Error(ErrSenderNotUsedTokenCreation);
  }

  if (msg.from !== did.string()) {
    throw new Error(ErrSenderNotUsedTokenCreation);
  }
};
