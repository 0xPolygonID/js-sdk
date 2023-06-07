import { InMemoryPrivateKeyStore } from './../../src/kms/store/memory-key-store';
import { KMS } from './../../src/kms/kms';
import {
  JWSPacker,
  KmsKeyType,
  Sec256k1Provider,
  byteDecoder,
  byteEncoder,
  bytesToBase64url,
  hexToBytes,
  keyPath
} from '../../src';
import { expect } from 'chai';
import { DIDResolutionResult } from 'did-resolver';

const didExample = {
  '@context': [
    'https://www.w3.org/ns/did/v1',
    {
      EcdsaSecp256k1RecoveryMethod2020:
        'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020#EcdsaSecp256k1RecoveryMethod2020',
      blockchainAccountId: 'https://w3id.org/security#blockchainAccountId'
    }
  ],
  id: 'did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65',
  verificationMethod: [
    {
      id: 'did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65#Recovery2020',
      type: 'EcdsaSecp256k1RecoveryMethod2020',
      controller: 'did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65',
      blockchainAccountId: 'eip155:137:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65'
    }
  ],
  authentication: ['did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65#Recovery2020'],
  assertionMethod: ['did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65#Recovery2020']
};

describe('jws packer tests', () => {
  const did = 'did:example:123';
  let kms: KMS;
  let resolveDIDDocument: { resolve: (did: string) => Promise<DIDResolutionResult> };
  let packer: JWSPacker;

  const bodyMsgStr = `{"type":"https://iden3-communication.io/authorization/1.0/response","from": "${did}", "body":{"scope":[{"type":"zeroknowledge","circuit_id":"auth","pub_signals":["1","18311560525383319719311394957064820091354976310599818797157189568621466950811","323416925264666217617288569742564703632850816035761084002720090377353297920"],"proof_data":{"pi_a":["11130843150540789299458990586020000719280246153797882843214290541980522375072","1300841912943781723022032355836893831132920783788455531838254465784605762713","1"],"pi_b":[["20615768536988438336537777909042352056392862251785722796637590212160561351656","10371144806107778890538857700855108667622042215096971747203105997454625814080"],["19598541350804478549141207835028671111063915635580679694907635914279928677812","15264553045517065669171584943964322117397645147006909167427809837929458012913"],["1","0"]],"pi_c":["16443309279825508893086251290003936935077348754097470818523558082502364822049","2984180227766048100510120407150752052334571876681304999595544138155611963273","1"],"protocol":""}}]}}`;
  beforeEach(async () => {
    const sk = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f';
    const pub =
      '04fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea535847946393f8145252eea68afe67e287b3ed9b31685ba6c3b00060a73b9b1242d68f7';

    const memoryKeyStore = new InMemoryPrivateKeyStore();
    await memoryKeyStore.importKey({ alias: keyPath(KmsKeyType.Secp256k1, pub), key: sk });
    resolveDIDDocument = {
      resolve: () => Promise.resolve({ didDocument: didExample } as DIDResolutionResult)
    };

    const kmsProvider = new Sec256k1Provider(KmsKeyType.Secp256k1, memoryKeyStore);

    kms = new KMS();

    kms.registerKeyProvider(kmsProvider.keyType, kmsProvider);

    packer = new JWSPacker(kms, resolveDIDDocument);
  });

  it.only('test did document resolves with publicKeyJwk pack/upack', async () => {
    // const msgBytes = byteEncoder.encode(bodyMsgStr);

    // const tokenBytes = await packer.pack(msgBytes, {
    //   alg: 'ES256K',
    //   did,
    //   issuer: did
    // });

    const token = byteEncoder.encode(
      `eyJhbGciOiJFUzI1NkstUiIsImtpZCI6ImRpZDpwa2g6cG9seToweDcxNDFFNGQyMEY3NjQ0REM4YzBBZENBOGE1MjBFQzgzQzZjQUJENjUjUmVjb3ZlcnkyMDIwIiwidHlwIjoiYXBwbGljYXRpb24vaWRlbjNjb21tLXNpZ25lZC1qc29uIn0.eyJpZCI6ImZhOGViZjMxLWFiNmUtNDA5MC05NmE3LTQ4YzdjMzIxYTJhZiIsInR5cCI6ImFwcGxpY2F0aW9uL2lkZW4zY29tbS1zaWduZWQtanNvbiIsInR5cGUiOiJodHRwczovL2lkZW4zLWNvbW11bmljYXRpb24uaW8vYXV0aG9yaXphdGlvbi8xLjAvcmVzcG9uc2UiLCJ0aGlkIjoiNWI5YmNlYWMtZGQ4NS00ZjkzLWI1ODQtN2M3NmI2YzEwMGQ3IiwiYm9keSI6eyJzY29wZSI6W119LCJmcm9tIjoiZGlkOnBraDpwb2x5OjB4NzE0MUU0ZDIwRjc2NDREQzhjMEFkQ0E4YTUyMEVDODNDNmNBQkQ2NSNSZWNvdmVyeTIwMjAiLCJ0byI6ImRpZDpwb2x5Z29uaWQ6cG9seWdvbjptdW1iYWk6MnFMUHF2YXlOUXo5VEEycjVWUHhVdWdvRjE4dGVHVTU4M3pKODU5d2Z5In0.1M_W2hk536HgRJIvDQtWlVF4KJzNw7BKqntQrwc885Fbtd-L3MPeprZD2DoR64TicN3tjFiQHoNJPcVHqNFZFBw`
    );

    const data = await packer.unpack(token);
    expect(data).to.not.be.undefined;
  });
});
