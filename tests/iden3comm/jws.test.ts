import { InMemoryPrivateKeyStore } from './../../src/kms/store/memory-key-store';
import { KMS } from './../../src/kms/kms';
import {
  JWSPacker,
  KmsKeyType,
  Sec256k1Provider,
  SignerFn,
  base64UrlToBytes,
  byteEncoder,
  bytesToBase64url,
  hexToBytes,
  isEthereumIdentity,
  keyPath
} from '../../src';
import { expect } from 'chai';
import { DIDResolutionResult } from 'did-resolver';
import { ES256KSigner } from 'did-jwt';
import { DID, getChainId, Id } from '@iden3/js-iden3-core';
import { Hex } from '@iden3/js-crypto';
import { MediaType } from '../../src/iden3comm/constants';

const didExample = {
  '@context': [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
    {
      esrs2020: 'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020#',
      privateKeyJwk: {
        '@id': 'esrs2020:privateKeyJwk',
        '@type': '@json'
      },
      publicKeyHex: 'esrs2020:publicKeyHex',
      privateKeyHex: 'esrs2020:privateKeyHex',
      ethereumAddress: 'esrs2020:ethereumAddress'
    }
  ],
  id: 'did:example:123',
  verificationMethod: [
    {
      id: 'did:example:123#JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw',
      controller: 'did:example:123',
      type: 'EcdsaSecp256k1VerificationKey2019',
      publicKeyJwk: {
        crv: 'secp256k1',
        kid: 'JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw',
        kty: 'EC',
        x: bytesToBase64url(
          hexToBytes('fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479')
        ),
        y: bytesToBase64url(
          hexToBytes('46393f8145252eea68afe67e287b3ed9b31685ba6c3b00060a73b9b1242d68f7')
        )
      }
    }
  ],
  authentication: ['did:example:123#JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw']
};

const didExampleRecovery = {
  '@context': [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/secp256k1recovery-2020/v2'
  ],
  id: 'did:iden3:privado:main:2SZDsdYordSH49VhS6hGo164RLwfcQe9FGow5ftSUG',
  verificationMethod: [
    {
      id: 'did:iden3:privado:main:2SZDsdYordSH49VhS6hGo164RLwfcQe9FGow5ftSUG#vm-1',
      controller: 'did:iden3:privado:main:2SZDsdYordSH49VhS6hGo164RLwfcQe9FGow5ftSUG',
      type: 'EcdsaSecp256k1RecoveryMethod2020',
      blockchainAccountId: 'eip155:21000:0x964e496a1b2541ed029abd5e49fd01e41cd02995'
    }
  ],
  authentication: ['did:iden3:privado:main:2SZDsdYordSH49VhS6hGo164RLwfcQe9FGow5ftSUG#vm-1']
};

