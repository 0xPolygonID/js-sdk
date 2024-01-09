import { InMemoryDataSource } from './../../src/storage/memory/data-source';
import { CredentialStorage } from './../../src/storage/shared/credential-storage';
import { IDataStorage } from './../../src/storage/interfaces/data-storage';
import { CredentialWallet } from '../../src/credentials';
import { SearchError } from '../../src/storage/filters/jsonQuery';
import { MockedLegacyCredential, cred1, cred2, cred3, cred4 } from './mock';
import {
  ProofQuery,
  W3CCredential,
  CredentialStatusType,
  Iden3SparseMerkleTreeProof,
  RevocationStatus,
  ProofType
} from '../../src/verifiable';
import { BrowserDataSource } from '../../src/storage/local-storage/data-source';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { CredentialStatusResolverRegistry } from '../../src/credentials';
import { RHSResolver } from '../../src/credentials';
import { IDataSource, IPackageManager, PackageManager, PlainPacker, StateInfo } from '../../src';
import { Claim, DID, SchemaHash } from '@iden3/js-iden3-core';
import { Hash, Proof, ZERO_HASH } from '@iden3/js-merkletree';
import { StatusOptions, CredStatusResolver } from '../../src/verifiable/status/status';
import { Id } from '@iden3/js-iden3-core';
chai.use(chaiAsPromised);
const { expect } = chai;

class credStatusResolverMock implements CredStatusResolver {
  getStateInfoByID(id: Id): Promise<StateInfo> {
    const stateInfo: StateInfo = {};
    if (
      Id.toString() === '29305636064099160210536948077705157048478988844998217946273455478812643842'
    ) {
      stateInfo.state = BigInt(
        '4191494968776819400863455954888115392137551122958477943242938172592557294132'
      );
      return Promise.resolve(stateInfo);
    }
    if (
      Id.toString() === '25116094451735045024912155729979573740232593171393457835171656777831420418'
    ) {
      throw new Error('execution reverted: Identity does not exist');
    }
    return Promise.resolve(stateInfo);
  }

  getRevocationStatus(id: Id, nonce: bigint): Promise<RevocationStatus | undefined> {
    return Promise.resolve(undefined);
  }

  getRevocationStatusByIDAndState(
    id: Id,
    state: bigint,
    nonce: bigint
  ): Promise<RevocationStatus | undefined> {
    return Promise.resolve(undefined);
  }
}

describe('Verify credential proof', () => {
  it.only('Validate BJJ signature proof', async () => {
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

    const mgr: IPackageManager = new PackageManager();
    const plainPacker = new PlainPacker();
    mgr.registerPackers([plainPacker]);

    const statusOpts: StatusOptions = {
      resolver: new credStatusResolverMock(),
      packageManager: mgr
    };

    const isValid = credential.verifyProof(ProofType.BJJSignature, resolverURL, statusOpts);
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
    const resolverURL = 'https://universal-resolver.polygonid.me/1.0/identifiers';

    const mgr: IPackageManager = new PackageManager();
    const plainPacker = new PlainPacker();
    mgr.registerPackers([plainPacker]);

    const statusOpts: StatusOptions = {
      resolver: new credStatusResolverMock(),
      packageManager: mgr
    };

    const isValid = await credential.verifyProof(
      ProofType.Iden3SparseMerkleTreeProof,
      resolverURL,
      statusOpts
    );
    expect(isValid).to.be.eq(true);
  });
});
