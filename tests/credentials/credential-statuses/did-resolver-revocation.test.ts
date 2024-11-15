import { DID } from '@iden3/js-iden3-core';
import {
  CredentialStatusResolver,
  CredentialStatusType,
  DidDocumentCredentialStatusResolver
} from '../../../src';

import chai from 'chai';
import spies from 'chai-spies';

chai.use(spies);
const expect = chai.expect;

describe.skip('did document revocation checks', () => {
  let credentialStatusResolver: CredentialStatusResolver;

  beforeEach(async () => {
    credentialStatusResolver = new DidDocumentCredentialStatusResolver('http://127.0.0.1:8080');
  });

  it('resolver works', async () => {
    const revocationStatus = await credentialStatusResolver.resolve(
      {
        id: 'did:iden3:linea:sepolia:28qZMExF5v2HevdLP7utHnAQazQHetsa7tsc4NCwyT/credentialStatus?revocationNonce=1000&contractAddress=59141:0x7dF78ED37d0B39Ffb6d4D527Bb1865Bf85B60f81&state=cc17961a8e92bc3836cecee42b7812d67c0d8a7829076337260c4782df124c03',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 1000
      },
      { issuerDID: DID.parse('did:iden3:linea:sepolia:28qZMExF5v2HevdLP7utHnAQazQHetsa7tsc4NCwyT') }
    );

    expect(revocationStatus).to.be.an('object');
    expect(revocationStatus).to.have.property('issuer');
    expect(revocationStatus).to.have.property('mtp');
    expect(revocationStatus.issuer.state).to.be.not.empty;
  });
});
