import { PackageManager, RefreshHandler } from '../../src';
import { credWithRefreshService } from '../credentials/mock';
import { initZKPPacker } from '../iden3comm/mock/proving';
import fetchMock from '@gr2m/fetch-mock';
import { expect } from 'chai';

describe('refresh-service', () => {
  it('refresh service returns cred', async () => {
    const credToRefresh = credWithRefreshService;

    const packageManager = new PackageManager();
    const zkpPacker = await initZKPPacker({ alg: 'groth16' });
    packageManager.registerPackers([zkpPacker]);
    const refreshService = new RefreshHandler({
      packageManager
    });

    const refreshedCred = JSON.parse(JSON.stringify(credWithRefreshService));
    refreshedCred.expirationDate = new Date().setMinutes(new Date().getMinutes() + 1);
    const refreshedId = 'test1_refreshed';
    refreshedCred.id = refreshedId;
    fetchMock.spy();
    fetchMock.post('http://test-refresh/100', {
      body: {
        // CredentialIssuanceMessage
        id: 'uuid',
        body: {
          credential: refreshedCred
        }
      }
    });

    const newCred = await refreshService.refreshCredential(credToRefresh, { reason: 'expired' });

    expect(newCred.id).to.be.equal(refreshedId);
  });
});
