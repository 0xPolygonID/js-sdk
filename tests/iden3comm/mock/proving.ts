import { CircuitId } from './../../../src/circuits/models';
import { ProvingMethod, ProvingMethodAlg, ZKProof, proving } from '@iden3/js-jwz';
import { DID } from '@iden3/js-iden3-core';
import { Eddsa } from '@iden3/js-crypto';
import { newBigIntFromBytes } from '@iden3/js-merkletree';
import {
  byteEncoder,
  DataPrepareHandlerFunc,
  ProvingParams,
  VerificationHandlerFunc,
  VerificationParams,
  ZKPPacker
} from '../../../src';
const { registerProvingMethod } = proving;

export class ProvingMethodGroth16Authv2 implements ProvingMethod {
  constructor(public readonly methodAlg: ProvingMethodAlg) {}

  get alg(): string {
    return this.methodAlg.alg;
  }

  get circuitId(): string {
    return this.methodAlg.circuitId;
  }

  // Verify return no error for any proof
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  async verify(
    messageHash: Uint8Array, //eslint-disable-line @typescript-eslint/no-unused-vars
    proof: ZKProof, //eslint-disable-line @typescript-eslint/no-unused-vars
    verificationKey: Uint8Array //eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<boolean> {
    return true;
  }

  // Prove generates proof using auth circuit and groth16 alg, checks that proven message hash is set as a part of circuit specific inputs
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  async prove(inputs: Uint8Array, provingKey: Uint8Array, wasm: Uint8Array): Promise<ZKProof> {
    return {
      proof: {
        pi_a: new Array<string>(),
        pi_b: new Array<Array<string>>(),
        pi_c: new Array<string>(),
        protocol: 'groth16'
      },
      pub_signals: [
        '19229084873704550357232887142774605442297337229176579229011342091594174977',
        '6110517768249559238193477435454792024732173865488900270849624328650765691494',
        '1243904711429961858774220647610724273798918457991486031567244100767259239747'
      ]
    };
  }
}

export const mockPrepareAuthInputs = (
  hash: Uint8Array, //eslint-disable-line @typescript-eslint/no-unused-vars
  did: DID, //eslint-disable-line @typescript-eslint/no-unused-vars
  circuitID: CircuitId //eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<Uint8Array> => {
  const challenge = newBigIntFromBytes(hash);

  const userMockedPK = byteEncoder.encode(
    '28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69e'
  );

  const sig = Eddsa.signPoseidon(userMockedPK, challenge);

  const mockedInputs = byteEncoder.encode(
    `{"genesisID":"19229084873704550357232887142774605442297337229176579229011342091594174977","profileNonce":"0","authClaim":["301485908906857522017021291028488077057","0","4720763745722683616702324599137259461509439547324750011830105416383780791263","4844030361230692908091131578688419341633213823133966379083981236400104720538","16547485850637761685","0","0","0"],"authClaimIncMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"authClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"authClaimNonRevMtpAuxHi":"0","authClaimNonRevMtpAuxHv":"0","authClaimNonRevMtpNoAux":"1","challenge":"6110517768249559238193477435454792024732173865488900270849624328650765691494","challengeSignatureR8x":"10923900855019966925146890192107445603460581432515833977084358496785417078889","challengeSignatureR8y":"16158862443157007045624936621448425746188316255879806600364391221203989186031","challengeSignatureS":"${sig.S}","claimsTreeRoot":"5156125448952672817978035354327403409438120028299513459509442000229340486813","revTreeRoot":"0","rootsTreeRoot":"0","state":"13749793311041076104545663747883540987785640262360452307923674522221753800226","gistRoot":"1243904711429961858774220647610724273798918457991486031567244100767259239747","gistMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"gistMtpAuxHi":"1","gistMtpAuxHv":"1","gistMtpNoAux":"0"}`
  );

  return Promise.resolve(mockedInputs);
};

//eslint-disable-next-line @typescript-eslint/no-unused-vars
export const mockVerifyState = async (
  id: string, //eslint-disable-line @typescript-eslint/no-unused-vars
  signals: Array<string> //eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<boolean> => true;

export const initZKPPacker = async (opts?: { alg: string }): Promise<ZKPPacker> => {
  const mockAuthInputsHandler = new DataPrepareHandlerFunc(mockPrepareAuthInputs);

  const mockProvingMethod = new ProvingMethodGroth16Authv2(
    new ProvingMethodAlg(opts?.alg ?? 'groth16-mock', 'authV2')
  );

  await registerProvingMethod(mockProvingMethod.methodAlg, (): ProvingMethod => {
    return mockProvingMethod;
  });

  const verificationFn = new VerificationHandlerFunc(mockVerifyState);
  const mapKey = mockProvingMethod.methodAlg.toString();

  const mockVerificationParamMap: Map<string, VerificationParams> = new Map();
  mockVerificationParamMap.set(mapKey, {
    key: new Uint8Array([]),
    verificationFn
  });

  const mockProvingParamMap: Map<string, ProvingParams> = new Map();
  mockProvingParamMap.set(mapKey, {
    dataPreparer: mockAuthInputsHandler,
    provingKey: new Uint8Array([]),
    wasm: new Uint8Array([])
  });

  return new ZKPPacker(mockProvingParamMap, mockVerificationParamMap);
};
