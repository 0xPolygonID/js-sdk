import { InMemoryDataSource } from './../../src/storage/memory/data-source';
import { CredentialStorage } from './../../src/storage/shared/credential-storage';
import { AgentResolver } from '../../src/credentials';
import {
  W3CCredential,
  CredentialStatusType,
  ProofType,
  VerifiableConstants,
  W3CProofVerificationOptions
} from '../../src/verifiable';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { CredentialStatusResolverRegistry } from '../../src/credentials';
import { RHSResolver } from '../../src/credentials';
import {
  Identity,
  IdentityStorage,
  InMemoryMerkleTreeStorage,
  IStateStorage,
  Profile,
  RootInfo,
  StateInfo,
  StateProof
} from '../../src';
chai.use(chaiAsPromised);
const { expect } = chai;
import fetchMock from '@gr2m/fetch-mock';

const mockStateStorage: IStateStorage = {
  getLatestStateById: async (id: bigint) => {
    const stateInfo: StateInfo = {};
    if (
      id === BigInt('29305636064099160210536948077705157048478988844998217946273455478812643842')
    ) {
      stateInfo.state = BigInt(
        '4191494968776819400863455954888115392137551122958477943242938172592557294132'
      );
      return stateInfo;
    }
    if (
      id === BigInt('25116094451735045024912155729979573740232593171393457835171656777831420418')
    ) {
      throw new Error(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST);
    }
    return stateInfo;
  },
  publishState: async () => {
    return '0xc837f95c984892dbcc3ac41812ecb145fedc26d7003202c50e1b87e226a9b33c';
  },
  getGISTProof: (): Promise<StateProof> => {
    return Promise.resolve({
      root: 0n,
      existence: false,
      siblings: [],
      index: 0n,
      value: 0n,
      auxExistence: false,
      auxIndex: 0n,
      auxValue: 0n
    });
  },
  getGISTRootInfo: (): Promise<RootInfo> => {
    return Promise.resolve({
      root: 0n,
      replacedByRoot: 0n,
      createdAtTimestamp: 0n,
      replacedAtTimestamp: 0n,
      createdAtBlock: 0n,
      replacedAtBlock: 0n
    });
  }
};

const dataStorage = {
  credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
  identity: new IdentityStorage(
    new InMemoryDataSource<Identity>(),
    new InMemoryDataSource<Profile>()
  ),
  mt: new InMemoryMerkleTreeStorage(40),
  states: mockStateStorage
};

