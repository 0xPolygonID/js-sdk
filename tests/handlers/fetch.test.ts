import {
  CredentialsOfferMessage,
  FetchHandler,
  IFetchHandler,
  IPackageManager,
  IDataStorage,
  IdentityWallet,
  CredentialWallet,
  CredentialStatusResolverRegistry,
  RHSResolver,
  CredentialStatusType,
  W3CCredential,
  PROTOCOL_CONSTANTS,
  byteEncoder,
  CredentialFetchRequestMessage,
  CredentialRequest,
  CredentialIssuanceMessage,
  FSCircuitStorage,
  ProofService,
  CircuitId
} from '../../src';

import {
  MOCK_STATE_STORAGE,
  RHS_URL,
  SEED_ISSUER,
  SEED_USER,
  createIdentity,
  getInMemoryDataStorage,
  getPackageMgr,
  registerBJJIntoInMemoryKMS
} from '../helpers';

import * as uuid from 'uuid';
import { expect } from 'chai';
import fetchMock from '@gr2m/fetch-mock';
import path from 'path';

describe('fetch', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let fetchHandler: IFetchHandler;
  let packageMgr: IPackageManager;
  const agentUrl = 'https://testagent.com/';

  const issuanceResponseMock = `{
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
    const kms = registerBJJIntoInMemoryKMS();
    dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);
    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });
    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    const proofService = new ProofService(idWallet, credWallet, circuitStorage, MOCK_STATE_STORAGE);
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );
    fetchHandler = new FetchHandler(packageMgr, {
      credentialWallet: credWallet
    });
  });

  it('fetch credential issued to genesis did', async () => {
    fetchMock.spy();
    fetchMock.post(agentUrl, JSON.parse(issuanceResponseMock));
    const { did: userDID, credential: cred } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_ISSUER
    });

    expect(issuerAuthCredential).not.to.be.undefined;

    const id = uuid.v4();
    const authReq: CredentialsOfferMessage = {
      id,
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE,
      thid: id,
      body: {
        url: agentUrl,
        credentials: [{ id: 'https://credentialId', description: 'kyc age credentials' }]
      },
      from: issuerDID.string(),
      to: userDID.string()
    };

    const msgBytes = byteEncoder.encode(JSON.stringify(authReq));

    const res = await fetchHandler.handleCredentialOffer(msgBytes);

    await credWallet.saveAll(res);

    expect(res).to.be.a('array');
    expect(res).to.have.length(1);
    const w3cCred = W3CCredential.fromJSON(JSON.parse(issuanceResponseMock).body.credential);

    expect(Object.entries(res[0]).toString()).to.equal(Object.entries(w3cCred).toString());
    fetchMock.restore();
  });

  it('handle credential fetch and issuance requests', async () => {
    const { did: userDID, credential: cred } = await createIdentity(idWallet, {
      seed: SEED_USER
    });
    expect(cred).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_ISSUER
    });

    expect(issuerAuthCredential).not.to.be.undefined;

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };

    const issuedCred = await idWallet.issueCredential(issuerDID, claimReq);
    await credWallet.save(issuedCred);

    const id = uuid.v4();
    const authReq: CredentialFetchRequestMessage = {
      id,
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.CREDENTIAL_FETCH_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: {
        id: issuedCred.id
      },
      from: userDID.string(),
      to: issuerDID.string()
    };

    const msgBytes = byteEncoder.encode(JSON.stringify(authReq));

    const res = await fetchHandler.handleCredentialFetchRequest(msgBytes);

    expect(res).to.be.a('Uint8Array');

    const issueanceMsg = await FetchHandler.unpackMessage<CredentialIssuanceMessage>(
      packageMgr,
      res,
      PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE
    );

    expect(issueanceMsg).not.to.be.undefined;
    expect(issueanceMsg.body).not.to.be.undefined;
    expect(issueanceMsg.body?.credential).not.to.be.undefined;
    expect(issueanceMsg.body?.credential.id).to.equal(issuedCred.id);

    const newId = uuid.v4();

    issueanceMsg.body = {
      credential: { ...issueanceMsg.body?.credential, id: newId } as W3CCredential
    };

    await fetchHandler.handleIssuanceResponseMessage(
      byteEncoder.encode(JSON.stringify(issueanceMsg))
    );

    const cred2 = await credWallet.findById(newId);
    expect(cred2).not.to.be.undefined;
  });
});
