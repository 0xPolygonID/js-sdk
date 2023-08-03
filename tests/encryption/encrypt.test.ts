import { expect } from 'chai';
import { EncryptionService } from '../../src/encryption/encryption-service';

describe('encrypt tests', () => {
  it('encrypt service works', async () => {
    const encryptService = new EncryptionService<string>({
      password: 'p@ssword1'
    });
    const testSecret = 'private-key-122333441';
    const encryptedSecret = await encryptService.encrypt(testSecret);
    expect(testSecret).to.be.not.equal(encryptedSecret);
    const decryptedSecred = await encryptService.decrypt(encryptedSecret);
    expect(testSecret).to.be.equal(decryptedSecred);

    const newEncryptService = new EncryptionService<string>({
      password: 'p@ssword'
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
});
