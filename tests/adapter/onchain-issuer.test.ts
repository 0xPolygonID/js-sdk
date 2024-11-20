import { OnchainIssuer } from '../../src/storage/blockchain/onchain-issuer';
import { RPC_URL, IPFS_URL } from '../helpers';
import { DID } from '@iden3/js-iden3-core';
import { W3CCredential } from '../../src/verifiable';
import { expect } from 'chai';
import { defaultEthConnectionConfig } from '../../src';

const balanceCredentialHttpSchema =
  '{"id":"urn:iden3:onchain:80002:0x19875eA86503734f2f9Ed461463e0312A3b42563:6","@context":["https://www.w3.org/2018/credentials/v1","https://schema.iden3.io/core/jsonld/iden3proofs.jsonld","https://gist.githubusercontent.com/ilya-korotya/660496c859f8d31a7d2a92ca5e970967/raw/6b5fc14fe630c17bfa52e05e08fdc8394c5ea0ce/non-merklized-non-zero-balance.jsonld","https://schema.iden3.io/core/jsonld/displayMethod.jsonld"],"type":["VerifiableCredential","Balance"],"expirationDate":"2024-05-24T10:29:56.000Z","issuanceDate":"2024-04-24T10:29:56.000Z","credentialSubject":{"address":"955350806412517903000132372584919937355495621189","balance":"439010757238782730","id":"did:polygonid:polygon:amoy:2qQ68JkRcf3xyDFsGSWU5QqxbKpzM75quxS628JgvJ","type":"Balance"},"credentialStatus":{"id":"did:polygonid:polygon:amoy:2qQ68JkRcf3xyDFsGSWU5QqxbKpzM75quxS628JgvJ/credentialStatus?revocationNonce=6\u0026contractAddress=80002:0x19875eA86503734f2f9Ed461463e0312A3b42563","type":"Iden3OnchainSparseMerkleTreeProof2023","revocationNonce":6},"issuer":"did:polygonid:polygon:amoy:2qQ68JkRcf3xyDFsGSWU5QqxbKpzM75quxS628JgvJ","credentialSchema":{"id":"https://gist.githubusercontent.com/ilya-korotya/e10cd79a8cc26ab6e40400a11838617e/raw/575edc33d485e2a4c806baad97e21117f3c90a9f/non-merklized-non-zero-balance.json","type":"JsonSchema2023"},"proof":[{"type":"Iden3SparseMerkleTreeProof","issuerData":{"id":"did:polygonid:polygon:amoy:2qQ68JkRcf3xyDFsGSWU5QqxbKpzM75quxS628JgvJ","state":{"rootOfRoots":"4078a4330d42e9d112b61500e538dc229cce10e2ffc50861c26c115b263c3214","claimsTreeRoot":"b087bb8fe253f1b04f8357f0844796bbec597e4def7fd76a19814d8159dcbb05","revocationTreeRoot":"0000000000000000000000000000000000000000000000000000000000000000","value":"006143913300b027d1d70878468aa0530dfea5a042f8325a826d409df7911512"}},"coreClaim":"f52f1795c533d7b4aa4e7ab02485f86f0a00000000000000000000000000000002130000000000000019875ea86503734f2f9ed461463e0312a3b425635f070045c28dba443bdace6830060f2d2784fa696957a70000000000000000000000000afbca2df5ad17060000000000000000000000000000000000000000000000000600000000000000246c50660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","mtp":{"existence":true,"siblings":["13848368485573735212679136988282305230819438728637424764846468785502433652840","1096649694805431452149042575143897926182559273612207814941177729902834445226","12160962874465332870109484495496045222172553451373175361415786953298859195139","3819622883660148852432672044432820232715025265850740602622985339171079887367","14062102965326789511040283612678585475708167692394425899926219149423935791693","8688920842723779052034352461580251823545042582416894537724528294186594808930","19295275136572781615245322801038686629126714006877213606851647038393713692426"]}}],"displayMethod":{"id":"ipfs://QmS8eY8ZCiAAW8qgx3T6SQ3HDGeddwLZsjPXNAZExQwRY4","type":"Iden3BasicDisplayMethodV1"}}';