describe('jws packer tests', () => {
  const did = 'did:example:123';
  let kms: KMS;
  let resolveDIDDocument: { resolve: (did: string) => Promise<DIDResolutionResult> };
  let packer: JWSPacker;

  const bodyMsgStr = `{"type":"https://iden3-communication.io/authorization/1.0/response","from": "${did}", "body":{"scope":[{"type":"zeroknowledge","circuit_id":"auth","pub_signals":["1","18311560525383319719311394957064820091354976310599818797157189568621466950811","323416925264666217617288569742564703632850816035761084002720090377353297920"],"proof_data":{"pi_a":["11130843150540789299458990586020000719280246153797882843214290541980522375072","1300841912943781723022032355836893831132920783788455531838254465784605762713","1"],"pi_b":[["20615768536988438336537777909042352056392862251785722796637590212160561351656","10371144806107778890538857700855108667622042215096971747203105997454625814080"],["19598541350804478549141207835028671111063915635580679694907635914279928677812","15264553045517065669171584943964322117397645147006909167427809837929458012913"],["1","0"]],"pi_c":["16443309279825508893086251290003936935077348754097470818523558082502364822049","2984180227766048100510120407150752052334571876681304999595544138155611963273","1"],"protocol":""}}]}}`;
  const sk = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f';
  beforeEach(async () => {
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

  it('pack / unpack: kid', async () => {
    const msgBytes = byteEncoder.encode(bodyMsgStr);

    const tokenBytes = await packer.pack(msgBytes, {
      alg: 'ES256K',
      did,
      kid: 'did:example:123#JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw',
      issuer: did
    });

    const data = await packer.unpack(tokenBytes);
    expect(data).to.not.be.undefined;
  });

  it('pack / unpack: EcdsaSecp256k1RecoveryMethod2020 verification method', async () => {
    const recoveryDIDDocument = {
      resolve: () => Promise.resolve({ didDocument: didExampleRecovery } as DIDResolutionResult)
    };
    const recoveryPacker = new JWSPacker(kms, recoveryDIDDocument);
    const ethDidString = 'did:iden3:privado:main:2SZDsdYordSH49VhS6hGo164RLwfcQe9FGow5ftSUG';
    const ethDidPk = '7365656473656564656565657365656473656564736565647365656475736572';
    const ethDid = DID.parse(ethDidString);
    if (isEthereumIdentity(ethDid)) {
      const bodyMsgStrRecovery = JSON.parse(bodyMsgStr);
      bodyMsgStrRecovery.from = ethDidString;
      const msgBytes = byteEncoder.encode(JSON.stringify(bodyMsgStrRecovery));

      const signer: SignerFn = async (_, data) => {
        const signatureBase64 = await ES256KSigner(hexToBytes(ethDidPk), false)(data);
        return base64UrlToBytes(signatureBase64.toString());
      };

      const tokenBytes = await recoveryPacker.pack(msgBytes, {
        alg: 'ES256K',
        did: ethDidString,
        issuer: did,
        signer
      });

      const data = await recoveryPacker.unpack(tokenBytes);
      expect(data).to.not.be.undefined;
    } else {
      throw new Error('Ethereum identity expected');
    }
  });

  it('returns EcdsaSecp256k1RecoveryMethod2020 VM from eth identity', async () => {
    const ethDidString = 'did:iden3:privado:main:2SZDsdYordSH49VhS6hGo164RLwfcQe9FGow5ftSUG';
    const ethDid = DID.parse(ethDidString);
    if (isEthereumIdentity(ethDid)) {
      const id = DID.idFromDID(ethDid);
      const chainId = getChainId(DID.blockchainFromId(id), DID.networkIdFromId(id));
      const address = Hex.encodeString(Id.ethAddressFromId(id));
      const vms = [
        {
          id: `${ethDidString}#vm-1`,
          controller: ethDidString,
          type: 'EcdsaSecp256k1RecoveryMethod2020',
          blockchainAccountId: `eip155:${chainId}:0x${address}`
        }
      ];
      expect(vms[0].blockchainAccountId).to.be.eq(
        didExampleRecovery.verificationMethod[0].blockchainAccountId
      );
    } else {
      throw new Error('Ethereum identity expected');
    }
  });

  it('pack / unpack: no kid', async () => {
    const msgBytes = byteEncoder.encode(bodyMsgStr);

    const tokenBytes = await packer.pack(msgBytes, {
      alg: 'ES256K',
      did,
      issuer: did
    });

    const data = await packer.unpack(tokenBytes);
    expect(data).to.not.be.undefined;
  });

  it('pack / unpack: external signer', async () => {
    const msgBytes = byteEncoder.encode(bodyMsgStr);

    const signer: SignerFn = async (_, data) => {
      const signatureBase64 = await ES256KSigner(hexToBytes(sk), false)(data);
      return base64UrlToBytes(signatureBase64.toString());
    };

    const tokenBytesSigner = await packer.pack(msgBytes, {
      alg: 'ES256K',
      did,
      issuer: did,
      signer
    });

    const tokenBytesKMS = await packer.pack(msgBytes, {
      alg: 'ES256K',
      did,
      issuer: did
    });

    const signerData = await packer.unpack(tokenBytesSigner);
    expect(signerData).to.not.be.undefined;
    const data = await packer.unpack(tokenBytesKMS);
    expect(data).to.not.be.undefined;
    expect(signerData).to.deep.equal(data);
  });

  it('unpack: no kid', async () => {
    const token =
      'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJhcHBsaWNhdGlvbi9pZGVuM2NvbW0tc2lnbmVkLWpzb24ifQ.eyJ0eXBlIjoiaHR0cHM6Ly9pZGVuMy1jb21tdW5pY2F0aW9uLmlvL2F1dGhvcml6YXRpb24vMS4wL3Jlc3BvbnNlIiwiZnJvbSI6ImRpZDpleGFtcGxlOjEyMyIsImJvZHkiOnsic2NvcGUiOlt7InR5cGUiOiJ6ZXJva25vd2xlZGdlIiwiY2lyY3VpdF9pZCI6ImF1dGgiLCJwdWJfc2lnbmFscyI6WyIxIiwiMTgzMTE1NjA1MjUzODMzMTk3MTkzMTEzOTQ5NTcwNjQ4MjAwOTEzNTQ5NzYzMTA1OTk4MTg3OTcxNTcxODk1Njg2MjE0NjY5NTA4MTEiLCIzMjM0MTY5MjUyNjQ2NjYyMTc2MTcyODg1Njk3NDI1NjQ3MDM2MzI4NTA4MTYwMzU3NjEwODQwMDI3MjAwOTAzNzczNTMyOTc5MjAiXSwicHJvb2ZfZGF0YSI6eyJwaV9hIjpbIjExMTMwODQzMTUwNTQwNzg5Mjk5NDU4OTkwNTg2MDIwMDAwNzE5MjgwMjQ2MTUzNzk3ODgyODQzMjE0MjkwNTQxOTgwNTIyMzc1MDcyIiwiMTMwMDg0MTkxMjk0Mzc4MTcyMzAyMjAzMjM1NTgzNjg5MzgzMTEzMjkyMDc4Mzc4ODQ1NTUzMTgzODI1NDQ2NTc4NDYwNTc2MjcxMyIsIjEiXSwicGlfYiI6W1siMjA2MTU3Njg1MzY5ODg0MzgzMzY1Mzc3Nzc5MDkwNDIzNTIwNTYzOTI4NjIyNTE3ODU3MjI3OTY2Mzc1OTAyMTIxNjA1NjEzNTE2NTYiLCIxMDM3MTE0NDgwNjEwNzc3ODg5MDUzODg1NzcwMDg1NTEwODY2NzYyMjA0MjIxNTA5Njk3MTc0NzIwMzEwNTk5NzQ1NDYyNTgxNDA4MCJdLFsiMTk1OTg1NDEzNTA4MDQ0Nzg1NDkxNDEyMDc4MzUwMjg2NzExMTEwNjM5MTU2MzU1ODA2Nzk2OTQ5MDc2MzU5MTQyNzk5Mjg2Nzc4MTIiLCIxNTI2NDU1MzA0NTUxNzA2NTY2OTE3MTU4NDk0Mzk2NDMyMjExNzM5NzY0NTE0NzAwNjkwOTE2NzQyNzgwOTgzNzkyOTQ1ODAxMjkxMyJdLFsiMSIsIjAiXV0sInBpX2MiOlsiMTY0NDMzMDkyNzk4MjU1MDg4OTMwODYyNTEyOTAwMDM5MzY5MzUwNzczNDg3NTQwOTc0NzA4MTg1MjM1NTgwODI1MDIzNjQ4MjIwNDkiLCIyOTg0MTgwMjI3NzY2MDQ4MTAwNTEwMTIwNDA3MTUwNzUyMDUyMzM0NTcxODc2NjgxMzA0OTk5NTk1NTQ0MTM4MTU1NjExOTYzMjczIiwiMSJdLCJwcm90b2NvbCI6IiJ9fV19fQ.W6gORh7uC47pv3Sg83meipfBbPoDplhc7aog2CCCausjhvjMJJN1u_N59gdwj5enWD0fworFbqGIv1y4sBvF3A';
    const tokenBytes = byteEncoder.encode(token);

    const data = await packer.unpack(tokenBytes);
    expect(data).to.not.be.undefined;
  });

  it('test getSupportedProfiles', async () => {
    const [accept] = await packer.getSupportedProfiles();
    expect(accept).to.be.eq(`iden3comm/v1;env=${MediaType.SignedMessage};alg=ES256K,ES256K-R`);
  });
});
