/* eslint-disable no-console */

import path from 'path';
import {
  IDataStorage,
  CredentialRequest,
  CredentialWallet,
  ProofService,
  CircuitId,
  AuthHandler,
  FSCircuitStorage,
  IAuthHandler,
  IdentityWallet,
  byteEncoder,
  CredentialStatusType,
  IPackageManager,
  ZeroKnowledgeProofRequest,
  RHSResolver,
  CredentialStatusResolverRegistry,
  buildAccept,
  AcceptProfile,
  createAuthorizationRequest,
  EncryptedCredentialIssuanceMessage,
  toPublicKeyJwk,
  KmsKeyType,
  JoseService,
  getRecipientsJWKs,
  FetchHandler
} from '../../src';
import { DID } from '@iden3/js-iden3-core';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  getInMemoryDataStorage,
  registerKeyProvidersInMemoryKMS,
  IPFS_URL,
  getPackageMgr,
  createIdentity,
  SEED_USER,
  RHS_URL,
  MOCK_STATE_STORAGE
} from '../helpers';
import {
  AcceptAuthCircuits,
  AcceptJweKEKAlgorithms,
  CEKEncryption,
  MediaType,
  PROTOCOL_MESSAGE_TYPE,
  ProtocolVersion
} from '../../src/iden3comm/constants';
import { schemaLoaderForTests } from '../mocks/schema';
import * as uuid from 'uuid';
import { DIDDocument, Resolvable } from 'did-resolver';
import { Options } from '@iden3/js-jsonld-merklization';
import nock from 'nock';

