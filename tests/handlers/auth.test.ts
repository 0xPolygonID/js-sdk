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
import { mockStateResolver, testOpts } from './mock';

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
      ipfsNodeURL: IPFS_URL,
      stateResolver: mockStateResolver
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

  it.only('auth response: TestVerifyWithAtomicMTPProof', async () => {
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

  it.only('auth response: TestVerifyWithAtomicSigProofNonMerklized', async () => {
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

  it.only('auth response: TestVerifyV3MessageWithSigProof_NonMerklized', async () => {
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
            id: 84239,
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
            id: 84239,
            circuitId: CircuitId.AtomicQueryV3,
            proof: {
              pi_a: [
                '15208931239306667614189217356426367087296508213411046833716711442163868780112',
                '20490648944065703271613941501811057996992005137106581261392868037192830801319',
                '1'
              ],
              pi_b: [
                [
                  '9658837325736932089175519161219586340790605854199431170964132439402760343882',
                  '2229712957417570067219766417050901639838551011053815708957384652110672096636'
                ],
                [
                  '8001092431519117455354797520811940294780537362771012429305941024017334317686',
                  '14862879727984936294040948959940841120433831193863247939940900720892674782281'
                ],
                ['1', '0']
              ],
              pi_c: [
                '10979201893913563932568403855542624651100292054247823659266571152101750130209',
                '21286864035525845180147694216456377751365547090829007463506610939813242720910',
                '1'
              ],
              protocol: 'groth16'
            },
            pub_signals: [
              '0',
              '22466018227912887497595444357663749526852544754809814096731120723497783810',
              '7232286365358812826682228661780467195854751779823604018938921042558237169817',
              '0',
              '0',
              '0',
              '1',
              '84239',
              '26675680708205250151451142983868154544835349648265874601395279235340702210',
              '1',
              '7232286365358812826682228661780467195854751779823604018938921042558237169817',
              '1702457100',
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
              '0',
              '22728440853100433399211827098349696449620101147489499428101651758549307906',
              '0'
            ]
          }
        ]
      },
      from: 'did:polygonid:polygon:mumbai:2qFXWZVHKTaYX1vmTGtStgRq1s8vUWhQ7HLjtqb2fV',
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
            id: 84239,
            circuitId: CircuitId.AtomicQueryV3,
            optional: true,
            query: {
              allowedIssuers: [
                'did:polygonid:polygon:mumbai:2qKKc4jxAhabrdFrAF3iC7boycfdQmWXq2qTBU4sPc'
              ],
              context:
                'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v101.json-ld',
              credentialSubject: { ZKPexperiance: { $eq: true } },
              proofType: 'Iden3SparseMerkleTreeProof',
              type: 'KYCEmployee'
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
            id: 84239,
            circuitId: CircuitId.AtomicQueryV3,
            proof: {
              pi_a: [
                '2191675399003747228361650328748147195525067334657244384911902711268678817802',
                '19948479904115663964234685946314006853666845209972027887002197866333362304394',
                '1'
              ],
              pi_b: [
                [
                  '422189606437031219571968003421368368386938453003241975855652752251201163758',
                  '9263822572774254449054388930060153687464515712228765747368750307969672340141'
                ],
                [
                  '19293339395101879017873172109004141351276884864694548105955158013357482683356',
                  '2779213239514041287265984937924693652347623320831272361142245115033321578990'
                ],
                ['1', '0']
              ],
              pi_c: [
                '3805936274754036854895936107504061566835912493410231954955974762213052034636',
                '11817318886045212940702535466395270095280111730105021796772613798925818134104',
                '1'
              ],
              protocol: 'groth16'
            },
            pub_signals: [
              '1',
              '22466018227912887497595444357663749526852544754809814096731120723497783810',
              '16501727979801979045409842472064689783782600072880560178348889772807800718289',
              '0',
              '0',
              '0',
              '2',
              '84239',
              '26675680708205250151451142983868154544835349648265874601395279235340702210',
              '1',
              '16501727979801979045409842472064689783782600072880560178348889772807800718289',
              '1702457550',
              '219578617064540016234161640375755865412',
              '0',
              '1944808975288007371356450257872165609440470546066507760733183342797918372827',
              '0',
              '1',
              '18586133768512220936620570745912940619677854269274689475585506675881198879027',
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
              '22728440853100433399211827098349696449620101147489499428101651758549307906',
              '0'
            ]
          }
        ]
      },
      from: 'did:polygonid:polygon:mumbai:2qFXWZVHKTaYX1vmTGtStgRq1s8vUWhQ7HLjtqb2fV',
      to: 'did:polygonid:polygon:mumbai:2qEevY9VnKdNsVDdXRv3qSLHRqoMGMRRdE5Gmc6iA7'
    };

    await authHandler.handleAuthorizationResponse(message, request, testOpts);
  });
});
