import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { Hex, PrivateKey, PublicKey } from '@iden3/js-crypto'
import { expect } from 'chai';

describe('import', () => {
  let bjjProvider: BjjProvider;

  const keyBytes = Hex.decodeString(
    '2d45d0cb81682bde9883a326ba1344208193b76f36091274f45b4c4940faed5b'
  );

  beforeEach(async () => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
  });

  it('baby jub jub into provider', async () => {
    const privateKey = new PrivateKey(keyBytes);
    const pubKey = privateKey.public();

    const kmsKeyId = await bjjProvider.importPrivateKey(keyBytes);
    const { type: keyType, id: keyId } = kmsKeyId;
    expect(keyType).to.equal(KmsKeyType.BabyJubJub);
    expect(keyId).to.equal(`${keyType}:${pubKey.hex()}`);

    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);
    const pub = await kms.publicKey(kmsKeyId) as PublicKey;
    expect(pub.p[0]).to.equal(pubKey.p[0]);
    expect(pub.p[1]).to.equal(pubKey.p[1]);
  });


  it('baby jub jub into kms', async () => {
    const privateKey = new PrivateKey(keyBytes);
    const pubKey = privateKey.public();

    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

    const kmsKeyId = await kms.importKeyFromBytes(KmsKeyType.BabyJubJub, keyBytes);
    const { type: keyType, id: keyId } = kmsKeyId;
    expect(keyType).to.equal(KmsKeyType.BabyJubJub);
    expect(keyId).to.equal(`${keyType}:${pubKey.hex()}`);

    const pub = await kms.publicKey(kmsKeyId) as PublicKey;
    expect(pub.p[0]).to.equal(pubKey.p[0]);
    expect(pub.p[1]).to.equal(pubKey.p[1]);
  });
});
