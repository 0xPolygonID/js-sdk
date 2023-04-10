import { Identity, Profile } from '../../src/storage/entities/identity';
import { IdentityStorage } from '../../src/storage/shared/identity-storage';
import { PlainPacker } from '../../src/iden3comm/packers/plain';
import { CredentialStorage, IdentityWallet } from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { IDataStorage, IStateStorage } from '../../src/storage/interfaces';
import { InMemoryDataSource, InMemoryMerkleTreeStorage } from '../../src/storage/memory';
import { CredentialWallet } from '../../src/credentials';
import { CredentialStatusType, VerifiableConstants, W3CCredential } from '../../src/verifiable';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import {
  BasicMessage,
  CredentialIssuanceMessage,
  CredentialsOfferMessage,
  CredentialsOfferMessageBody,
  FetchHandler,
  IFetchHandler,
  IPackageManager,
  PackageManager,
  ZKPPackerParams
} from '../../src/iden3comm';
import * as uuid from 'uuid';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { byteEncoder } from '../../src/iden3comm/utils';
import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
import { assert, expect } from 'chai';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { after } from 'mocha';

describe('fetch', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let fetchHandler: IFetchHandler;
  let packageMgr: IPackageManager;
  const rhsUrl = process.env.RHS_URL as string;
  const agentUrl = 'https://testagent.com/';
  const mockedToken = 'jwz token to fetch credential';

  let agentStub: MockAdapter;

  const mockStateStorage: IStateStorage = {
    getLatestStateById: async () => {
      throw new Error(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST);
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

  const mockedCredResponse = `{
    "body": {
        "credential": {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://schema.iden3.io/core/jsonld/iden3proofs.jsonld",
                "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v100.json-ld"
            ],
            "credentialSchema": {
                "id": "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v100.json",
                "type": "JsonSchemaValidator2018"
            },
            "credentialStatus": {
                "id": "http://localhost:8001/api/v1/identities/did%3Aiden3%3AtSsTSJY6g9yUc54FFH6yhx2ymZNtsuTAD9p3avWCb/claims/revocation/status/3701011735",
                "revocationNonce": 3701011735,
                "type": "SparseMerkleTreeProof"
            },
            "credentialSubject": {
                "birthday": 19960424,
                "documentType": 99,
                "id": "did:polygonid:polygon:mumbai:2qGGMEVZUHU1boxfqiRR1fs31xPkJMTxENESLSRchZ",
                "type": "KYCAgeCredential"
            },
            "expirationDate": "2361-03-21T21:14:48+02:00",
            "id": "http://localhost:8001/api/v1/identities/did:iden3:tSsTSJY6g9yUc54FFH6yhx2ymZNtsuTAD9p3avWCb/claims/d04fcbf8-b373-11ed-88d2-de17148ce1ce",
            "issuanceDate": "2023-02-23T14:15:51.58546+02:00",
            "issuer": "did:iden3:tSsTSJY6g9yUc54FFH6yhx2ymZNtsuTAD9p3avWCb",
            "proof": [
                {
                    "coreClaim": "06ce4f021d1d9fe3b5dd115882f469ce2a000000000000000000000000000000021253a8d5867185af98ef6bb512c021fc5f099e3ac82f9b924b353128e20c005cff21a8096a19e3198035035c815a2c4d2384ea6b9b2c4a6cc3b9aebff2dc1d000000000000000000000000000000000000000000000000000000000000000017f598dc00000000281cdcdf0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "issuerData": {
                        "authCoreClaim": "cca3371a6cb1b715004407e325bd993c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004ccf39129a7759649ab1a70538602ca651f76abc1e9b7b7b84db2faa48037a0bd55ec8cdd16d2989f0a5c9824b578c914bd0fd10746bec83075773931d6cb1290000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                        "credentialStatus": {
                            "id": "http://localhost:8001/api/v1/identities/did%3Aiden3%3AtSsTSJY6g9yUc54FFH6yhx2ymZNtsuTAD9p3avWCb/claims/revocation/status/0",
                            "revocationNonce": 0,
                            "type": "SparseMerkleTreeProof"
                        },
                        "id": "did:iden3:tSsTSJY6g9yUc54FFH6yhx2ymZNtsuTAD9p3avWCb",
                        "mtp": {
                            "existence": true,
                            "siblings": [
                                "307532286953684850322725598023921449547946667992416711686417617300288340824"
                            ]
                        },
                        "state": {
                            "claimsTreeRoot": "188a0b752a0add6ab1b4639b2529999de16cffb42a251074b67551b838404330",
                            "value": "e74265e2e3c054db09bab873642d9675727538a7010f4dbd8250eed06ca54100"
                        }
                    },
                    "signature": "62affc0893c76c1e9e279ea0a5b7a48d0fc186d6133303fcd924ae5d3cc0b39fd6791fe0903a80501707f272724ee889f134c64035e40a956fd0cf1c3e4baa02",
                    "type": "BJJSignature2021"
                }
            ],
            "type": [
                "VerifiableCredential",
                "KYCAgeCredential"
            ]
        }
    },
    "from": "did:iden3:tSsTSJY6g9yUc54FFH6yhx2ymZNtsuTAD9p3avWCb",
    "id": "30e37e90-2242-4a36-b475-799047d60481",
    "to": "did:polygonid:polygon:mumbai:2qGGMEVZUHU1boxfqiRR1fs31xPkJMTxENESLSRchZ",
    "typ": "application/iden3comm-plain-json",
    "type": "https://iden3-communication.io/credentials/1.0/issuance-response"
}`;

  beforeEach(async () => {
    const memoryKeyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);
    dataStorage = {
      credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
      identity: new IdentityStorage(
        new InMemoryDataSource<Identity>(),
        new InMemoryDataSource<Profile>()
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: mockStateStorage
    };

    credWallet = new CredentialWallet(dataStorage);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    // proofService = new ProofService(idWallet, credWallet, circuitStorage, mockStateStorage);
    packageMgr = {} as PackageManager;
    packageMgr.unpack = async function (
      envelope: Uint8Array
    ): Promise<{ unpackedMessage: BasicMessage; unpackedMediaType: MediaType }> {
      const msg = await new PlainPacker().unpack(envelope);
      return { unpackedMessage: msg, unpackedMediaType: MediaType.PlainMessage };
    };
    packageMgr.pack = async function (
      mediaType: MediaType,
      payload: Uint8Array,
      params: ZKPPackerParams
    ): Promise<Uint8Array> {
      return new TextEncoder().encode(mockedToken);
    };
    fetchHandler = new FetchHandler(packageMgr);

    //mock axios

    agentStub = new MockAdapter(axios);
    agentStub.onAny(agentUrl).replyOnce(200, mockedCredResponse);
  });
  after(() => {
    agentStub.restore();
  });

  it('fetch credential', async () => {
    const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');
    const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseeduser');

    const { did: userDID, credential: cred } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhrase,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        baseUrl: rhsUrl
      }
    });
    const { did: issuerDID, credential: issuerAuthCredential } = await idWallet.createIdentity({
      method: DidMethod.Iden3,
      blockchain: Blockchain.Polygon,
      networkId: NetworkId.Mumbai,
      seed: seedPhraseIssuer,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        baseUrl: rhsUrl
      }
    });

    const id = uuid.v4();
    const authReq: CredentialsOfferMessage = {
      id,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE,
      thid: id,
      body: {
        url: agentUrl,
        credentials: [{ id: 'https://credentialId', description: 'kyc age credentials' }]
      } as CredentialsOfferMessageBody,
      from: issuerDID.id.string()
    };

    const msgBytes = byteEncoder.encode(JSON.stringify(authReq));

    const res = await fetchHandler.handleCredentialOffer(userDID, msgBytes);

    credWallet.saveAll(res);

    expect(res).to.be.a('array');
    expect(res).to.have.length(1);
    assert.deepEqual(
      res[0],
      (JSON.parse(mockedCredResponse) as CredentialIssuanceMessage).body?.credential
    );
  });
});
