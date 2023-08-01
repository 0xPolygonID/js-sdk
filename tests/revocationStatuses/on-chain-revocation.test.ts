import { OnChainResolver } from '../../src/credentials/status/on-chain-revocation';
import { CredentialStatusType } from '../../src';
import { expect } from 'chai';

describe('on chain revocation:', () => {
  const testCases = [
    {
      name: 'extract information from credentialStatus.id',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?revocationNonce=1234&contractAddress=80001:0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 0
      },
      output: {
        contractAddress: '0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        chainId: 80001,
        revocationNonce: 1234,
        issuer: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6'
      }
    },
    {
      name: 'extract information from DID',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 1234
      },
      output: {
        contractAddress: '0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        chainId: 80001,
        revocationNonce: 1234,
        issuer: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6'
      }
    },
    {
      name: 'revocation nonce is 0 on id',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?revocationNonce=0',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: undefined
      },
      output: {
        contractAddress: '0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        chainId: 80001,
        revocationNonce: 0,
        issuer: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6'
      }
    },
    {
      name: 'revocation nonce is 0 on credentialStatus',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 0
      },
      output: {
        contractAddress: '0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        chainId: 80001,
        revocationNonce: 0,
        issuer: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6'
      }
    },
    {
      name: 'extract information from eth main net DID',
      input: {
        id: 'did:polygonid:eth:2tCntr26bxYnTERr7uTX3mDU182tTTKGmye8T4uwtM/credentialStatus',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 4321
      },
      output: {
        contractAddress: '0xC26880A0AF2EA0c7E8130e6EC47Af756465452E8',
        chainId: 1,
        revocationNonce: 4321,
        issuer: 'did:polygonid:eth:2tCntr26bxYnTERr7uTX3mDU182tTTKGmye8T4uwtM'
      }
    },
    {
      name: 'invalid id format',
      input: {
        id: 'did:polygonid:eth:2tCntr26bxYnTERr7uTX3mDU182tTTKGmye8T4uwtM',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 4321
      },
      error: 'invalid credentialStatus id'
    },
    {
      name: 'invalid contract address format',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?revocationNonce=1234&contractAddress=0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 4321
      },
      error: 'invalid contract address encoding. should be chainId:contractAddress'
    },
    {
      name: 'revocationNonce is empty',
      input: {
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: undefined
      },
      error: 'revocationNonce not found in credentialStatus id field'
    }
  ];

  for (const testCase of testCases) {
    it(testCase.name, () => {
      const status = new OnChainResolver([]);

      if (testCase.error) {
        expect(() => status.extractCredentialStatusInfo(testCase.input)).to.throw(testCase.error);
        return;
      }
      const expectedOutput = status.extractCredentialStatusInfo(testCase.input);
      expect(expectedOutput).to.deep.equal(testCase.output);
    });
  }
});
