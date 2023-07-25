import { OnChainResolver } from '../../src/credentials/status/on-chain-revocation';
import { CredentialStatusType } from '../../src';
import { expect } from 'chai';

describe('on chain', () => {
  it('extract information from credentialStatus.id', async () => {
    const status = new OnChainResolver([]);
    const { contractAddress, chainId, revocationNonce, issuer } =
      await status.extractCredentialStatusInfo({
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?revocationNonce=1234&contractAddress=80001:0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 0
      });
    expect(contractAddress).to.equal('0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2');
    expect(chainId).to.equal(80001);
    expect(revocationNonce).to.equal(1234);
    expect(issuer).to.equal(
      'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6'
    );
  });
  it('extract information from DID', async () => {
    const status = new OnChainResolver([]);
    const { contractAddress, chainId, revocationNonce, issuer } =
      await status.extractCredentialStatusInfo({
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 1234
      });
    expect(contractAddress).to.equal('0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2');
    expect(chainId).to.equal(80001);
    expect(revocationNonce).to.equal(1234);
    expect(issuer).to.equal(
      'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6'
    );
  });
  it('revocation nonce is 0 on id', async () => {
    const status = new OnChainResolver([]);
    const { contractAddress, chainId, revocationNonce, issuer } =
      await status.extractCredentialStatusInfo({
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?revocationNonce=0',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: undefined
      });
    expect(contractAddress).to.equal('0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2');
    expect(chainId).to.equal(80001);
    expect(revocationNonce).to.equal(0);
    expect(issuer).to.equal(
      'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6'
    );
  });
  it('revocation nonce is 0 on credentialStatus', async () => {
    const status = new OnChainResolver([]);
    const { contractAddress, chainId, revocationNonce, issuer } =
      await status.extractCredentialStatusInfo({
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 0
      });
    expect(contractAddress).to.equal('0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2');
    expect(chainId).to.equal(80001);
    expect(revocationNonce).to.equal(0);
    expect(issuer).to.equal(
      'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6'
    );
  });
  it('extract information from eth main net DID', async () => {
    const status = new OnChainResolver([]);
    const { contractAddress, chainId, revocationNonce, issuer } =
      await status.extractCredentialStatusInfo({
        id: 'did:polygonid:eth:2tCntr26bxYnTERr7uTX3mDU182tTTKGmye8T4uwtM/credentialStatus',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 4321
      });
    expect(contractAddress).to.equal('0xC26880A0AF2EA0c7E8130e6EC47Af756465452E8');
    expect(chainId).to.equal(1);
    expect(revocationNonce).to.equal(4321);
    expect(issuer).to.equal('did:polygonid:eth:2tCntr26bxYnTERr7uTX3mDU182tTTKGmye8T4uwtM');
  });

  // FAILING TESTS
  it('invalid id format', () => {
    const status = new OnChainResolver([]);
    expect(() => {
      status.extractCredentialStatusInfo({
        id: 'did:polygonid:eth:2tCntr26bxYnTERr7uTX3mDU182tTTKGmye8T4uwtM',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 4321
      });
    }).to.throw('invalid credentialStatus id');
  });
  it('invalid contract address format', () => {
    const status = new OnChainResolver([]);
    expect(() => {
      status.extractCredentialStatusInfo({
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus?revocationNonce=1234&contractAddress=0x2fCE183c7Fbc4EbB5DB3B0F5a63e0e02AE9a85d2',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: 4321
      });
    }).to.throw('invalid contract address encoding. should be chainId:contractAddress');
  });
  it('revocationNonce is empty', () => {
    const status = new OnChainResolver([]);
    expect(() => {
      status.extractCredentialStatusInfo({
        id: 'did:polygonid:polygon:mumbai:2qCU58EJgrELbXjWbWGC9kPPnczQdp93nUR6LC45F6/credentialStatus',
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
        revocationNonce: undefined
      });
    }).to.throw('revocationNonce not found in credentialStatus id field');
  });
});
