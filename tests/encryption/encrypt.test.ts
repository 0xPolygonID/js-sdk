import { expect } from 'chai';
import { EncryptionService } from '../../src/encryption/encryption-service';
import { EncryptedKeyStore } from '../../src/encryption/encrypted-key-store';
import { InMemoryPrivateKeyStore, LocalStoragePrivateKeyStore } from '../../src/kms';

describe('encrypt tests', () => {
  const encryptionPassword = process.env.ENCRYPTION_PASSWORD as string;
  it('encrypt service works', async () => {
    const encryptService = new EncryptionService<string>({
      password: encryptionPassword
    });
    const testSecret = 'private-key-122333441';
    const encryptedSecret = await encryptService.encrypt(testSecret);
    expect(testSecret).to.be.not.equal(encryptedSecret);
    const decryptedSecred = await encryptService.decrypt(encryptedSecret);
    expect(testSecret).to.be.equal(decryptedSecred);

    const newEncryptService = new EncryptionService<string>({
      password: encryptionPassword
    });
    newEncryptService
      .decrypt(encryptedSecret)
      .then(function () {
        throw new Error('was not supposed to succeed');
      })
      .catch((m) => {
        expect((m as Error).message).to.contains(`Incorrect password`);
      });
  });

  it('encrypt key-store works', async () => {
    const storegTypes = [InMemoryPrivateKeyStore, LocalStoragePrivateKeyStore];

    const testKeyStore = async (t: any) => {
      const memoryKeyStore = new EncryptedKeyStore<typeof t>(t, {
        password: encryptionPassword
      });

      const testSecret = 'private-key-122333441';
      await memoryKeyStore.importKey({ alias: 'test', key: testSecret });
      const decryptedSecred = await memoryKeyStore.get({ alias: 'test' });
      expect(testSecret).to.be.equal(decryptedSecred);
    };

    for (let i = 0; i < storegTypes.length; i++) {
      await testKeyStore(storegTypes[i]);
    }
  });
});