const balanceCredentialIpfsSchema =
  '{"id":"urn:iden3:onchain:80002:0xFDb204CCC55794C861366dBc2Cd6BBBd25752894:0","@context":["https://www.w3.org/2018/credentials/v1","https://schema.iden3.io/core/jsonld/iden3proofs.jsonld","ipfs://Qma5B4jNwiHtRd5RXGoRncV79EZvB7LsfpHgv8Vi4xitV1","https://schema.iden3.io/core/jsonld/displayMethod.jsonld"],"type":["VerifiableCredential","Balance"],"expirationDate":"2024-05-24T16:23:56.000Z","issuanceDate":"2024-04-24T16:23:56.000Z","credentialSubject":{"address":"657065114158124047812701241180089030040156354062","balance":"34206141476401658683","id":"did:polygonid:polygon:amoy:2qZYiH9CFMoo6oTjSEot3qzkHFHhjLRLKp8yfwCYng","type":"Balance"},"credentialStatus":{"id":"did:polygonid:polygon:amoy:2qQ68JkRcf3z3923i5rrszrsJ4kdu4GKWARQ5eftsB/credentialStatus?revocationNonce=0\u0026contractAddress=80002:0xFDb204CCC55794C861366dBc2Cd6BBBd25752894","type":"Iden3OnchainSparseMerkleTreeProof2023","revocationNonce":0},"issuer":"did:polygonid:polygon:amoy:2qQ68JkRcf3z3923i5rrszrsJ4kdu4GKWARQ5eftsB","credentialSchema":{"id":"ipfs://QmcC7i1PCU8ymJscGjs8pqmZEWtBGWPFLmQ8s7P6QzELN6","type":"JsonSchema2023"},"proof":[{"type":"Iden3SparseMerkleTreeProof","issuerData":{"id":"did:polygonid:polygon:amoy:2qQ68JkRcf3z3923i5rrszrsJ4kdu4GKWARQ5eftsB","state":{"rootOfRoots":"ae476a5ee415f804663e9449c285e49e5cf239d1d2b95e77bf84543974acc113","claimsTreeRoot":"87df6035bab67e067892307e74c55c7c1a324e4b69a9390ee734c20ccac1fb18","revocationTreeRoot":"0000000000000000000000000000000000000000000000000000000000000000","value":"32a269e965d1486d20749ef071e1a03713703487edee224a7768ee1394288f11"}},"coreClaim":"f52f1795c533d7b4aa4e7ab02485f86f0a0000000000000000000000000000000213d0591345a3d71ee61cd299b38959df8dea1f4a4f75a2bd4f25b8215f0d000eb6cb518d3dd33341899bcec9dcc68998d117730000000000000000000000003b3baddd70a0b4da01000000000000000000000000000000000000000000000000000000000000001cbf50660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","mtp":{"existence":true,"siblings":["0","11379033735565694648078358700935740809038384149401106458334374311488117433921"]}}],"displayMethod":{"id":"ipfs://QmS8eY8ZCiAAW8qgx3T6SQ3HDGeddwLZsjPXNAZExQwRY4","type":"Iden3BasicDisplayMethodV1"}}';

describe('OnchainIssuer', () => {
  const copyDefaultEthConnectionConfig = { ...defaultEthConnectionConfig };
  copyDefaultEthConnectionConfig.url = RPC_URL;
  copyDefaultEthConnectionConfig.chainId = 80002;

  it('Test adapter for v0.0.1 HTTP schema', async () => {
    const issuerDid = DID.parse(
      'did:polygonid:polygon:amoy:2qQ68JkRcf3xyDFsGSWU5QqxbKpzM75quxS628JgvJ'
    );
    const userId = DID.idFromDID(
      DID.parse('did:polygonid:polygon:amoy:2qQ68JkRcf3xyDFsGSWU5QqxbKpzM75quxS628JgvJ')
    );
    const adapter = new OnchainIssuer([copyDefaultEthConnectionConfig], issuerDid);
    const cred = await adapter.getCredential(userId, BigInt(6));
    console.log(JSON.stringify(cred.toJSON(), null, 2));
    expect(W3CCredential.fromJSON(balanceCredentialHttpSchema)).to.deep.equal(cred);
  });

  it('Test adapter for v0.0.1 IPFS schema', async () => {
    const issuerDid = DID.parse(
      'did:polygonid:polygon:amoy:2qQ68JkRcf3z3923i5rrszrsJ4kdu4GKWARQ5eftsB'
    );
    const userId = DID.idFromDID(
      DID.parse('did:polygonid:polygon:amoy:2qZYiH9CFMoo6oTjSEot3qzkHFHhjLRLKp8yfwCYng')
    );
    const adapter = new OnchainIssuer([copyDefaultEthConnectionConfig], issuerDid, {
      ipfsNodeURL: IPFS_URL
    });
    const cred = await adapter.getCredential(userId, BigInt(0));
    expect(W3CCredential.fromJSON(balanceCredentialIpfsSchema)).to.deep.equal(cred);
  });
});
