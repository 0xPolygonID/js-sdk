import { ProvingMethodAlg } from '@iden3/js-jwz';
import { CircuitId } from '../../circuits';
import { IProofService } from '../../proof';
import { CircuitLoadMode, ICircuitStorage } from '../../storage';
import { BasicMessage, StateVerificationOpts, ZKPPackerParams } from '../types';
import { DataPrepareHandlerFunc, VerificationHandlerFunc, ZKPPacker } from './zkp';

export class DefaultZKPPacker extends ZKPPacker {
  constructor(
    private circuitStorage: ICircuitStorage,
    private proofService: IProofService,
    opts?: StateVerificationOpts
  ) {
    super(new Map(), new Map(), { ...opts });
    this.supportedCircuitIds = [CircuitId.AuthV2, CircuitId.AuthV3, CircuitId.AuthV3_8_32];
  }

  async pack(payload: Uint8Array, params: ZKPPackerParams): Promise<Uint8Array> {
    const circuitId = params.provingMethodAlg.circuitId;

    const { provingKey, wasm } = await this.circuitStorage.loadCircuitData(circuitId as CircuitId, {
      mode: CircuitLoadMode.Proving
    });
    if (!provingKey || !wasm) {
      throw new Error(`circuit data not found for circuit id: ${circuitId}`);
    }

    if (!this.provingParamsMap.has(params.provingMethodAlg.toString())) {
      this.provingParamsMap.set(params.provingMethodAlg.toString(), {
        provingKey,
        wasm,
        dataPreparer: new DataPrepareHandlerFunc(
          this.proofService.generateAuthInputs.bind(this.proofService)
        )
      });
    }
    return super.pack(payload, params);
  }

  async unpack(envelope: Uint8Array): Promise<BasicMessage> {
    const token = await this.parseToken(envelope);

    const circuitId = token.circuitId as CircuitId;

    const provingMethodAlg = new ProvingMethodAlg(token.alg, circuitId);

    if (!this.verificationParamsMap.has(provingMethodAlg.toString())) {
      const { verificationKey } = await this.circuitStorage.loadCircuitData(circuitId, {
        mode: CircuitLoadMode.Verification
      });

      if (!verificationKey) {
        throw new Error(`verification key not found for circuit id: ${circuitId}`);
      }

      this.verificationParamsMap.set(provingMethodAlg.toString(), {
        key: verificationKey,
        verificationFn: new VerificationHandlerFunc(
          this.proofService.verifyState.bind(this.proofService)
        )
      });
    }

    return super.unpackMessage(token, provingMethodAlg);
  }
}
