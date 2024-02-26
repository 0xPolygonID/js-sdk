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
  AuthorizationRequestMessage,
  AuthorizationRequestMessageBody,
  IPackageManager,
  ZeroKnowledgeProofRequest,
  RHSResolver,
  CredentialStatusResolverRegistry,
  PROTOCOL_CONSTANTS,
  createAuthorizationRequestWithMessage,
  AuthorizationResponseMessage,
  ZeroKnowledgeProofResponse
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
import { testOpts } from './mock';

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
          proofType: 'BJJSignature2021',
          allowedIssuers: ['*'],
          type: 'KYCAgeCredential',
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
        circuitId: CircuitId.LinkedMultiQuery10,
        optional: false,
        query: {
          groupId: 1,
          proofType: 'Iden3SparseMerkleTreeProof',
          allowedIssuers: ['*'],
          type: 'KYCEmployee',
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld',
          credentialSubject: {
            documentType: {
              $eq: 1
            },
            position: {
              $eq: 'boss',
              $ne: 'employee'
            }
          }
        }
      },
      {
        id: 3,
        circuitId: CircuitId.AtomicQueryV3,
        optional: false,
        query: {
          groupId: 1,
          proofType: 'BJJSignature2021',
          allowedIssuers: ['*'],
          type: 'KYCEmployee',
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld',
          credentialSubject: {
            hireDate: {
              $eq: '2023-12-11'
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
    console.log(JSON.stringify(authRes.authResponse));
    const tokenStr = authRes.token;
    expect(tokenStr).to.be.a('string');
    const token = await Token.parse(tokenStr);
    expect(token).to.be.a('object');
  });

  it('auth response: TestVerifyMessageWithoutProof', async () => {
    const sender = '1125GJqgw6YEsKFwj63GY87MMxPL9kwDKxPUiwMLNZ';
    const userId = '119tqceWdRd2F6WnAyVuFQRFjK3WUXq2LorSPyG9LJ';
    const callback = 'https://test.com/callback';
    const msg = 'message to sign';
    const request: AuthorizationRequestMessage = createAuthorizationRequestWithMessage(
      'kyc verification',
      msg,
      sender,
      callback
    );

    const response: AuthorizationResponseMessage = {
      id: uuid.v4(),
      thid: request.thid,
      typ: request.typ,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      from: userId,
      to: sender,
      body: {
        message: request.body.message,
        scope: []
      }
    };

    await authHandler.handleAuthorizationResponse(response, request);
  });

  it('auth response: TestVerifyWithAtomicMTPProof', async () => {
    const sender = 'did:polygonid:polygon:mumbai:1125GJqgw6YEsKFwj63GY87MMxPL9kwDKxPUiwMLNZ';
    const callback = 'https://test.com/callback';
    const userId = 'did:polygonid:polygon:mumbai:2qPDLXDaU1xa1ERTb1XKBfPCB3o2wA46q49neiXWwY';
    const reason = 'test';
    const message = 'message to sign';
    const request: AuthorizationRequestMessage = createAuthorizationRequestWithMessage(
      reason,
      message,
      sender,
      callback
    );
    expect(request.body.scope.length).to.be.eq(0);
    expect(request.body.callbackUrl).to.be.eq(callback);
    expect(request.body.reason).to.be.eq(reason);
    expect(request.from).to.be.eq(sender);

    request.thid = '7f38a193-0918-4a48-9fac-36adfdb8b542';

    const proofRequest: ZeroKnowledgeProofRequest = {
      id: 23,
      circuitId: 'credentialAtomicQueryMTPV2',
      query: {
        allowedIssuers: ['*'],
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
        type: 'KYCCountryOfResidenceCredential',
        credentialSubject: {
          countryCode: {
            $nin: [840, 120, 340, 509]
          }
        }
      }
    };
    request.body.scope.push(proofRequest);

    expect(request.body.scope.length).to.be.eq(1);

    const mtpProof: ZeroKnowledgeProofResponse = {
      id: proofRequest.id,
      circuitId: 'credentialAtomicQueryMTPV2',
      proof: {
        pi_a: [
          '261068577516437401613944053873182458364288414130914048345483377226144652651',
          '14191260071695980011679501808453222267520721767757759150101974382053161674611',
          '1'
        ],
        pi_b: [
          [
            '7670847844015116957526183728196977957312627307797919554134684901401436021977',
            '14957845472630017095821833222580194061266186851634053897768738253663253650835'
          ],
          [
            '17835642458484628627556329876919077333912011235308758832172880012813397022104',
            '18100861130149678153133025031709897120097098591298817367491920553037011650228'
          ],
          ['1', '0']
        ],
        pi_c: [
          '6217865949299990642832523256863048932210546049203189113362851476966824162191',
          '19016949225277755690019647385855936969928994210905992628301967883803670436510',
          '1'
        ],
        protocol: 'groth16'
      },
      pub_signals: [
        '1',
        '27152676987128542066808591998573000370436464722519513348891049644813718018',
        '23',
        '27752766823371471408248225708681313764866231655187366071881070918984471042',
        '21545768883509657340209171549441005603306012513932221371599501498534807719689',
        '1',
        '21545768883509657340209171549441005603306012513932221371599501498534807719689',
        '1679323038',
        '336615423900919464193075592850483704600',
        '0',
        '17002437119434618783545694633038537380726339994244684348913844923422470806844',
        '0',
        '5',
        '840',
        '120',
        '340',
        '509',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0'
      ]
    };

    const response: AuthorizationResponseMessage = {
      id: uuid.v4(),
      thid: request.thid,
      typ: request.typ,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      from: userId,
      to: sender,
      body: {
        message: request.body.message,
        scope: [mtpProof]
      }
    };

    await authHandler.handleAuthorizationResponse(response, request, testOpts);
  });

  it('auth response: TestVerifyWithAtomicSigProofNonMerklized', async () => {
    const sender = 'did:polygonid:polygon:mumbai:1125GJqgw6YEsKFwj63GY87MMxPL9kwDKxPUiwMLNZ';
    const callback = 'https://test.com/callback';
    const userId = 'did:polygonid:polygon:mumbai:2qKzaaAewvBVv11iZjJZzjTxBQioZLEujPYTUJp7gQ';
    const reason = 'test';
    const message = 'message to sign';
    const request: AuthorizationRequestMessage = createAuthorizationRequestWithMessage(
      reason,
      message,
      sender,
      callback
    );
    expect(request.body.scope.length).to.be.eq(0);
    expect(request.body.callbackUrl).to.be.eq(callback);
    expect(request.body.reason).to.be.eq(reason);
    expect(request.from).to.be.eq(sender);

    request.thid = '7f38a193-0918-4a48-9fac-36adfdb8b542';

    const proofRequest: ZeroKnowledgeProofRequest = {
      id: 84239,
      circuitId: 'credentialAtomicQuerySigV2',
      query: {
        allowedIssuers: ['*'],
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
        type: 'KYCAgeCredential',
        credentialSubject: {
          documentType: {
            $eq: [99]
          }
        }
      }
    };
    request.body.scope.push(proofRequest);

    expect(request.body.scope.length).to.be.eq(1);

    const mtpProof: ZeroKnowledgeProofResponse = {
      id: proofRequest.id,
      circuitId: 'credentialAtomicQuerySigV2',
      proof: {
        pi_a: [
          '14056228231956087288378518013493130710375131807243578639863710060510262038676',
          '15685597096933930175890593905690244171450509041610585092210638200145586390285',
          '1'
        ],
        pi_b: [
          [
            '6867891861795556838771075779522609255721689620651295420993290050538780283807',
            '12803728874072821363624664338413776845757845422512289455246307343796729670516'
          ],
          [
            '1556511867067742689232747109877739227261867306751037654148240512509806309140',
            '3417379743049361186708759271231315501277403869916476403120965486647240758779'
          ],
          ['1', '0']
        ],
        pi_c: [
          '10569434133480072042978475540156042501239134571700053665222790798542811352807',
          '16412506719218682682070660169432465369639644911994254460610287965570092298694',
          '1'
        ],
        protocol: 'groth16'
      },
      pub_signals: [
        '0',
        '23556362286864724741858679466282977995723542763829611007300550436288008706',
        '6488011081960287964570775172930943914920953982696735236025195378048754598764',
        '84239',
        '21803003425107230045260507608510138502859759480520560654156359021447614978',
        '1',
        '6488011081960287964570775172930943914920953982696735236025195378048754598764',
        '1693230616',
        '198285726510688200335207273836123338699',
        '1',
        '0',
        '3',
        '1',
        '99',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0'
      ]
    };

    const response: AuthorizationResponseMessage = {
      id: uuid.v4(),
      thid: request.thid,
      typ: request.typ,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      from: userId,
      to: sender,
      body: {
        message: request.body.message,
        scope: [mtpProof]
      }
    };

    await authHandler.handleAuthorizationResponse(response, request, testOpts);
  });

  it('auth response: TestVerifyV3MessageWithSigProof_NonMerklized', async () => {
    const request: AuthorizationRequestMessage = {
      id: '28b15cd4-3aa1-4ddc-88a3-c05a0f788065',
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: 'https://iden3-communication.io/authorization/1.0/request',
      thid: '28b15cd4-3aa1-4ddc-88a3-c05a0f788065',
      body: {
        callbackUrl: 'https://test.com/callback',
        reason: 'test',
        message: 'message to sign',
        scope: [
          {
            id: 1,
            circuitId: CircuitId.AtomicQueryV3,
            optional: true,
            query: {
              allowedIssuers: ['*'],
              context:
                'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
              credentialSubject: { documentType: { $eq: 99 } },
              proofType: 'BJJSignature2021',
              type: 'KYCAgeCredential'
            }
          }
        ]
      },
      from: 'did:polygonid:polygon:mumbai:2qEevY9VnKdNsVDdXRv3qSLHRqoMGMRRdE5Gmc6iA7'
    };

    // response
    const message: AuthorizationResponseMessage = {
      id: '59fbefd2-39ce-4346-94f1-49ec86141ba9',
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: 'https://iden3-communication.io/authorization/1.0/response',
      thid: '28b15cd4-3aa1-4ddc-88a3-c05a0f788065',
      body: {
        message: 'message to sign',
        scope: [
          {
            id: 1,
            circuitId: CircuitId.AtomicQueryV3,
            proof: {
              pi_a: [
                '4931850785213949686128999530866355140504398167046521116795481546947184272648',
                '332774575245859134568137417770603285619416893331837204312155221564587668094',
                '1'
              ],
              pi_b: [
                [
                  '14792271695016162952390815554867533625013692933642600379618564819732493637941',
                  '18215310934256606244114322866050307053902107679161350635408930840065889072916'
                ],
                [
                  '17048410972040698560239088146160392663861669520384562422376544822376801389912',
                  '21559641235416117505150830172567831599407748749353430076073365383629391654250'
                ],
                ['1', '0']
              ],
              pi_c: [
                '1398727697779021690907399287414954376665288113096930249445808929806707726439',
                '627223672270092807254159968400380256577737860448215394733886462613367964620',
                '1'
              ],
              protocol: 'groth16'
            },
            pub_signals: [
              '0',
              '21568225469889458305914841490175280093555015071329787375641431262509208065',
              '4487386332479489158003597844990487984925471813907462483907054425759564175341',
              '0',
              '0',
              '0',
              '1',
              '1',
              '25191641634853875207018381290409317860151551336133597267061715643603096065',
              '1',
              '4487386332479489158003597844990487984925471813907462483907054425759564175341',
              '1708958378',
              '198285726510688200335207273836123338699',
              '0',
              '3',
              '1',
              '99',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '1',
              '0',
              '0'
            ]
          }
        ]
      },
      from: 'did:iden3:polygon:mumbai:wuw5tydZ7AAd3efwEqPprnqjiNHR24jqruSPKmV1V',
      to: 'did:polygonid:polygon:mumbai:2qEevY9VnKdNsVDdXRv3qSLHRqoMGMRRdE5Gmc6iA7'
    };

    await authHandler.handleAuthorizationResponse(message, request, testOpts);
  });

  it('auth response: TestVerifyV3MessageWithMtpProof_Merklized', async () => {
    const request = {
      id: '7e5b5847-b479-4499-90ee-5fe4826a5bdd',
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: 'https://iden3-communication.io/authorization/1.0/request',
      thid: '7e5b5847-b479-4499-90ee-5fe4826a5bdd',
      body: {
        callbackUrl: 'https://test.com/callback',
        reason: 'test',
        message: 'message to sign',
        scope: [
          {
            id: 1,
            circuitId: CircuitId.AtomicQueryV3,
            optional: false,
            query: {
              allowedIssuers: ['*'],
              context:
                'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
              credentialSubject: { documentType: { $eq: 99 } },
              proofType: 'Iden3SparseMerkleTreeProof',
              type: 'KYCAgeCredential'
            }
          }
        ]
      },
      from: 'did:polygonid:polygon:mumbai:2qEevY9VnKdNsVDdXRv3qSLHRqoMGMRRdE5Gmc6iA7'
    };

    const message: AuthorizationResponseMessage = {
      id: 'a8ceddf8-24c8-4797-bb94-234a17c6b551',
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: 'https://iden3-communication.io/authorization/1.0/response',
      thid: '7e5b5847-b479-4499-90ee-5fe4826a5bdd',
      body: {
        message: 'message to sign',
        scope: [
          {
            id: 1,
            circuitId: CircuitId.AtomicQueryV3,
            proof: {
              pi_a: [
                '21670105620652703601477810515677208955235385482913430843458796496505567239793',
                '13288728367063292010057292794440148934003973173769496254360913324078694891034',
                '1'
              ],
              pi_b: [
                [
                  '16370966906841564400313385717883093075944937381897969856709983472924165509408',
                  '7778887146640489720647167503138118335113598059976826778839162024634297503509'
                ],
                [
                  '3056709170897468503543133506346448343248296922943029424017396286992125449008',
                  '18924324019871646744005830283614996965229851563759352746018105419445741419358'
                ],
                ['1', '0']
              ],
              pi_c: [
                '11756251835947810289905030105462848637445985844896239324130081980601483358204',
                '3744754840803796468374265874229396141965695715998580645165923368421757602995',
                '1'
              ],
              protocol: 'groth16'
            },
            pub_signals: [
              '1',
              '21568225469889458305914841490175280093555015071329787375641431262509208065',
              '6880296436594660732089540737768771091806334429473963727848865469054445967519',
              '0',
              '0',
              '0',
              '2',
              '1',
              '19898531390599208021876718705689344940605246460654065917270282371355906561',
              '1',
              '5224437024673068498206105743424598123651101873588696368477339341771571761791',
              '1708958971',
              '74977327600848231385663280181476307657',
              '17040667407194471738958340146498954457187839778402591036538781364266841966',
              '0',
              '1',
              '99',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '0',
              '1',
              '0',
              '0'
            ]
          }
        ]
      },
      from: 'did:iden3:polygon:mumbai:wuw5tydZ7AAd3efwEqPprnqjiNHR24jqruSPKmV1V',
      to: 'did:polygonid:polygon:mumbai:2qEevY9VnKdNsVDdXRv3qSLHRqoMGMRRdE5Gmc6iA7'
    };

    await authHandler.handleAuthorizationResponse(message, request, testOpts);
  });

  it('auth response: linked multi query', async () => {
    const authRequest: AuthorizationRequestMessage = {
      id: 'f5bcdfc9-3819-4052-ad97-c059119e563c',
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: 'https://iden3-communication.io/authorization/1.0/request',
      thid: 'f5bcdfc9-3819-4052-ad97-c059119e563c',
      body: {
        callbackUrl: 'http://localhost:8080/callback?id=1234442-123123-123123',
        reason: 'reason',
        message: 'mesage',
        did_doc: {},
        scope: [
          {
            id: 1,
            circuitId: CircuitId.AtomicQueryV3,
            optional: false,
            query: {
              proofType: 'BJJSignature2021',
              allowedIssuers: ['*'],
              type: 'KYCAgeCredential',
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
            circuitId: CircuitId.LinkedMultiQuery10,
            optional: false,
            query: {
              groupId: 1,
              proofType: 'Iden3SparseMerkleTreeProof',
              allowedIssuers: ['*'],
              type: 'KYCEmployee',
              context:
                'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld',
              credentialSubject: {
                documentType: {
                  $eq: 1
                },
                position: {
                  $eq: 'boss',
                  $ne: 'employee'
                }
              }
            }
          },
          {
            id: 3,
            circuitId: CircuitId.AtomicQueryV3,
            optional: false,
            query: {
              groupId: 1,
              proofType: 'BJJSignature2021',
              allowedIssuers: ['*'],
              type: 'KYCEmployee',
              context:
                'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld',
              credentialSubject: {
                hireDate: {
                  $eq: '2023-12-11'
                }
              }
            }
          }
        ]
      },
      from: 'did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth'
    };

    const response = JSON.parse(
      `{"id":"7c540719-6661-4e6b-9a50-a9b8126a675a","typ":"application/iden3-zkp-json","type":"https://iden3-communication.io/authorization/1.0/response","thid":"0920184a-8f24-4008-93a0-631bc9a13511","body":{"message":"mesage","scope":[{"id":1,"circuitId":"credentialAtomicQueryV3-beta.1","proof":{"pi_a":["3030176417884730006651206052602255051790850007135285936301560919717732630998","5040477087541340798226648868397115527283505028755391829266014875271989750683","1"],"pi_b":[["17795516759703011668831771038326188461666950659541501874605610898838510408735","4735720104046595432757040585120112659133588293447825842076983964051101769811"],["2827444655650105762244879304968324476490431713433615972370430582572968481310","20807025806002229154656472930599414864310483178171204713761612616646345234958"],["1","0"]],"pi_c":["3227253123162477336968247670751100483706950991058207498270264851760648941622","7044174843298971491659929705621641100883938547236784093298768995002993377533","1"],"protocol":"groth16","curve":"bn128"},"pub_signals":["0","21568225469889458305914841490175280093555015071329787375641431262509208065","4487386332479489158003597844990487984925471813907462483907054425759564175341","0","0","0","1","1","25191641634853875207018381290409317860151551336133597267061715643603096065","1","4487386332479489158003597844990487984925471813907462483907054425759564175341","1708961464","198285726510688200335207273836123338699","0","3","1","99","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1","25191641634853875207018381290409317860151551336133597267061715643603096065","0"]},{"id":2,"circuitId":"linkedMultiQuery10-beta.1","proof":{"pi_a":["18185847353052934865230404719156022163399368954470170538676880061459368999779","14464408180020742166693247079177436775752326011061224547697796428402798031294","1"],"pi_b":[["5486510722445382672919752004736506894856824574263683498915539512144028404774","8580764508065091940882287757125897614262533511378981241638897223454886292773"],["17385020398178063478240050067107296517608581991344352955281156089698513759896","11205021263116047184958072282291264147570779034932889851750230186637020246932"],["1","0"]],"pi_c":["10825306354583563169974546379087917365605355006582058701016587121750444821030","2068389904697193879287197338390644753440566095683684747435912049163045832111","1"],"protocol":"groth16","curve":"bn128"},"pub_signals":["13540827240317258301292573817144228641000667684042123304554330568838192728782","1","0","0","0","0","0","0","0","0","0","0","21245348791188258988345662140270861371579863153708909661100131554574907745870","21223146970772332952549847836778356110736819931538081971757660798559590436544","11494346628425977431906230268947551105254435074971531556089719901964422455064","1323065337541750290782532745380964064477418988417989222400047957129375379156","1323065337541750290782532745380964064477418988417989222400047957129375379156","1323065337541750290782532745380964064477418988417989222400047957129375379156","1323065337541750290782532745380964064477418988417989222400047957129375379156","1323065337541750290782532745380964064477418988417989222400047957129375379156","1323065337541750290782532745380964064477418988417989222400047957129375379156","1323065337541750290782532745380964064477418988417989222400047957129375379156","1","1","1","0","0","0","0","0","0","0"]},{"id":3,"circuitId":"credentialAtomicQueryV3-beta.1","proof":{"pi_a":["5630539291819016806800043136192439233865748262837648456227748784964305118352","17669357700350924676497747315701786772867785420275090370688969276184432396049","1"],"pi_b":[["4850830087392911632867689913941526392966834591404151690513017670810308642454","13678284616234906942169612506246711512832830021424992656328988640911135573084"],["2557908554792091144745950056444678688373147567479992844699001442157850919021","7011168941718076933512478088924178945962972795901392756734445239122651750980"],["1","0"]],"pi_c":["2078325860555462547146010537798733321927975135855358259142716572206353920679","6610347676574233228800819257026066303451930647777236692400100964232488922553","1"],"protocol":"groth16","curve":"bn128"},"pub_signals":["1","21568225469889458305914841490175280093555015071329787375641431262509208065","4487386332479489158003597844990487984925471813907462483907054425759564175341","13540827240317258301292573817144228641000667684042123304554330568838192728782","0","0","1","3","25191641634853875207018381290409317860151551336133597267061715643603096065","1","4487386332479489158003597844990487984925471813907462483907054425759564175341","1708961480","219578617064540016234161640375755865412","1296351758269061173317105041968067077451914386086222931516199194959869463882","0","1","1702252800000000000","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1","25191641634853875207018381290409317860151551336133597267061715643603096065","0"]}]},"from":"did:iden3:polygon:mumbai:wuw5tydZ7AAd3efwEqPprnqjiNHR24jqruSPKmV1V","to":"did:iden3:polygon:mumbai:wzokvZ6kMoocKJuSbftdZxTD6qvayGpJb3m4FVXth"}`
    ) as AuthorizationResponseMessage;
    await authHandler.handleAuthorizationResponse(response, authRequest, testOpts);
  });
});
