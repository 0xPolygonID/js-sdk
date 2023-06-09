import { InMemoryPrivateKeyStore } from './../../src/kms/store/memory-key-store';
import { KMS } from './../../src/kms/kms';
import {
  JWSPacker,
  KmsKeyType,
  Sec256k1Provider,
  byteDecoder,
  byteEncoder,
  bytesToHex,
  hexToBytes,
  keyPath
} from '../../src';
import { expect } from 'chai';
import { DIDResolutionResult } from 'did-resolver';
import { sha256 } from 'cross-sha256';
import { ec as EC } from 'elliptic';
import * as secp from '@noble/secp256k1';
import { log } from 'console';
import { ES256KSigner } from 'did-jwt';

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
  const did = 'did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65#Recovery2020';
  let kms: KMS;
  let resolveDIDDocument: { resolve: (did: string) => Promise<DIDResolutionResult> };
  let packer: JWSPacker;

  const bodyMsgStr = `{
    "id": "f1425f32-b1b2-4f2e-9e12-579b543f2aab",
    "typ": "application/iden3comm-signed-json",
    "type": "https://iden3-communication.io/authorization/1.0/response",
    "thid": "5b9bceac-dd85-4f93-b584-7c76b6c100d7",
    "body": {
      "scope": []
    },
    "from": "did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65#Recovery2020",
    "to": "did:polygonid:polygon:mumbai:2qLPqvayNQz9TA2r5VPxUugoF18teGU583zJ859wfy"
  }`;
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
    // const ec = new EC('secp256k1');
    // const pk = '88a79135b9260ade920bf7d9972c4ea81120fabc731b8c99a47d694eaab37de5';
    // const keyEC = ec.keyFromPrivate(pk);

    // const pubKeyN = secp.getPublicKey(hexToBytes(pk));

    // const pubKey = keyEC.getPublic().encode('hex');
    // const ethWallet = new Wallet(pk);

    // log('pubKey', pubKey);
    // log('pubKeyN', secp.utils.bytesToHex(pubKeyN));
    // log('ethWallet', ethWallet.signingKey.publicKey);
    // log('ethWallet', ethWallet.address);

    // const tokenBytes = await packer.pack(msgBytes, {
    //   did: did,
    //   kid: did,
    //   alg: 'ES256K-R',

    //   signer: (_: any, msg: any) => {
    //     return async () => {
    //       const msgHash = new sha256().update(msg).digest();

    //       const signatureEthWallet = ethWallet.signingKey.sign(msgHash);

    //       // const signature = secp.sign(msgHash, pk);

    //       const signatureElliptic = ec.sign(msgHash, keyEC.getPrivate());
    //       const s = await ES256KSigner(hexToBytes(pk), true)(msgHash);
    //       log('s', s);
    //       log('signatureElliptic.r', signatureElliptic.r);
    //       log('signatureEthWallet.r', signatureEthWallet.r);
    //       log('signatureElliptic.s', signatureElliptic.s);
    //       log('signatureEthWallet.s', signatureEthWallet.s);
    //       // verify
    //       const verifyElliptic = ec.verify(
    //         msgHash,
    //         {
    //           r: hexToBytes(signatureEthWallet.r),
    //           s: hexToBytes(signatureEthWallet.s),
    //           recoveryParam:
    //             signatureEthWallet.v === 27
    //               ? 0
    //               : signatureEthWallet.v === 28
    //               ? 1
    //               : signatureEthWallet.v
    //         },
    //         keyEC.getPublic()
    //       );

    //       log('verifyElliptic', verifyElliptic);

    //       const verifyEthWallet = ethers.recoverAddress(msgHash, signatureEthWallet);

    //       log('verifyEthWallet', verifyEthWallet);

    //       const recoveryId = ec.getKeyRecoveryParam(msgHash, signatureElliptic, keyEC.getPublic());
    //       // msgHash must be decimal number
    //       const recoveredPubKey = ec
    //         .recoverPubKey(msgHash, signatureElliptic, recoveryId)
    //         .encode('hex');
    //       log('recoveredPubKey', recoveredPubKey);
    //       // const bytes = hexToBytes(signatureEthWallet);
    //       return '';
    //     };
    //   }
    // });

    // const token = byteDecoder.decode(tokenBytes);
    // console.log(token);

    const t = byteEncoder.encode(
      `eyJhbGciOiJFUzI1NkstUiIsImtpZCI6ImRpZDpwa2g6cG9seToweDcxNDFFNGQyMEY3NjQ0REM4YzBBZENBOGE1MjBFQzgzQzZjQUJENjUjUmVjb3ZlcnkyMDIwIiwidHlwIjoiYXBwbGljYXRpb24vaWRlbjNjb21tLXNpZ25lZC1qc29uIn0.eyJpZCI6IjA3ZWRhYzM2LWFlZmYtNGVhMy04ZWY2LWI4Nzk4ODk3NzVhMiIsInR5cCI6ImFwcGxpY2F0aW9uL2lkZW4zY29tbS1zaWduZWQtanNvbiIsInR5cGUiOiJodHRwczovL2lkZW4zLWNvbW11bmljYXRpb24uaW8vYXV0aG9yaXphdGlvbi8xLjAvcmVzcG9uc2UiLCJ0aGlkIjoiZmI3YWQ1ZDItNWI1MC00NWRhLThiODAtNzMxNzFlMjE3Zjc0IiwiYm9keSI6eyJzY29wZSI6W119LCJmcm9tIjoiZGlkOnBraDpwb2x5OjB4NzE0MUU0ZDIwRjc2NDREQzhjMEFkQ0E4YTUyMEVDODNDNmNBQkQ2NSNSZWNvdmVyeTIwMjAiLCJ0byI6ImRpZDpwb2x5Z29uaWQ6cG9seWdvbjptdW1iYWk6MnFKNjg5a3BvSnhjU3pCNXNBRkp0UHNTQlNySEY1ZHE3MjJCSE1xVVJMIn0.uK2bpgdZJV_doN-O49335oi3mzVFY_sji_Ze7-y7soHa_f34HjXhdQF0NbQiJ50Ih2m9MFSkTk8rs2ruXnZ-dgA`
    );

    const data = await packer.unpack(t);
    expect(data).to.not.be.undefined;
  });
});
