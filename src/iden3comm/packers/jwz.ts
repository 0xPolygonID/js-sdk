import {
  StateVerificationOpts,
  AuthDataPrepareFunc,
  BasicMessage,
  IPacker,
  StateVerificationFunc,
  PackerParams
} from '../types';
import { Token, Header, ProvingMethodAlg, proving, ProvingMethod } from '@iden3/js-jwz';
import { CircuitId } from '../../circuits';
import { DID } from '@iden3/js-iden3-core';
import {
  ErrPackedWithUnsupportedCircuit,
  ErrProofIsInvalid,
  ErrStateVerificationFailed
} from '../errors';
import { AcceptJwzAlgorithms, MediaType, ProtocolVersion } from '../constants';
import { byteDecoder, byteEncoder } from '../../utils';
import { DEFAULT_AUTH_VERIFY_DELAY } from '../constants';
import { CircuitLoadMode, ICircuitStorage } from '../../storage';
import { getSupportedProfiles, isProfileSupported, verifySender } from './zkp-packer-utils';

export type JWZPackerParams = PackerParams & {
  senderDID: DID;
  provingMethodAlg?: ProvingMethodAlg;
  provingMethod?: ProvingMethod;
  provingKey?: Uint8Array;
  wasm?: Uint8Array;
  dataPreparer?: AuthDataPrepareFunc;
};

/**
 * Packer that can pack message to JWZ token,
 * and unpack and validate JWZ envelope
 * @public
 * @class JWZPacker
 * @implements implements IPacker interface
 */
export class JWZPacker implements IPacker {
  private readonly supportedProtocolVersions = [ProtocolVersion.V1];
  private readonly supportedAlgorithms = [AcceptJwzAlgorithms.Groth16];
  private readonly supportedCircuitIds: string[];
  private readonly _dataPreparersFnMap: Map<CircuitId, AuthDataPrepareFunc>;
  private readonly _verificationFnsMap: Map<CircuitId, StateVerificationFunc>;

  private readonly _verificationOpts: StateVerificationOpts = {
    acceptedStateTransitionDelay: DEFAULT_AUTH_VERIFY_DELAY
  };
  private readonly _circuitStorage?: ICircuitStorage;

  constructor(opts?: {
    circuitStorage?: ICircuitStorage;
    defaultDataPreparers?: Map<CircuitId, AuthDataPrepareFunc>;
    stateVerificationFnMap?: Map<CircuitId, StateVerificationFunc>;
  }) {
    this._circuitStorage = opts?.circuitStorage;
    this._dataPreparersFnMap = opts?.defaultDataPreparers ?? new Map();
    this._verificationFnsMap = opts?.stateVerificationFnMap ?? new Map();

    this.supportedCircuitIds = [CircuitId.AuthV2, CircuitId.AuthV3, CircuitId.AuthV3_8_32];
  }

  /**
   * Packs a basic message using the specified parameters.
   * @param msg - The basic message to pack.
   * @param param - The parameters for the ZKPPacker.
   * @returns A promise that resolves to a Uint8Array representing the packed message.
   */
  pack(msg: Uint8Array, param: JWZPackerParams): Promise<Uint8Array> {
    return this.packMessage(JSON.parse(byteDecoder.decode(msg)), param);
  }

