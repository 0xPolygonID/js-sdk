import {
  DataPrepareHandlerFunc,
  PackageManager,
  VerificationHandlerFunc,
  ZKPPacker
} from '../../src/iden3comm/index';
import { mockPrepareAuthInputs, mockVerifyState, ProvingMethodGroth16Authv2 } from './mock/proving';
import { proving, ProvingMethodAlg, ProvingMethod } from '@iden3/js-jwz';
import { DID } from '@iden3/js-iden3-core';
import {
  CredentialFetchRequestMessage,
  ProvingParams,
  VerificationParams
} from '../../src/iden3comm/types';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { byteDecoder, byteEncoder } from '../../src';

const { registerProvingMethod } = proving;
import { expect } from 'chai';
describe('tests packageManager with ZKP Packer', () => {
  it('tests package manager with zkp  packer', async () => {
    const pm = new PackageManager();
    const mockAuthInputsHandler = new DataPrepareHandlerFunc(mockPrepareAuthInputs);

    const mockProvingMethod = new ProvingMethodGroth16Authv2(
      new ProvingMethodAlg('groth16-mock', 'authV2')
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

    const p = new ZKPPacker(mockProvingParamMap, mockVerificationParamMap);

    pm.registerPackers([p]);

    const identifier = 'did:iden3:polygon:mumbai:x4jcHP4XHTK3vX58AHZPyHE8kYjneyE6FZRfz7K29';
    const senderDID = DID.parse(identifier);

    const targetIdentifier = 'did:iden3:polygon:mumbai:wzWeGdtjvKtUP1oTxQP5t5iZGDX3HNfEU5xR8MZAt';
    const targetID = DID.parse(targetIdentifier);

    const msgBytes = byteEncoder.encode(
      JSON.stringify(createFetchCredentialMessage(MediaType.ZKPMessage, senderDID, targetID))
    );

    const e = await pm.pack(MediaType.ZKPMessage, msgBytes, {
      senderDID,
      provingMethodAlg: new ProvingMethodAlg('groth16-mock', 'authV2')
    });

    const { unpackedMessage, unpackedMediaType } = await pm.unpack(e);
    expect(unpackedMediaType).to.deep.equal(MediaType.ZKPMessage);
    expect(senderDID.string()).to.deep.equal(unpackedMessage.from);
    expect(byteDecoder.decode(msgBytes)).to.deep.equal(JSON.stringify(unpackedMessage));
  });
});

const createFetchCredentialMessage = (typ: MediaType, from: DID, to: DID) => {
  const msg: CredentialFetchRequestMessage = {
    id: '',
    from: from.string(),
    to: to.string(),
    typ: typ,
    type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE,
    body: {
      id: ''
    }
  };

  return msg;
};
