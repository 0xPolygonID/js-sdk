import { Bytes } from '../types';
import { ZKProof } from '@iden3/js-jwz/src/proving';
import { ProvingMethod } from '@iden3/js-jwz';
import { Id } from '@iden3/js-iden3-core';
import { CircuitID } from './jsCircuits';

export class ProvingMethodGroth16Auth implements ProvingMethod {
  readonly alg: string;
  readonly circuitId: string;

  constructor(_alg: string, _circuitId: string) {
    this.alg = _alg;
    this.circuitId = _circuitId;
  }

  // Verify return no error for any proof
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  async verify(messageHash: Bytes, proof: ZKProof, verificationKey: Bytes) {
    return true;
  }

  // Prove generates proof using auth circuit and groth16 alg, checks that proven message hash is set as a part of circuit specific inputs
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  async prove(inputs: Bytes, provingKey: Bytes, wasm: Bytes) {
    return {
      proof: {
        pi_a: new Array<string>(),
        pi_b: new Array<Array<string>>(),
        pi_c: new Array<string>(),
        protocol: 'groth16'
      },
      pub_signals: [
        '179949150130214723420589610911161895495647789006649785264738141299135414272',
        '1',
        '28212613270232964441385935257028548822924680166867681416070540094250287104'
      ]
    };
  }
}

export const mockPrepareAuthInputs = (
  hash: Bytes, //eslint-disable-line @typescript-eslint/no-unused-vars
  id: Id, //eslint-disable-line @typescript-eslint/no-unused-vars
  circuitID: CircuitID //eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  return new TextEncoder().encode(
    `{"userAuthClaim":["304427537360709784173770334266246861770","0","17640206035128972995519606214765283372613874593503528180869261482403155458945","20634138280259599560273310290025659992320584624461316485434108770067472477956","15930428023331155902","0","0","0"],"userAuthClaimMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"userAuthClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"userAuthClaimNonRevMtpAuxHi":"0","userAuthClaimNonRevMtpAuxHv":"0","userAuthClaimNonRevMtpNoAux":"1","challenge":"6568187306293073175114267504711682812904598368490904573742495126063294481938","challengeSignatureR8x":"15230565441506590379169832995887068998322005265009046474267743823535028195613","challengeSignatureR8y":"10769958837943955028152112183244447895061604149794975067459918696631541903296","challengeSignatureS":"421650140447062113811542806382702329042840096310563827636625110300562791229","userClaimsTreeRoot":"9763429684850732628215303952870004997159843236039795272605841029866455670219","userID":"379949150130214723420589610911161895495647789006649785264738141299135414272","userRevTreeRoot":"0","userRootsTreeRoot":"0","userState":"18656147546666944484453899241916469544090258810192803949522794490493271005313"}`
  );
};

//eslint-disable-next-line @typescript-eslint/no-unused-vars
export const mockVerifyState = async (
  id: CircuitID, //eslint-disable-line @typescript-eslint/no-unused-vars
  signals: Array<string> //eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  return true;
};