describe('encrypted issuance response', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;
  let fetchHandler: FetchHandler;
  let authHandler: IAuthHandler;
  let packageMgr: IPackageManager;

  let userDID: DID;
  let issuerDID: DID;
  let userDIDDoc: DIDDocument;
  let joseService: JoseService;
  let mockResolver: Resolvable;
  let pkFunc: (kid: string) => Promise<CryptoKey>;
  let merklizeOpts: Options;
  beforeEach(async () => {
    const kms = registerKeyProvidersInMemoryKMS();
    dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);
    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });

    const didResolverUrl = 'http://127.0.0.1:8080';
    nock(didResolverUrl)
      .get(
        // eslint-disable-next-line @cspell/spellchecker
        '/did%3Aiden3%3Apolygon%3Aamoy%3AxCRp75DgAdS63W65fmXHz6p9DwdonuRU9e46DifhX'
      )
      .query(true)
      .reply(
        200,
        `{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"@context":["https://www.w3.org/ns/did/v1","https://schema.iden3.io/core/jsonld/auth.jsonld","https://schema.iden3.io/core/jsonld/iden3proofs.jsonld"],"id":"did:iden3:polygon:amoy:xCRp75DgAdS63W65fmXHz6p9DwdonuRU9e46DifhX","verificationMethod":[{"id":"did:iden3:polygon:amoy:xCRp75DgAdS63W65fmXHz6p9DwdonuRU9e46DifhX#state-info","type":"Iden3StateInfo2023","controller":"did:iden3:polygon:amoy:xCRp75DgAdS63W65fmXHz6p9DwdonuRU9e46DifhX","stateContractAddress":"80002:0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124","published":true,"info":{"id":"did:iden3:polygon:amoy:xCRp75DgAdS63W65fmXHz6p9DwdonuRU9e46DifhX","state":"22963e52a4c04ef499f1d2930867ebdb5596a73dbcd77477b5519a299ff7b815","replacedByState":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1712064534","replacedAtTimestamp":"0","createdAtBlock":"5385826","replacedAtBlock":"0"},"global":{"root":"91b89ac20f2411d5de9f1cc391f638a22663540afdc6f1ca518122442d042c12","replacedByRoot":"0000000000000000000000000000000000000000000000000000000000000000","createdAtTimestamp":"1760698561","replacedAtTimestamp":"0","createdAtBlock":"27820419","replacedAtBlock":"0","proof":{"existence":true,"siblings":["6428243689143242579702662860293569107169128685670360705797187716912585400809","13916390246083716610426973259336923723042584181578975450095930261645419346768","6787007861770220911533618052183574885526628363444701572849759471729003906015","19234483659313806775982183828556447891383099480517044188636343922073232481136","20921983194991124171439531697595774634090474519647673971227110609532572429462","5945569071812011198185305748300166038940265935245815771367263985444037970898","6760478877200736598117691600599786032243777914883026717305057472022943262937","16502742759241010481262019563221317012845110701799281147810562405312572053050","17039157786522947034661581292309131577618445627804580521584846207597468329369","20352172584502922024019844821731534659815935437798441747251718170651937542438","5482943901689678350542510324589250522521490744665079376271847689643896607611","20018394220441038160429825695199484304178089569371620495728373476640253935543","0","19159073135126042532051922779630339345464122677209002400701389439392546962918","10288916032437376206488569455477188755078920211019952184968871094980800314411","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"type":"Iden3SparseMerkleTreeProof"}}}]},"didResolutionMetadata":{"@context":["https://schema.iden3.io/core/jsonld/resolution.jsonld"],"contentType":"application/did+ld+json","retrieved":"2025-10-17T11:22:31.265727308Z","type":"Iden3ResolutionMetadata"},"didDocumentMetadata":{}}`
      );

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    merklizeOpts = {
      documentLoader: schemaLoaderForTests({
        ipfsNodeURL: IPFS_URL
      })
    };

    proofService = new ProofService(
      idWallet,
      credWallet,
      circuitStorage,
      MOCK_STATE_STORAGE,
      merklizeOpts
    );

    const { did: didUser, credential: userAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_USER
    });
    userDID = didUser;
    expect(userAuthCredential).not.to.be.undefined;

    const pkJwk = {
      key_ops: ['decrypt', 'unwrapKey'],
      ext: true,
      kty: 'RSA',
      n: 'qXiO4kdzR5-1iVfQftDVcJi5VcjixNJOAhZEDPot4GMJFuKAe_Oq-7mVd7hHot6T_8IstXfTSijsWq8S1CQg8Ov9Aqv92UQUX-R0QbwzplkbrzfEUEWZAR46T9BqWJ1WvCMqBL54zD9ppB_suE4qBvXsosMxPEkzAEmmGpNPi5GlNLWxtDMiR-u5rs7Tje8V1k-uE8cXORsrBNUQ--Iq71Vpbp5YJtDveDMk5nDuZFkscXI2VHc2sloStZ9DsfMS47jItkbDm5GyFlIdvFSrABVM5gyrDM7SOUzG5ZeiCcKm50wgYIm8QizIHZqHVmexFtcFl8VFHcDVtfIkbXYx5w',
      // eslint-disable-next-line @cspell/spellchecker
      e: 'AQAB',
      d: 'GsSLkQsnFr-PrXdc28MBi4zb7URTKTJsluDMc95KQ8BwzZgOIkXtEmCQTr4hNoUAjGuvoyQfj_2hw3sWtsJUH6mup27iJCCgNTtA76cZ42L8v_LHg8RSc_5ByJyLR57mdcX6G5C4RM6ZUY6nVb8m3T2X2GeLTdHkB94aKeVtsYYYbIOOGDtfDTD_Z-dZ3gdVH2psc2fZstmdg_okaPCzzVD49aWevnB8Y9BzUhwNV6oD_xyJwxGjT1NOXcZV6HMzBBjJ44eCBegus0rjezXrFNB0nPuJRkwt5bfrZmzVfQbYUyIwWrF6vQpjYr6mqQtsdm_U_hykQdx482FMk-WJfQ',
      p: '0dt_krUkUEVD2QkYwhxiM0xwPUiK3hiL5aSkYo5Z3NPpzi7FbrY-a3rSxmTcMXC4rqx1LzoKmKeaDPjnjpUiWqys1588bGc8EPxMVtfiYO60q-aB4PSFGKNEFP4z_12LMsyPao-bctx1DUki07Rdi3oOd8td13wLtfYyLzV7sHU',
      q: 'zrvGtN6mLXzcg7MI4nVKxqYHEACI7EJYrmehVSK09nkuGCYgGhiP-PiR_O39wh1zN73HTatvcIz91QQC4mMvFJoGF-J3J4zqMkiv7gnkJ5mRj3c125iRPclhJDNhgr-yOHEu2upFg31CGZhCfvOi9TScQCU4l20vqDEoobXnjWs',
      dp: 'jr6BHid8leUna1-WqaJo4X_i8KyBWOTVc9Tzw94UHfM_G_IQdWgdOTqIWE6OwEpuNNI1u3P9dSy7yosb5o5mmcrOnrQ_g3UNFHio7IFYCJsV5b-bJIruZX3Yd3cZo1_bqSgffVpFYHG4ZNsUh3AuGQti__Ui1coYpSLbq-TzR2k',
      dq: 'FZum30zOTb7ZRaK28QSVdkHwRwnnRdqBbmlCgaWJCKIN4VRK0q9yjPFeQPOXLGzrmA3sAQBEO51hApzSuFrpltuqe2CeV7Hw4KScTuMVx9XTUw2AwZ0mwTCFSMVeEc57kE60OQl3jpDPEeHKQX6xr7N6CXJagelVq9zHhG-A7lU',
      qi: 'CvIzm858pE_4gW_yr7mUfl6Qo7jacUzim2sFM1kObBg_sNDLW-P8L2zGjmDJxUCHeYG6Gdj-219MN1-qQQnBhpg5LLENkFoseumv_2A8i0uP_j2MMlNFed7P0yGwwfZwcjAmieN2ULfbxJ1Vs7XYg6bzPoM7Sb0JyZRAQfcBtLk',
      alg: 'RSA-OAEP-256'
    };
    pkFunc = async () => {
      return await crypto.subtle.importKey(
        'jwk',
        pkJwk,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256'
        },
        true,
        ['decrypt']
      );
    };
    userDIDDoc = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ],
      id: userDID.string(),
      keyAgreement: [userDID.string() + '#key-1'],
      verificationMethod: [
        {
          id: userDID.string() + '#key-1',
          type: 'JsonWebKey2020',
          controller: userDID.string(),
          publicKeyJwk: toPublicKeyJwk(JSON.stringify(pkJwk), KmsKeyType.RsaOaep256)
        }
      ]
    };
    mockResolver = {
      resolve: async () => ({
        didDocument: userDIDDoc,
        didResolutionMetadata: {},
        didDocumentMetadata: {}
      })
    };
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthInputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );

    joseService = new JoseService(pkFunc);
    fetchHandler = new FetchHandler(packageMgr, {
      credentialWallet: credWallet,
      merklizeOptions: {
        documentLoader: schemaLoaderForTests()
      },
      joseService,
      didResolverUrl
    });

    authHandler = new AuthHandler(packageMgr, proofService);
    const { did: didIssuer, credential: issuerAuthCredential } = await createIdentity(idWallet);
    expect(issuerAuthCredential).not.to.be.undefined;
    issuerDID = didIssuer;
  });

  it('encryption flow', async () => {
    const claimReq: CredentialRequest = {
      credentialSchema: 'ipfs://QmWDmZQrtvidcNK7d6rJwq7ZSi8SUygJaKepN7NhKtGryc',
      type: 'operators',
      credentialSubject: {
        id: userDID.string(),
        boolean1: true,
        'date-time1': '2024-11-04T12:39:00Z',
        integer1: 4321,
        'non-negative-integer1': '654321',
        number1: 1234,
        'positive-integer1': '123456789',
        string1: 'abcd'
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };
    const w3cCred = await idWallet.issueCredential(issuerDID, claimReq, merklizeOpts);
    const toEncrypt = w3cCred.toJSON();
    delete toEncrypt.proof;

    const recipients = [
      {
        did: userDID,
        didDocument: userDIDDoc,
        alg: AcceptJweKEKAlgorithms.RSA_OAEP_256
      }
    ];
    const encryptedCred = await joseService.encrypt(byteEncoder.encode(JSON.stringify(toEncrypt)), {
      enc: CEKEncryption.A256GCM,
      recipients: await getRecipientsJWKs(recipients, mockResolver),
      typ: MediaType.EncryptedMessage
    });

    const proofSerialized = w3cCred.proof ? JSON.parse(JSON.stringify(w3cCred.proof)) : [];
    const msg: EncryptedCredentialIssuanceMessage = {
      id: uuid.v4(),
      thid: uuid.v4(),
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.ENCRYPTED_CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE,
      body: {
        id: w3cCred.id,
        type: w3cCred.credentialStatus.type,
        context: w3cCred['@context'][w3cCred['@context'].length - 1],
        data: encryptedCred,
        proof: proofSerialized
      },
      from: issuerDID.string(),
      to: userDID.string()
    };

    await fetchHandler.handle(msg, { mediaType: MediaType.EncryptedMessage });

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1730736196,
      circuitId: CircuitId.AtomicQueryV3,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        context: 'ipfs://Qmb48rJ5SiQMLXjVkaLQB6fWbT7C8LK75MHsCoHv8GAc15',
        credentialSubject: {
          'positive-integer1': {
            $between: ['123456789', '1123456789']
          }
        },
        type: 'operators'
      }
    };

    const profile: AcceptProfile = {
      protocolVersion: ProtocolVersion.V1,
      env: MediaType.ZKPMessage,
      circuits: [AcceptAuthCircuits.AuthV2]
    };

    const authReq = createAuthorizationRequest(
      'reason',
      issuerDID.string(),
      'http://localhost:8080/callback?id=1234442-123123-123123',
      {
        scope: [proofReq],
        accept: buildAccept([profile])
      }
    );

    const msgBytes = byteEncoder.encode(JSON.stringify(authReq));
    const authRes = await authHandler.handleAuthorizationRequest(userDID, msgBytes);

    const tokenStr = authRes.token;
    expect(tokenStr).to.be.a('string');
    const tokenBytes = byteEncoder.encode(tokenStr);

    const result = await packageMgr.unpack(tokenBytes);

    expect(JSON.stringify(result.unpackedMessage)).to.equal(JSON.stringify(authRes.authResponse));
  });
});
