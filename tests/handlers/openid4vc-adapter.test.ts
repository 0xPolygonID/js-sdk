import { DID } from '@iden3/js-iden3-core';
import { expect } from 'chai';
import path from 'path';
import {
  AuthHandler,
  AuthorizationRequestMessage,
  byteEncoder,
  CircuitId,
  createVerifiablePresentation,
  CredentialRequest,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  CredentialWallet,
  decodeBase64url,
  encodeBase64url,
  FSCircuitStorage,
  IAuthHandler,
  IDataStorage,
  IdentityWallet,
  IPackageManager,
  ProofQuery,
  ProofService,
  ProofType,
  PROTOCOL_CONSTANTS,
  RHSResolver,
  W3CCredential,
  ZeroKnowledgeProofRequest
} from '../../src';
import {
  createIdentity,
  getInMemoryDataStorage,
  getPackageMgr,
  IPFS_URL,
  MOCK_STATE_STORAGE,
  registerKeyProvidersInMemoryKMS,
  RHS_URL,
  SEED_USER
} from '../helpers';

export interface OpenId4VpRequest {
  presentation_definition: string;
  response_type: string;
  redirect_uri: string;
  nonce: string;
  client_id: string;
}

export interface OpenId4VpResponse {
  vp_token: string;
  presentation_submission: string;
}

export interface PresentationSubmission {
  id: string;
  definition_id: string;
  descriptor_map: {
    id: string;
    format: string;
    path: string;
    path_nested?: {
      format: string;
      path: string;
    };
  }[];
}

export interface PresentationDefinition {
  id: string;
  input_descriptors: InputDescriptor[];
}

export interface InputDescriptor {
  id: number;
  format: {
    iden3_zkp_request: {
      circuitId: string;
      optional: boolean;
      query: ProofQuery;
    };
  };
  constraints: {
    limit_disclosure: string;
    fields?: {
      path: string[];
      filter: {
        const: number;
      };
    }[];
  };
}

describe('openid4vc', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;
  let authHandler: IAuthHandler;
  let packageMgr: IPackageManager;

  let userDID: DID;
  let issuerDID: DID;

  const adaptZKPProofReq = (pd: PresentationDefinition): ZeroKnowledgeProofRequest => {
    const inputDescriptor = pd.input_descriptors[0];
    const iden3zkpReq = inputDescriptor.format.iden3_zkp_request;
    const zkpRequest = {
      id: inputDescriptor.id,
      circuitId: iden3zkpReq.circuitId,
      optional: iden3zkpReq.optional,
      query: {
        ...iden3zkpReq.query
      }
    };
    return zkpRequest;
  };

  const adaptOpenIdReq = (req: OpenId4VpRequest): AuthorizationRequestMessage => {
    const pd: PresentationDefinition = JSON.parse(decodeBase64url(req.presentation_definition));
    const zkpReq = adaptZKPProofReq(pd);
    const clienIdDID = DID.parse(req.client_id);
    return {
      id: pd.id,
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
      body: {
        callbackUrl: req.redirect_uri,
        scope: [zkpReq]
      },
      from: clienIdDID.string()
    };
  };
  const presentationDefinition: PresentationDefinition = {
    id: 'example_iden3_vc_sd',
    input_descriptors: [
      {
        id: 1,
        format: {
          iden3_zkp_request: {
            circuitId: CircuitId.AtomicQueryV3,
            optional: false,
            query: {
              allowedIssuers: ['*'],
              context:
                'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v4.jsonld',
              credentialSubject: {
                documentType: {
                  $eq: 99
                }
              },
              type: 'KYCAgeCredential',
              proofType: ProofType.BJJSignature
            }
          }
        },
        constraints: {
          limit_disclosure: 'required'
        }
      }
    ]
  };

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

  it('test adapter', async () => {
    const zkpReq = adaptZKPProofReq(presentationDefinition);
    expect(zkpReq).not.to.be.undefined;
    expect(zkpReq.id).eq(presentationDefinition.input_descriptors[0].id);
  });

  it.only('test openid request', async () => {
    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v4.json',
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

    const req: OpenId4VpRequest = {
      presentation_definition: encodeBase64url(JSON.stringify(presentationDefinition)),
      response_type: 'vp_token',
      client_id: 'did:example:123#JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw',
      redirect_uri: 'http://localhost:8080/callback?id=1234442-123123-123123',
      nonce: '0S6_WzA2Mj'
    };

    const authReq = adaptOpenIdReq(req);
    expect(authReq.id).to.be.eq(presentationDefinition.id);

    // handle iden3 auth req:
    const msgBytes = byteEncoder.encode(JSON.stringify(authReq));
    const authRes = await authHandler.handleAuthorizationRequest(userDID, msgBytes);
    const scope = authRes.authResponse.body.scope[0];
    let vp = scope.vp;
    if (!vp) {
      const query = authRes.authRequest.body.scope[0].query;
      const context = query['context'] as string;
      const credentialType = query['type'] as string;
      vp = createVerifiablePresentation(context, credentialType, new W3CCredential(), []);
    }

    vp['verifiableCredential'].holder = authRes.authResponse.from;
    // add zkp proofs to vp/vc
    const zkpCredProof = {
      circuit_id: scope.circuitId,
      pi_a: scope.proof.pi_a,
      pi_b: scope.proof.pi_b,
      pi_c: scope.proof.pi_c,
      protocol: scope.proof.protocol,
      curve: (scope.proof as unknown as { curve: string }).curve,
      pub_signals: scope.pub_signals
    };

    const tokenDecoded = decodeBase64url(authRes.token.split('.')[2]);
    const { proof: authProof, pub_signals: authPubSginals } = JSON.parse(tokenDecoded);

    const authZkpProof = {
      circuit_id: CircuitId.AuthV2,
      pi_a: authProof.pi_a,
      pi_b: authProof.pi_b,
      pi_c: authProof.pi_c,
      protocol: authProof.protocol,
      curve: authProof.curve,
      pub_signals: authPubSginals
    };
    vp['zkProof'] = authZkpProof;
    vp['verifiableCredential']['zkProof'] = zkpCredProof;
    vp['@context'] = [...vp['@context'], '<zkProofContext>'];
    vp['verifiableCredential']['@context'] = [...vp['@context'], '<zkProofContext>'];

    const presentationSubmission: PresentationSubmission = {
      id: 'Presentation submission example',
      definition_id: presentationDefinition.id,
      descriptor_map: [
        {
          id: presentationDefinition.input_descriptors[0].id.toString(),
          format: 'iden3_zkp_request',
          path: '$'
        }
      ]
    };
    const openIdResponse: OpenId4VpResponse = {
      vp_token: encodeBase64url(JSON.stringify(vp)),
      presentation_submission: encodeBase64url(JSON.stringify(presentationSubmission))
    };
    console.log(JSON.stringify(openIdResponse));
  });
});
