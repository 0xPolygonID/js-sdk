import {
  DataPrepareHandlerFunc,
  PackageManger,
  VerificationHandlerFunc
} from '../../src/iden3comm/index';
import ZKPPacker from '../../src/iden3comm/packers/zkp';
import {
  mockPrepareAuthInputs,
  mockVerifyState,
  ProvingMethodGroth16Authv2
} from './mock/proving';
import { proving, ProvingMethodAlg, ProvingMethod } from '@iden3/js-jwz';
import { DID } from '@iden3/js-iden3-core';
import {
  CredentialFetchRequestMessage,
  MediaType,
  ProvingParams,
  VerificationParams
} from '../../src/iden3comm/types';
import { MEDIA_TYPE, PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';

const { registerProvingMethod } = proving;

describe('tests packageManager with ZKP Packer', () => {
  it('tests package manager with zkp  packer', async () => {
    const pm = new PackageManger();

    const byteEncoder = new TextEncoder();
    const byteDecoder = new TextDecoder();

    const mockAuthInputsHandler = new DataPrepareHandlerFunc(mockPrepareAuthInputs);

    const mockProvingMethod = new ProvingMethodGroth16Authv2(
      new ProvingMethodAlg('groth16-mock', 'authV2')
    );

    await registerProvingMethod(mockProvingMethod.methodAlg, (): ProvingMethod => {
      return mockProvingMethod;
    });

    const verificationFn = new VerificationHandlerFunc(mockVerifyState);
    const mapKey = JSON.stringify(mockProvingMethod.methodAlg);

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

    const p = new ZKPPacker(mockProvingParamMap, mockVerificationParamMap);

    pm.registerPackers([p]);

    const identifier = 'did:iden3:polygon:mumbai:x4jcHP4XHTK3vX58AHZPyHE8kYjneyE6FZRfz7K29';
    const senderDID = DID.parse(identifier);

    const targetIdentifier = 'did:iden3:polygon:mumbai:wzWeGdtjvKtUP1oTxQP5t5iZGDX3HNfEU5xR8MZAt';
    const targetID = DID.parse(targetIdentifier);

    const msgBytes = byteEncoder.encode(
      JSON.stringify(
        createFetchCredentialMessage(MEDIA_TYPE.MEDIA_TYPE_ZKP_MESSAGE, senderDID, targetID)
      )
    );

    const e = await pm.pack(MEDIA_TYPE.MEDIA_TYPE_ZKP_MESSAGE, msgBytes, {
      senderID: senderDID,
      provingMethodAlg: new ProvingMethodAlg('groth16-mock', 'authV2')
    });

    const { unpackedMessage, unpackedMediaType } = await pm.unpack(e);
    expect(unpackedMediaType).toEqual(MEDIA_TYPE.MEDIA_TYPE_ZKP_MESSAGE);
    expect(senderDID.toString()).toEqual(unpackedMessage.from);
    expect(byteDecoder.decode(msgBytes)).toEqual(JSON.stringify(unpackedMessage));
  });
});

const createFetchCredentialMessage = (typ: MediaType, from: DID, to: DID) => {
  const msg: CredentialFetchRequestMessage = {
    id: '',
    from: from.toString(),
    to: to.toString(),
    typ: typ,
    type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE,
    body: {
      id: ''
    }
  };

  return msg;
};