  /**
   * creates JSON Web Zeroknowledge token
   *
   * @param {Uint8Array} payload - serialized message
   * @param {ZKPPackerParams} params - sender id and proving alg are required
   * @returns `Promise<Uint8Array>`
   */
  async packMessage(payload: BasicMessage, params: JWZPackerParams): Promise<Uint8Array> {
    const {
      wasm,
      provingKey,
      provingMethodAlg,
      senderDID,
      provingMethod,
      dataPreparer: dataPreparerFn
    } = params;

    if (!provingMethodAlg && !provingMethod) {
      throw new Error('provingMethodAlg or provingMethod must be provided in JWZPackerParams');
    }

    const method = provingMethodAlg
      ? await proving.getProvingMethod(provingMethodAlg)
      : provingMethod;

    if (!method) {
      throw new Error('Could not get proving method from provided provingMethodAlg');
    }

    const circuit = method.circuitId as CircuitId;

    // Get data preparer: use provided one, or look up default based on circuitId or provingMethod
    const dataPreparer: AuthDataPrepareFunc | undefined =
      dataPreparerFn ?? this._dataPreparersFnMap.get(circuit);

    if (!dataPreparer) {
      throw new Error(`No data preparer provided and no default found for circuit ${circuit}`);
    }

    const prepareFn = (hash: Uint8Array, circuitId: string): Promise<Uint8Array> =>
      dataPreparer(hash, senderDID, circuitId as CircuitId);

    const payloadString = JSON.stringify(payload);

    const token = new Token(method, payloadString, prepareFn);
    token.setHeader(Header.Type, MediaType.ZKPMessage);

    if ([this._circuitStorage, wasm, provingKey].every((v) => !v)) {
      throw new Error('ZKPacker: circuit storage or wasm and proving key must be provided');
    }

    const circuitData =
      provingKey && wasm
        ? { provingKey, wasm }
        : await this._circuitStorage?.loadCircuitData(circuit, {
            mode: CircuitLoadMode.Proving
          });

    if (!circuitData?.provingKey || !circuitData?.wasm) {
      throw new Error(`proving key or wasm file doesn't exist for circuit ${circuit}`);
    }

    const tokenStr = await token.prove(circuitData.provingKey, circuitData.wasm);
    return byteEncoder.encode(tokenStr);
  }

  /**
   * validate envelope which is jwz token
   *
   * @param {Uint8Array} envelope
   * @returns `Promise<BasicMessage>`
   */
  async unpack(
    envelope: Uint8Array,
    opts?: {
      verificationKey?: Uint8Array;
      verificationFn?: StateVerificationFunc;
      stateVerificationOpts?: StateVerificationOpts;
    }
  ): Promise<BasicMessage> {
    const token = await Token.parse(byteDecoder.decode(envelope));

    const verificationKey =
      opts?.verificationKey ??
      (
        await this._circuitStorage?.loadCircuitData(token.circuitId as CircuitId, {
          mode: CircuitLoadMode.Verification
        })
      )?.verificationKey;

    if (!verificationKey) {
      throw new Error(`verification key doesn't exist for circuit ${token.circuitId}`);
    }

    const isValid = await token.verify(verificationKey);

    if (!isValid) {
      throw new Error(ErrProofIsInvalid);
    }

    const verifyFn =
      opts?.verificationFn ?? this._verificationFnsMap.get(token.circuitId as CircuitId);

    if (!verifyFn) {
      throw new Error(ErrPackedWithUnsupportedCircuit);
    }

    const verificationResult = await verifyFn(
      token.circuitId,
      token.zkProof.pub_signals,
      this._verificationOpts
    );

    if (!verificationResult) {
      throw new Error(ErrStateVerificationFailed);
    }

    const message = JSON.parse(token.getPayload());

    // should throw if error
    verifySender(token, message);

    return message;
  }

  mediaType(): MediaType {
    return MediaType.ZKPMessage;
  }

  /** {@inheritDoc IPacker.getSupportedProfiles} */
  getSupportedProfiles(): string[] {
    return getSupportedProfiles(
      this.supportedProtocolVersions,
      this.mediaType(),
      this.supportedAlgorithms,
      this.supportedCircuitIds
    );
  }

  /** {@inheritDoc IPacker.isProfileSupported} */
  isProfileSupported(profile: string) {
    return isProfileSupported(
      profile,
      this.supportedProtocolVersions,
      this.mediaType(),
      this.supportedAlgorithms,
      this.supportedCircuitIds
    );
  }
}
