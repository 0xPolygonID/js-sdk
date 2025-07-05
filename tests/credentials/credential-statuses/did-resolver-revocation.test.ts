import { DID } from '@iden3/js-iden3-core';
import {
  CredentialStatusResolver,
  CredentialStatusType,
  DidDocumentCredentialStatusResolver
} from '../../../src';

import { describe, expect, it, beforeEach } from 'vitest';

import nock from 'nock';

describe('did document revocation checks', () => {
  let credentialStatusResolver: CredentialStatusResolver;

  beforeEach(async () => {
    credentialStatusResolver = new DidDocumentCredentialStatusResolver(
      'http://my-universal-resolver'
    );
  });

  it('resolver works', async () => {
    nock('http://my-universal-resolver')
      .post(
        // eslint-disable-next-line @cspell/spellchecker
        '/1.0/credential-status/did%3Aiden3%3Alinea%3Asepolia%3A28qZMExF5v2HevdLP7utHnAQazQHetsa7tsc4NCwyT'
      )
      .reply(
        200,
        `{
        "issuer": {
            "state": "ce589b4e97b58202088feb0a9de25b53df78fcf7032d4bec0390a562302b4a1e",
            "rootOfRoots": "27735a9562a6b148e52fa9872e705b56b48f0b52dc2e9b6f1d063cf594c54f26",
            "claimsTreeRoot": "74730fecdb52486ffc7050496f253ac9ed12032ec29378be99f59d9fe5ba6f24",
            "revocationTreeRoot": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        "mtp": {
            "existence": false,
            "siblings": []
        }
    }`
      );

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
