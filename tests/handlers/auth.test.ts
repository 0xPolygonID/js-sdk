/* eslint-disable no-console */

import path from 'path';
import {
  IDataStorage,
  CredentialRequest,
  CredentialWallet,
  ProofService,
  CircuitId,
  AuthHandler,
  EthStateStorage,
  FSCircuitStorage,
  IAuthHandler,
  IdentityWallet,
  byteEncoder,
  CredentialStatusType,
  ProofType,
  AuthorizationRequestMessage,
  AuthorizationRequestMessageBody,
  IPackageManager,
  ZeroKnowledgeProofRequest,
  RHSResolver,
  CredentialStatusResolverRegistry,
  PROTOCOL_CONSTANTS
} from '../../src';
import { Token } from '@iden3/js-jwz';
import { DID } from '@iden3/js-iden3-core';
import { expect } from 'chai';
import { ethers } from 'ethers';
import * as uuid from 'uuid';
import {
  MOCK_STATE_STORAGE,
  getInMemoryDataStorage,
  registerBJJIntoInMemoryKMS,
  IPFS_URL,
  getPackageMgr,
  createIdentity,
  SEED_USER,
  RHS_URL,
  WALLET_KEY
} from '../helpers';

describe('auth', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;
  let authHandler: IAuthHandler;
  let packageMgr: IPackageManager;

  let userDID: DID;
  let issuerDID: DID;

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

    proofService = new ProofService(idWallet, credWallet, circuitStorage, MOCK_STATE_STORAGE, {
      ipfsNodeURL: IPFS_URL
    });

    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );
    authHandler = new AuthHandler(packageMgr, proofService);

    const { did: didUser, credential: userAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_USER
    });
    userDID = didUser;

    expect(userAuthCredential).not.to.be.undefined;

    const { did: didIssuer, credential: issuerAuthCredential } = await createIdentity(idWallet);
    expect(issuerAuthCredential).not.to.be.undefined;
    issuerDID = didIssuer;
  });

  it('request-response flow identity (not profile)', async () => {
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
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQuerySigV2,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
        credentialSubject: {
          documentType: {
            $eq: 99
          }
        }
      }
    };

    const authReqBody: AuthorizationRequestMessageBody = {
      callbackUrl: 'http://localhost:8080/callback?id=1234442-123123-123123',
      reason: 'reason',
      message: 'mesage',
      did_doc: {},
      scope: [proofReq as ZeroKnowledgeProofRequest]
    };

    const id = uuid.v4();
    const authReq: AuthorizationRequestMessage = {
      id,
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: authReqBody,
      from: issuerDID.string()
    };

    const msgBytes = byteEncoder.encode(JSON.stringify(authReq));
    const authRes = await authHandler.handleAuthorizationRequest(userDID, msgBytes);

    const tokenStr = authRes.token;
    expect(tokenStr).to.be.a('string');
    const token = await Token.parse(tokenStr);
    expect(token).to.be.a('object');
  });

  it('request-response flow profiles', async () => {
    // assume that we authorized to the issuer with profile did
    const profileDID = await idWallet.createProfile(userDID, 50, issuerDID.string());

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: profileDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: CircuitId.AtomicQuerySigV2,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
        credentialSubject: {
          documentType: {
            $eq: 99
          }
        }
      }
    };

    const authReqBody: AuthorizationRequestMessageBody = {
      callbackUrl: 'http://localhost:8080/callback?id=1234442-123123-123123',
      reason: 'reason',
      message: 'mesage',
      did_doc: {},
      scope: [proofReq as ZeroKnowledgeProofRequest]
    };

    const verifierDID = 'did:example:123#JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw';
    const id = uuid.v4();
    const authReq: AuthorizationRequestMessage = {
      id,
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: authReqBody,
      from: verifierDID
    };

    const msgBytes = byteEncoder.encode(JSON.stringify(authReq));

    // you can create new profile here for auth or if you want to login with genesis set to 0.

    const authR = await authHandler.parseAuthorizationRequest(msgBytes);

    // let's check that we didn't create profile for verifier
    const authProfile = await idWallet.getProfileByVerifier(authR.from);
    const authProfileDID = authProfile
      ? DID.parse(authProfile.id)
      : await idWallet.createProfile(userDID, 100, authR.from);

    const resp = await authHandler.handleAuthorizationRequest(authProfileDID, msgBytes);
    expect(resp).not.to.be.undefined;
  });

  it('auth flow identity (profile) with circuits V3', async () => {
    const profileDID = await idWallet.createProfile(userDID, 777, issuerDID.string());

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
    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);
    const employeeCredRequest: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCEmployee-v101.json',
      type: 'KYCEmployee',
      credentialSubject: {
        id: profileDID.string(),
        ZKPexperiance: true,
        hireDate: '2023-12-11',
        position: 'boss',
        salary: 200,
        documentType: 1
      },
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        id: RHS_URL
      }
    };
    const employeeCred = await idWallet.issueCredential(issuerDID, employeeCredRequest);

    await credWallet.saveAll([employeeCred, issuerCred]);

    const res = await idWallet.addCredentialsToMerkleTree([employeeCred], issuerDID);
    await idWallet.publishStateToRHS(issuerDID, RHS_URL);

    const ethSigner = new ethers.Wallet(
      WALLET_KEY,
      (dataStorage.states as EthStateStorage).provider
    );

    const txId = await proofService.transitState(
      issuerDID,
      res.oldTreeState,
      true,
      dataStorage.states,
      ethSigner
    );

    const credsWithIden3MTPProof = await idWallet.generateIden3SparseMerkleTreeProof(
      issuerDID,
      res.credentials,
      txId
    );

    await credWallet.saveAll(credsWithIden3MTPProof);

    const proofReqs: ZeroKnowledgeProofRequest[] = [
      {
        id: 1,
        circuitId: CircuitId.AtomicQueryV3,
        optional: false,
        query: {
          allowedIssuers: ['*'],
          type: claimReq.type,
          proofType: ProofType.BJJSignature,
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
          credentialSubject: {
            documentType: {
              $eq: 99
            }
          }
        }
      },
      {
        id: 2,
        circuitId: CircuitId.AtomicQueryV3,
        optional: false,
        params: {
          nullifierSessionId: 12345
        },
        query: {
          groupId: 1,
          proofType: ProofType.BJJSignature,
          allowedIssuers: ['*'],
          type: 'KYCEmployee',
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld',
          skipClaimRevocationCheck: true,
          credentialSubject: {
            salary: {
              $eq: 200
            }
          }
        }
      },
      {
        id: 3,
        circuitId: CircuitId.LinkedMultiQuery10,
        optional: false,
        query: {
          groupId: 1,
          proofType: ProofType.Iden3SparseMerkleTreeProof,
          allowedIssuers: ['*'],
          type: 'KYCEmployee',
          skipClaimRevocationCheck: true,
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld',
          credentialSubject: {
            salary: {
              $ne: 300
            }
          }
        }
      }
    ];

    const authReqBody: AuthorizationRequestMessageBody = {
      callbackUrl: 'http://localhost:8080/callback?id=1234442-123123-123123',
      reason: 'reason',
      message: 'mesage',
      did_doc: {},
      scope: proofReqs
    };

    const id = uuid.v4();
    const authReq: AuthorizationRequestMessage = {
      id,
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: authReqBody,
      from: issuerDID.string()
    };

    const msgBytes = byteEncoder.encode(JSON.stringify(authReq));
    const authRes = await authHandler.handleAuthorizationRequest(userDID, msgBytes);

    const tokenStr = authRes.token;
    expect(tokenStr).to.be.a('string');
    const token = await Token.parse(tokenStr);
    expect(token).to.be.a('object');
  });
});
