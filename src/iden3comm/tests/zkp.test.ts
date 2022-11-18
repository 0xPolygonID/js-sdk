import { mockPrepareAuthInputs, mockVerifyState, ProvingMethodGroth16Auth } from '../mock/proving';
import ZKPPacker, {
  AuthDataPrepareHandlerFunc,
  StateVerificationHandlerFunc
} from '../packers/zkp';
import { bytes2String, string2Bytes } from '../utils/index';
import { Id } from '@iden3/js-iden3-core';
import { proving, Token } from '@iden3/js-jwz';
import { circuits } from '../mock/jsCircuits';

describe('zkp packer tests', () => {
  it('test zkp packer', async () => {
    const keys = new Map();
    const emptyBuff = new ArrayBuffer(0);
    keys.set('auth', new Uint8Array(emptyBuff));
    const provingKey = new Uint8Array(emptyBuff);
    const wasm = new Uint8Array(emptyBuff);

    const mockProvingMethod = new ProvingMethodGroth16Auth('groth16-mock', 'auth');
    const mockAuthInputsHandler = new AuthDataPrepareHandlerFunc(mockPrepareAuthInputs);

    proving.registerProvingMethod('groth16-mock', () => {
      return mockProvingMethod;
    });

    const p = new ZKPPacker(
      mockProvingMethod,
      mockAuthInputsHandler,
      new StateVerificationHandlerFunc(mockVerifyState),
      provingKey,
      wasm,
      keys
    );
    const payload =
      '{"type":"https://iden3-communication.io/authorization/1.0/response","from":"114vgnnCupQMX4wqUBjg5kUya3zMXfPmKc9HNH4m2E","body":{"scope":[{"type":"zeroknowledge","circuit_id":"auth","pub_signals":["1","18311560525383319719311394957064820091354976310599818797157189568621466950811","323416925264666217617288569742564703632850816035761084002720090377353297920"],"proof_data":{"pi_a":["11130843150540789299458990586020000719280246153797882843214290541980522375072","1300841912943781723022032355836893831132920783788455531838254465784605762713","1"],"pi_b":[["20615768536988438336537777909042352056392862251785722796637590212160561351656","10371144806107778890538857700855108667622042215096971747203105997454625814080"],["19598541350804478549141207835028671111063915635580679694907635914279928677812","15264553045517065669171584943964322117397645147006909167427809837929458012913"],["1","0"]],"pi_c":["16443309279825508893086251290003936935077348754097470818523558082502364822049","2984180227766048100510120407150752052334571876681304999595544138155611963273","1"],"protocol":""}}]}}';
    const payloadBytes = string2Bytes(payload);

    const id = Id.fromString('114vgnnCupQMX4wqUBjg5kUya3zMXfPmKc9HNH4m2E');
    const b = await p.pack(payloadBytes, { senderID: id });

    const basicMessg = await p.unpack(b);

    const token = await Token.parse(bytes2String(b));
    const authPubSigs = circuits.unmarshallToAuthPubSignals(token.zkProof.pub_signals);

    expect(authPubSigs.userId.string()).toEqual(id.string());
    expect(authPubSigs.userId.string()).toEqual(basicMessg.from);
  });
});
