import { Adapter } from '../../src/onchain-credential-adapter/adapter';
import { RPC_URL, IPFS_URL } from '../helpers';
import { DID } from '@iden3/js-iden3-core';
import balanceCredentialHttpSchema from './testdata/balance_credential_http_schema.json';
import balanceCredentialIpfsSchema from './testdata/balance_credential_ipfs_schema.json';
import { W3CCredential } from '@0xpolygonid/js-sdk';
import { expect } from 'chai';

describe('Adapter', () => {
  it('Test adapter for v0.0.1 HTTP schema', async () => {
    const issuerDid = DID.parse(
      'did:polygonid:polygon:amoy:2qQ68JkRcf3xyDFsGSWU5QqxbKpzM75quxS628JgvJ'
    );
    const userId = DID.idFromDID(
      DID.parse('did:polygonid:polygon:amoy:2qQ68JkRcf3xyDFsGSWU5QqxbKpzM75quxS628JgvJ')
    );
    const adapter = new Adapter(RPC_URL, issuerDid);
    const cred = await adapter.getCredential(userId, BigInt(6));
    expect(W3CCredential.fromJSON(balanceCredentialHttpSchema)).to.deep.equal(cred);
  });

  it('Test adapter for v0.0.1 IPFS schema', async () => {
    const issuerDid = DID.parse(
      'did:polygonid:polygon:amoy:2qQ68JkRcf3z3923i5rrszrsJ4kdu4GKWARQ5eftsB'
    );
    const userId = DID.idFromDID(
      DID.parse('did:polygonid:polygon:amoy:2qZYiH9CFMoo6oTjSEot3qzkHFHhjLRLKp8yfwCYng')
    );
    const adapter = new Adapter(RPC_URL, issuerDid, {
      ipfsGatewayURL: IPFS_URL
    });
    const cred = await adapter.getCredential(userId, BigInt(0));
    expect(W3CCredential.fromJSON(balanceCredentialIpfsSchema)).to.deep.equal(cred);
  });
});