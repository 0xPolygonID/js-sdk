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
  EncryptedIssuanceResponseHandler,
  EncryptedCredentialIssuanceMessage,
  toPublicKeyJwk,
  KmsKeyType,
  JoseService,
  getRecipientsJWKs
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

describe('auth', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;
  let encryptedIssuanceResponseHandler: EncryptedIssuanceResponseHandler;
  let authHandler: IAuthHandler;
  let packageMgr: IPackageManager;

  let userDID: DID;
  let issuerDID: DID;
  let userDIDDoc: DIDDocument;
  let joseService: JoseService;
  let mockResolver: Resolvable;
  let pkFunc: () => Promise<CryptoKey>;
  let merklizeOpts;
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

    joseService = new JoseService();

    encryptedIssuanceResponseHandler = new EncryptedIssuanceResponseHandler(credWallet, {
      resolvePrivateKeyByKid: pkFunc
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

    await encryptedIssuanceResponseHandler.handle(msg, {});

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