describe('Verify credential proof', () => {
  it('Validate BJJ signature proof', async () => {
    const input = `{
        "id": "urn:uuid:3a8d1822-a00e-11ee-8f57-a27b3ddbdc29",
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://schema.iden3.io/core/jsonld/iden3proofs.jsonld",
            "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld"
        ],
        "type": [
            "VerifiableCredential",
            "KYCAgeCredential"
        ],
        "expirationDate": "2361-03-21T21:14:48+02:00",
        "issuanceDate": "2023-12-21T16:35:46.737547+02:00",
        "credentialSubject": {
            "birthday": 19960424,
            "documentType": 2,
            "id": "did:polygonid:polygon:mumbai:2qH2mPVRN7ZDCnEofjeh8Qd2Uo3YsEhTVhKhjB8xs4",
            "type": "KYCAgeCredential"
        },
        "credentialStatus": {
            "id": "https://rhs-staging.polygonid.me/node?state=f9dd6aa4e1abef52b6c94ab7eb92faf1a283b371d263e25ac835c9c04894741e",
            "revocationNonce": 74881362,
            "statusIssuer": {
                "id": "https://ad40-91-210-251-7.ngrok-free.app/api/v1/identities/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf/claims/revocation/status/74881362",
                "revocationNonce": 74881362,
                "type": "SparseMerkleTreeProof"
            },
            "type": "Iden3ReverseSparseMerkleTreeProof"
        },
        "issuer": "did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf",
        "credentialSchema": {
            "id": "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json",
            "type": "JsonSchema2023"
        },
        "proof": [
            {
                "type": "BJJSignature2021",
                "issuerData": {
                    "id": "did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf",
                    "state": {
                        "claimsTreeRoot": "d946e9cb604bceb0721e4548c291b013647eb56a2cd755b965e6c3b840026517",
                        "value": "f9dd6aa4e1abef52b6c94ab7eb92faf1a283b371d263e25ac835c9c04894741e"
                    },
                    "authCoreClaim": "cca3371a6cb1b715004407e325bd993c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d7d1691a4202c0a1e580da2a87118c26a399849c42e52c4d97506a5bf5985923e6ec8ef6caeb482daa0d7516a864ace8fba2854275781583934349b51ba70c190000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "mtp": {
                        "existence": true,
                        "siblings": []
                    },
                    "credentialStatus": {
                        "id": "https://rhs-staging.polygonid.me/node?state=f9dd6aa4e1abef52b6c94ab7eb92faf1a283b371d263e25ac835c9c04894741e",
                        "revocationNonce": 0,
                        "statusIssuer": {
                            "id": "https://ad40-91-210-251-7.ngrok-free.app/api/v1/identities/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf/claims/revocation/status/0",
                            "revocationNonce": 0,
                            "type": "SparseMerkleTreeProof"
                        },
                        "type": "Iden3ReverseSparseMerkleTreeProof"
                    }
                },
                "coreClaim": "c9b2370371b7fa8b3dab2a5ba81b68382a000000000000000000000000000000021264874acc807e8862077487500a0e9b550a84d667348fc936a4dd0e730b00d4bfb0b3fc0b67c4437ee22848e5de1a7a71748c428358625a5fbac1cebf982000000000000000000000000000000000000000000000000000000000000000005299760400000000281cdcdf0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                "signature": "1783ff1c8207d3047a2ba6baa341dc8a6cb095e5683c6fb619ba4099d3332d2b209dca0a0676e41d4675154ea07662c7d9e14a7ee57259f85f3596493ac71a01"
            }
        ]
    }`;

    const credential = W3CCredential.fromJSON(JSON.parse(input));
    const resolverURL = 'http://my-universal-resolver/1.0/identifiers';

    const credStatusResolverRegistry = new CredentialStatusResolverRegistry();
    credStatusResolverRegistry.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );

    fetchMock.spy();
    fetchMock.get(
      'http://my-universal-resolver/1.0/identifiers/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf?state=f9dd6aa4e1abef52b6c94ab7eb92faf1a283b371d263e25ac835c9c04894741e',
      `{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"@context":["https://www.w3.org/ns/did/v1","https://schema.iden3.io/core/jsonld/auth.jsonld"],"id":"did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf","verificationMethod":[{"id":"did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf#stateInfo","type":"Iden3StateInfo2023","controller":"did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf","stateContractAddress":"80001:0x134B1BE34911E39A8397ec6289782989729807a4","published":true,"info":{"id":"did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf","state":"34824a8e1defc326f935044e32e9f513377dbfc031d79475a0190830554d4409","replacedByState":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1703174663","replacedAtTimestamp":"0","createdAtBlock":"43840767","replacedAtBlock":"0"},"global":{"root":"92c4610a24247a4013ce6de4903452d164134a232a94fd1fe37178bce4937006","replacedByRoot":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1704439557","replacedAtTimestamp":"0","createdAtBlock":"44415346","replacedAtBlock":"0"}}]},"didResolutionMetadata":{"contentType":"application/did+ld+json","retrieved":"2024-01-05T08:05:13.413770024Z","pattern":"^(did:polygonid:.+)$","driverUrl":"http://driver-did-polygonid:8080/1.0/identifiers/","duration":429,"did":{"didString":"did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf","methodSpecificId":"polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf","method":"polygonid"}},"didDocumentMetadata":{}}`
    );
    fetchMock.get(
      'https://rhs-staging.polygonid.me/node/34824a8e1defc326f935044e32e9f513377dbfc031d79475a0190830554d4409',
      `{"node":{"hash":"34824a8e1defc326f935044e32e9f513377dbfc031d79475a0190830554d4409","children":["4436ea12d352ddb84d2ac7a27bbf7c9f1bfc7d3ff69f3e6cf4348f424317fd0b","0000000000000000000000000000000000000000000000000000000000000000","37eabc712cdaa64793561b16b8143f56f149ad1b0c35297a1b125c765d1c071e"]},"status":"OK"}`
    );

    const opts: W3CProofVerificationOptions = {
      credStatusResolverRegistry
    };
    const isValid = await credential.verifyProof(ProofType.BJJSignature, resolverURL, opts);
    expect(isValid).to.be.eq(true);
  });

  it('Validate BJJ signature proof genesis', async () => {
    const input = `{
      "id": "urn:uuid:b7a1e232-a0d3-11ee-bc8a-a27b3ddbdc29",
      "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://schema.iden3.io/core/jsonld/iden3proofs.jsonld",
          "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld"
      ],
      "type": [
          "VerifiableCredential",
          "KYCAgeCredential"
      ],
      "expirationDate": "2361-03-21T21:14:48+02:00",
      "issuanceDate": "2023-12-22T16:09:27.444712+02:00",
      "credentialSubject": {
          "birthday": 19960424,
          "documentType": 2,
          "id": "did:polygonid:polygon:mumbai:2qJm6vBXtHWMqm9A9f5zihRNVGptHAHcK8oVxGUTg8",
          "type": "KYCAgeCredential"
      },
      "credentialStatus": {
          "id": "https://rhs-staging.polygonid.me/node?state=da6184809dbad90ccc52bb4dbfe2e8ff3f516d87c74d75bcc68a67101760b817",
          "revocationNonce": 1102174849,
          "statusIssuer": {
              "id": "https://ad40-91-210-251-7.ngrok-free.app/api/v1/identities/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLx3hTJBV8REpNDK2RiG7eNBVzXMoZdPfi2uhF7Ks/claims/revocation/status/1102174849",
              "revocationNonce": 1102174849,
              "type": "SparseMerkleTreeProof"
          },
          "type": "Iden3ReverseSparseMerkleTreeProof"
      },
      "issuer": "did:polygonid:polygon:mumbai:2qLx3hTJBV8REpNDK2RiG7eNBVzXMoZdPfi2uhF7Ks",
      "credentialSchema": {
          "id": "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json",
          "type": "JsonSchema2023"
      },
      "proof": [
          {
              "type": "BJJSignature2021",
              "issuerData": {
                  "id": "did:polygonid:polygon:mumbai:2qLx3hTJBV8REpNDK2RiG7eNBVzXMoZdPfi2uhF7Ks",
                  "state": {
                      "claimsTreeRoot": "aec50251fdc67959254c74ab4f2e746a7cd1c6f494c8ac028d655dfbccea430e",
                      "value": "da6184809dbad90ccc52bb4dbfe2e8ff3f516d87c74d75bcc68a67101760b817"
                  },
                  "authCoreClaim": "cca3371a6cb1b715004407e325bd993c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c08ac5cc7c5aa3e8190e188cf8d1737c92d16188541b582ef676c55b3a842c06c4985e9d4771ee6d033c2021a3d177f7dfa51859d99a9a476c2a910e887dc8240000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                  "mtp": {
                      "existence": true,
                      "siblings": []
                  },
                  "credentialStatus": {
                      "id": "https://rhs-staging.polygonid.me/node?state=da6184809dbad90ccc52bb4dbfe2e8ff3f516d87c74d75bcc68a67101760b817",
                      "revocationNonce": 0,
                      "statusIssuer": {
                          "id": "https://ad40-91-210-251-7.ngrok-free.app/api/v1/identities/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLx3hTJBV8REpNDK2RiG7eNBVzXMoZdPfi2uhF7Ks/claims/revocation/status/0",
                          "revocationNonce": 0,
                          "type": "SparseMerkleTreeProof"
                      },
                      "type": "Iden3ReverseSparseMerkleTreeProof"
                  }
              },
              "coreClaim": "c9b2370371b7fa8b3dab2a5ba81b68382a00000000000000000000000000000002128aa2ae20d4f8f7b9d673e06498fa410f3c5a790194f3b9284a2018f30d0037d1e542f1b72c9d5ca4b46d93710fbfa23a7c9c36eb3ca0eb0f9548ad9c140c000000000000000000000000000000000000000000000000000000000000000081dab14100000000281cdcdf0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
              "signature": "2a2e4d79f3aa440154643252d1b9074f9651fffcd653fb2fcadc07f55cd1f9a20a812dd7df8ba8775653984cfb7120f999751f9c25473fd634c7f2d88419c102"
          }
      ]
  }`;

    const credential = W3CCredential.fromJSON(JSON.parse(input));
    const resolverURL = 'http://my-universal-resolver/1.0/identifiers';

    const credStatusResolverRegistry = new CredentialStatusResolverRegistry();
    credStatusResolverRegistry.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );

    fetchMock.spy();
    fetchMock.get(
      'http://my-universal-resolver/1.0/identifiers/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLx3hTJBV8REpNDK2RiG7eNBVzXMoZdPfi2uhF7Ks?state=da6184809dbad90ccc52bb4dbfe2e8ff3f516d87c74d75bcc68a67101760b817',
      `{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"@context":["https://www.w3.org/ns/did/v1","https://schema.iden3.io/core/jsonld/auth.jsonld"],"id":"did:polygonid:polygon:mumbai:2qLx3hTJBV8REpNDK2RiG7eNBVzXMoZdPfi2uhF7Ks","verificationMethod":[{"id":"did:polygonid:polygon:mumbai:2qLx3hTJBV8REpNDK2RiG7eNBVzXMoZdPfi2uhF7Ks#stateInfo","type":"Iden3StateInfo2023","controller":"did:polygonid:polygon:mumbai:2qLx3hTJBV8REpNDK2RiG7eNBVzXMoZdPfi2uhF7Ks","stateContractAddress":"80001:0x134B1BE34911E39A8397ec6289782989729807a4","published":false,"global":{"root":"92c4610a24247a4013ce6de4903452d164134a232a94fd1fe37178bce4937006","replacedByRoot":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1704439557","replacedAtTimestamp":"0","createdAtBlock":"44415346","replacedAtBlock":"0"}}]},"didResolutionMetadata":{"contentType":"application/did+ld+json","retrieved":"2024-01-05T08:02:25.986085836Z","pattern":"^(did:polygonid:.+)$","driverUrl":"http://driver-did-polygonid:8080/1.0/identifiers/","duration":434,"did":{"didString":"did:polygonid:polygon:mumbai:2qLx3hTJBV8REpNDK2RiG7eNBVzXMoZdPfi2uhF7Ks","methodSpecificId":"polygon:mumbai:2qLx3hTJBV8REpNDK2RiG7eNBVzXMoZdPfi2uhF7Ks","method":"polygonid"}},"didDocumentMetadata":{}}`
    );
    fetchMock.get(
      'https://rhs-staging.polygonid.me/node/da6184809dbad90ccc52bb4dbfe2e8ff3f516d87c74d75bcc68a67101760b817',
      `{"node":{"hash":"da6184809dbad90ccc52bb4dbfe2e8ff3f516d87c74d75bcc68a67101760b817","children":["aec50251fdc67959254c74ab4f2e746a7cd1c6f494c8ac028d655dfbccea430e","0000000000000000000000000000000000000000000000000000000000000000","0000000000000000000000000000000000000000000000000000000000000000"]},"status":"OK"}`
    );

    const opts: W3CProofVerificationOptions = {
      credStatusResolverRegistry
    };

    const isValid = await credential.verifyProof(ProofType.BJJSignature, resolverURL, opts);
    expect(isValid).to.be.eq(true);
  });

  it('Validate BJJ signature proof agent status', async () => {
    const input = `{
      "id": "urn:uuid:79d93584-ae2c-11ee-8050-a27b3ddbdc28",
      "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://schema.iden3.io/core/jsonld/iden3proofs.jsonld",
          "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld"
      ],
      "type": [
          "VerifiableCredential",
          "KYCAgeCredential"
      ],
      "expirationDate": "2361-03-21T21:14:48+02:00",
      "issuanceDate": "2024-01-08T15:47:34.113565+02:00",
      "credentialSubject": {
          "birthday": 19960424,
          "documentType": 2,
          "id": "did:polygonid:polygon:mumbai:2qFDziX3k3h7To2jDJbQiXFtcozbgSNNvQpb6TgtPE",
          "type": "KYCAgeCredential"
      },
      "credentialStatus": {
          "id": "http://localhost:8001/api/v1/agent",
          "revocationNonce": 3262660310,
          "type": "Iden3commRevocationStatusV1.0"
      },
      "issuer": "did:polygonid:polygon:mumbai:2qJp131YoXVu8iLNGfL3TkQAWEr3pqimh2iaPgH3BJ",
      "credentialSchema": {
          "id": "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json",
          "type": "JsonSchema2023"
      },
      "proof": [
          {
              "type": "BJJSignature2021",
              "issuerData": {
                  "id": "did:polygonid:polygon:mumbai:2qJp131YoXVu8iLNGfL3TkQAWEr3pqimh2iaPgH3BJ",
                  "state": {
                      "claimsTreeRoot": "b35562873d9870f20e3d44dd94502f4156785a4b09d7906914758a7e0ed26829",
                      "value": "2de39210318bbc7fc79e24150c2790089c8385d7acffc0f0ebf1641b95087e0f"
                  },
                  "authCoreClaim": "cca3371a6cb1b715004407e325bd993c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000167c1d2857ca6579d6e995198876cdfd4edb4fe2eeedeadbabaaed3008225205e7b8ab88a60b9ef0999be82625e0831872d8aca16b2932852c3731e9df69970a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                  "mtp": {
                      "existence": true,
                      "siblings": []
                  },
                  "credentialStatus": {
                      "id": "http://localhost:8001/api/v1/agent",
                      "revocationNonce": 0,
                      "type": "Iden3commRevocationStatusV1.0"
                  }
              },
              "coreClaim": "c9b2370371b7fa8b3dab2a5ba81b68382a00000000000000000000000000000002123cbcd9d0f3a493561510c72b47afcb02e2f09b3855291c6b77d224260d0014f503c3ab03eebe757d5b50b570186a69d90c49904155f5fc71e0e7f5b8aa120000000000000000000000000000000000000000000000000000000000000000d63e78c200000000281cdcdf0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
              "signature": "56ab45ad828c4860d02e111b2732c969005046ee26dbc7d1e5bd6a6c6604ed81c3f55ffb9349f4d407f59e2e210f6d256a328d30edae2c7c95dd057240ee8902"
          },
          {
              "type": "Iden3SparseMerkleTreeProof",
              "issuerData": {
                  "id": "did:polygonid:polygon:mumbai:2qJp131YoXVu8iLNGfL3TkQAWEr3pqimh2iaPgH3BJ",
                  "state": {
                      "txId": "0x02f1af6a616715ccb7511176ca53d39a28c55201effca0b43a343ee6e9dc8c97",
                      "blockTimestamp": 1704721690,
                      "blockNumber": 44542683,
                      "rootOfRoots": "eaa48e4a7d3fe2fabbd939c7df1048c3f647a9a7c9dfadaae836ec78ba673229",
                      "claimsTreeRoot": "d9597e2fef206c9821f2425e513a68c8c793bc93c9216fb883fedaaf72abf51c",
                      "revocationTreeRoot": "0000000000000000000000000000000000000000000000000000000000000000",
                      "value": "96161f3fbbdd68c72bc430dae474e27b157586b33b9fbf4a3f07d75ce275570f"
                  }
              },
              "coreClaim": "c9b2370371b7fa8b3dab2a5ba81b68382a00000000000000000000000000000002123cbcd9d0f3a493561510c72b47afcb02e2f09b3855291c6b77d224260d0014f503c3ab03eebe757d5b50b570186a69d90c49904155f5fc71e0e7f5b8aa120000000000000000000000000000000000000000000000000000000000000000d63e78c200000000281cdcdf0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
              "mtp": {
                  "existence": true,
                  "siblings": [
                      "18730028644149260049434737497088408840959357817865392043806470281178241979827"
                  ]
              }
          }
      ]
  }`;

    const credential = W3CCredential.fromJSON(JSON.parse(input));
    const resolverURL = 'http://my-universal-resolver/1.0/identifiers';

    const credStatusResolverRegistry = new CredentialStatusResolverRegistry();
    credStatusResolverRegistry.register(
      CredentialStatusType.Iden3commRevocationStatusV1,
      new AgentResolver()
    );

    fetchMock.spy();
    fetchMock.get(
      'http://my-universal-resolver/1.0/identifiers/did%3Apolygonid%3Apolygon%3Amumbai%3A2qJp131YoXVu8iLNGfL3TkQAWEr3pqimh2iaPgH3BJ?state=2de39210318bbc7fc79e24150c2790089c8385d7acffc0f0ebf1641b95087e0f',
      JSON.parse(
        `{"didDocument":{"@context":["https://www.w3.org/ns/did/v1","https://schema.iden3.io/core/jsonld/auth.jsonld"],"id":"did:polygonid:polygon:mumbai:2qEChbFATnamWnToMgNycnVi4W9Xw5772qX61qwki6","verificationMethod":[{"id":"did:polygonid:polygon:mumbai:2qEChbFATnamWnToMgNycnVi4W9Xw5772qX61qwki6#stateInfo","type":"Iden3StateInfo2023","controller":"did:polygonid:polygon:mumbai:2qEChbFATnamWnToMgNycnVi4W9Xw5772qX61qwki6","stateContractAddress":"80001:0x134B1BE34911E39A8397ec6289782989729807a4","published":false,"global":{"root":"ff3e987dc4c279af0e77ac2b1983ed8cf627bfeebbc6d5d56be2526cc7286621","replacedByRoot":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1704719148","replacedAtTimestamp":"0","createdAtBlock":"44541667","replacedAtBlock":"0"}}]}}`
      )
    );
    fetchMock.post(
      'http://localhost:8001/api/v1/agent',
      JSON.parse(
        `{"body":{"issuer":{"claimsTreeRoot":"d9597e2fef206c9821f2425e513a68c8c793bc93c9216fb883fedaaf72abf51c","revocationTreeRoot":"0000000000000000000000000000000000000000000000000000000000000000","rootOfRoots":"eaa48e4a7d3fe2fabbd939c7df1048c3f647a9a7c9dfadaae836ec78ba673229","state":"96161f3fbbdd68c72bc430dae474e27b157586b33b9fbf4a3f07d75ce275570f"},"mtp":{"existence":false,"siblings":[]}},"from":"did:polygonid:polygon:mumbai:2qJp131YoXVu8iLNGfL3TkQAWEr3pqimh2iaPgH3BJ","id":"9ece0dad-9267-4a52-b611-f0615b0143fb","thid":"8bdc87dc-1755-41d5-b483-26562836068e","to":"did:polygonid:polygon:mumbai:2qFDziX3k3h7To2jDJbQiXFtcozbgSNNvQpb6TgtPE","typ":"application/iden3comm-plain-json","type":"https://iden3-communication.io/revocation/1.0/status"}`
      )
    );

    const opts: W3CProofVerificationOptions = {
      credStatusResolverRegistry
    };

    const isValid = await credential.verifyProof(ProofType.BJJSignature, resolverURL, opts);
    expect(isValid).to.be.eq(true);
  });

  it('Validate SMT proof', async () => {
    const input = `{
        "id": "urn:uuid:3a8d1822-a00e-11ee-8f57-a27b3ddbdc29",
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://schema.iden3.io/core/jsonld/iden3proofs.jsonld",
            "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld"
        ],
        "type": [
            "VerifiableCredential",
            "KYCAgeCredential"
        ],
        "expirationDate": "2361-03-21T21:14:48+02:00",
        "issuanceDate": "2023-12-21T16:35:46.737547+02:00",
        "credentialSubject": {
            "birthday": 19960424,
            "documentType": 2,
            "id": "did:polygonid:polygon:mumbai:2qH2mPVRN7ZDCnEofjeh8Qd2Uo3YsEhTVhKhjB8xs4",
            "type": "KYCAgeCredential"
        },
        "credentialStatus": {
            "id": "https://rhs-staging.polygonid.me/node?state=f9dd6aa4e1abef52b6c94ab7eb92faf1a283b371d263e25ac835c9c04894741e",
            "revocationNonce": 74881362,
            "statusIssuer": {
                "id": "https://ad40-91-210-251-7.ngrok-free.app/api/v1/identities/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf/claims/revocation/status/74881362",
                "revocationNonce": 74881362,
                "type": "SparseMerkleTreeProof"
            },
            "type": "Iden3ReverseSparseMerkleTreeProof"
        },
        "issuer": "did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf",
        "credentialSchema": {
            "id": "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json",
            "type": "JsonSchema2023"
        },
        "proof": [
            {
                "type": "BJJSignature2021",
                "issuerData": {
                    "id": "did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf",
                    "state": {
                        "claimsTreeRoot": "d946e9cb604bceb0721e4548c291b013647eb56a2cd755b965e6c3b840026517",
                        "value": "f9dd6aa4e1abef52b6c94ab7eb92faf1a283b371d263e25ac835c9c04894741e"
                    },
                    "authCoreClaim": "cca3371a6cb1b715004407e325bd993c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d7d1691a4202c0a1e580da2a87118c26a399849c42e52c4d97506a5bf5985923e6ec8ef6caeb482daa0d7516a864ace8fba2854275781583934349b51ba70c190000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "mtp": {
                        "existence": true,
                        "siblings": []
                    },
                    "credentialStatus": {
                        "id": "https://rhs-staging.polygonid.me/node?state=f9dd6aa4e1abef52b6c94ab7eb92faf1a283b371d263e25ac835c9c04894741e",
                        "revocationNonce": 0,
                        "statusIssuer": {
                            "id": "https://ad40-91-210-251-7.ngrok-free.app/api/v1/identities/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf/claims/revocation/status/0",
                            "revocationNonce": 0,
                            "type": "SparseMerkleTreeProof"
                        },
                        "type": "Iden3ReverseSparseMerkleTreeProof"
                    }
                },
                "coreClaim": "c9b2370371b7fa8b3dab2a5ba81b68382a000000000000000000000000000000021264874acc807e8862077487500a0e9b550a84d667348fc936a4dd0e730b00d4bfb0b3fc0b67c4437ee22848e5de1a7a71748c428358625a5fbac1cebf982000000000000000000000000000000000000000000000000000000000000000005299760400000000281cdcdf0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                "signature": "1783ff1c8207d3047a2ba6baa341dc8a6cb095e5683c6fb619ba4099d3332d2b209dca0a0676e41d4675154ea07662c7d9e14a7ee57259f85f3596493ac71a01"
            },
            {
                "type": "Iden3SparseMerkleTreeProof",
                "issuerData": {
                    "id": "did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf",
                    "state": {
                        "txId": "0x7ab71a8c5e91064e21beb586012f8b89932c255e243c496dec895a501a42e243",
                        "blockTimestamp": 1703174663,
                        "blockNumber": 43840767,
                        "rootOfRoots": "37eabc712cdaa64793561b16b8143f56f149ad1b0c35297a1b125c765d1c071e",
                        "claimsTreeRoot": "4436ea12d352ddb84d2ac7a27bbf7c9f1bfc7d3ff69f3e6cf4348f424317fd0b",
                        "revocationTreeRoot": "0000000000000000000000000000000000000000000000000000000000000000",
                        "value": "34824a8e1defc326f935044e32e9f513377dbfc031d79475a0190830554d4409"
                    }
                },
                "coreClaim": "c9b2370371b7fa8b3dab2a5ba81b68382a000000000000000000000000000000021264874acc807e8862077487500a0e9b550a84d667348fc936a4dd0e730b00d4bfb0b3fc0b67c4437ee22848e5de1a7a71748c428358625a5fbac1cebf982000000000000000000000000000000000000000000000000000000000000000005299760400000000281cdcdf0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                "mtp": {
                    "existence": true,
                    "siblings": [
                        "0",
                        "10581662619345074277108685138429405012286849178024033034405862946888154171097"
                    ]
                }
            }
        ]
    }`;

    const credential = W3CCredential.fromJSON(JSON.parse(input));
    const resolverURL = 'http://my-universal-resolver/1.0/identifiers';
    fetchMock.spy();
    fetchMock.get(
      'http://my-universal-resolver/1.0/identifiers/did%3Apolygonid%3Apolygon%3Amumbai%3A2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf?state=34824a8e1defc326f935044e32e9f513377dbfc031d79475a0190830554d4409',
      `{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"@context":["https://www.w3.org/ns/did/v1","https://schema.iden3.io/core/jsonld/auth.jsonld"],"id":"did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf","verificationMethod":[{"id":"did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf#stateInfo","type":"Iden3StateInfo2023","controller":"did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf","stateContractAddress":"80001:0x134B1BE34911E39A8397ec6289782989729807a4","published":true,"info":{"id":"did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf","state":"34824a8e1defc326f935044e32e9f513377dbfc031d79475a0190830554d4409","replacedByState":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1703174663","replacedAtTimestamp":"0","createdAtBlock":"43840767","replacedAtBlock":"0"},"global":{"root":"92c4610a24247a4013ce6de4903452d164134a232a94fd1fe37178bce4937006","replacedByRoot":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1704439557","replacedAtTimestamp":"0","createdAtBlock":"44415346","replacedAtBlock":"0"}}]},"didResolutionMetadata":{"contentType":"application/did+ld+json","retrieved":"2024-01-05T07:53:42.67771172Z","pattern":"^(did:polygonid:.+)$","driverUrl":"http://driver-did-polygonid:8080/1.0/identifiers/","duration":442,"did":{"didString":"did:polygonid:polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf","methodSpecificId":"polygon:mumbai:2qLGnFZiHrhdNh5KwdkGvbCN1sR2pUaBpBahAXC3zf","method":"polygonid"}},"didDocumentMetadata":{}}`
    );
    const isValid = await credential.verifyProof(ProofType.Iden3SparseMerkleTreeProof, resolverURL);
    expect(isValid).to.be.eq(true);
  });
});
