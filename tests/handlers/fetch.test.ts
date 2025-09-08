import {
  CredentialsOfferMessage,
  CredentialsOnchainOfferMessage,
  FetchHandler,
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
  CircuitId,
  MessageHandler,
  PlainPacker
} from '../../src';

import {
  MOCK_STATE_STORAGE,
  RHS_URL,
  RPC_URL,
  SEED_ISSUER,
  SEED_USER,
  createIdentity,
  getInMemoryDataStorage,
  getPackageMgr,
  registerKeyProvidersInMemoryKMS
} from '../helpers';

import { OnchainIssuer } from '../../src/storage/blockchain/onchain-issuer';
import { defaultEthConnectionConfig } from '../../src';

import * as uuid from 'uuid';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import path from 'path';
import nock from 'nock';

describe('fetch', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let fetchHandler: FetchHandler;
  let packageMgr: IPackageManager;
  let msgHandler: MessageHandler;
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
    const kms = registerKeyProvidersInMemoryKMS();
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
      proofService.generateAuthInputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );
    fetchHandler = new FetchHandler(packageMgr, {
      credentialWallet: credWallet,
      onchainIssuer: new OnchainIssuer([
        {
          ...defaultEthConnectionConfig,
          url: RPC_URL,
          chainId: 80002
        }
      ])
    });

    msgHandler = new MessageHandler({
      messageHandlers: [fetchHandler],
      packageManager: packageMgr
    });
  });

  it('fetch credential issued to genesis did', async () => {
    nock(agentUrl).post('/').reply(200, issuanceResponseMock);
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

    const issuanceMsg = await FetchHandler.unpackMessage<CredentialIssuanceMessage>(
      packageMgr,
      res,
      PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE
    );

    expect(issuanceMsg).not.to.be.undefined;
    expect(issuanceMsg.body).not.to.be.undefined;
    expect(issuanceMsg.body?.credential).not.to.be.undefined;
    expect(issuanceMsg.body?.credential.id).to.equal(issuedCred.id);

    const newId = uuid.v4();

    issuanceMsg.body = {
      credential: { ...issuanceMsg.body?.credential, id: newId } as W3CCredential
    };

    await fetchHandler.handleIssuanceResponseMessage(
      byteEncoder.encode(JSON.stringify(issuanceMsg))
    );

    const cred2 = await credWallet.findById(newId);
    expect(cred2).not.to.be.undefined;

    const offer: CredentialsOfferMessage = {
      id,
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.CREDENTIAL_OFFER_MESSAGE_TYPE,
      thid: id,
      body: {
        url: agentUrl,
        credentials: [{ id: cred2?.id as string, description: 'kyc age credentials' }]
      },
      from: issuerDID.string(),
      to: userDID.string()
    };

    const bytes = await packageMgr.packMessage(
      PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      offer,
      {}
    );
    nock(agentUrl).post('/').reply(200, issuanceResponseMock);
    expect(await credWallet.list()).to.have.length(4);

    const response = await msgHandler.handleMessage(bytes, {});
    // credential saved after handling message via msgHandler
    expect(response).to.be.null;
    expect(await credWallet.list()).to.have.length(5);
  });

  it('onchain credential offer', async () => {
    const { did: userDID } = await createIdentity(idWallet, {
      seed: SEED_ISSUER
    });

    const onchainOffer: CredentialsOnchainOfferMessage = {
      id: uuid.v4(),
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.CREDENTIAL_ONCHAIN_OFFER_MESSAGE_TYPE,
      thid: uuid.v4(),
      body: {
        credentials: [{ id: '6', description: 'balance credential' }],
        transaction_data: {
          contract_address: '0x19875eA86503734f2f9Ed461463e0312A3b42563',
          method_id: '0',
          chain_id: 80002
        }
      },
      from: 'did:polygonid:polygon:amoy:2qQ68JkRcf3xyDFsGSWU5QqxbKpzM75quxS628JgvJ',
      to: userDID.string()
    };

    const bytes = await packageMgr.packMessage(
      PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      onchainOffer,
      {}
    );
    const response = await fetchHandler.handleOnchainOffer(bytes);
    expect(response).to.not.be.undefined;
  });

  it('issuance message handle generic', async () => {
    const msg: CredentialIssuanceMessage = JSON.parse(issuanceResponseMock);
    msg.body.credential = W3CCredential.fromJSON(msg.body.credential); // that how it can be in the client.
    const response = await fetchHandler.handle(msg, {
      mediaType: PROTOCOL_CONSTANTS.MediaType.PlainMessage
    });
    expect(response).to.be.null;

    const cred = credWallet.findById(msg.body.credential.id);
    expect(cred).to.not.be.undefined;
  });

  it('issuance message handleIssuance method', async () => {
    const msg = issuanceResponseMock;

    const bts = await new PlainPacker().pack(byteEncoder.encode(msg));
    const response = await fetchHandler.handleIssuanceResponseMessage(bts);
    expect(response).to.be.empty;

    const cred = credWallet.findById('urn:uuid:9691b9f6-76f6-11f0-a048-0a58a9feac02');
    expect(cred).to.not.be.undefined;
  });
});
