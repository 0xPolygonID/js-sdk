/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai';
import {
  AuthHandler,
  AuthorizationRequestMessage,
  BasicMessage,
  CircuitId,
  CredentialRequest,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  CredentialWallet,
  IPackageManager,
  IdentityWallet,
  PROTOCOL_CONSTANTS,
  PackageManager,
  PlainPacker,
  ProofService,
  RHSResolver,
  byteEncoder,
  IProtocolMessageHandler,
  byteDecoder
} from '../../src';
import {
  AbstractMessageHandler,
  MessageHandler
} from '../../src/iden3comm/handlers/message-handler';
import { DID } from '@iden3/js-iden3-core';
import {
  MOCK_STATE_STORAGE,
  RHS_URL,
  SEED_USER,
  createIdentity,
  getInMemoryDataStorage,
  registerKeyProvidersInMemoryKMS
} from '../helpers';
import { randomUUID } from 'crypto';

class DummyHandler extends AbstractMessageHandler implements IProtocolMessageHandler {
  constructor(private readonly _type: string) {
    super();
  }
  public async handle(
    msg: BasicMessage,
    ctx: { [key: string]: unknown }
  ): Promise<BasicMessage | null> {
    if (msg.type === this._type) {
      return {
        ...msg,
        body: ctx
      } as BasicMessage;
    }

    return super.handle(msg, ctx);
  }
}

describe('MessageHandler', () => {
  it('should throw invalid handle messages', async () => {
    const messageHandler = new MessageHandler({
      messageHandlers: [],
      packageManager: {} as IPackageManager
    });

    expect(
      messageHandler.handleMessage(new Uint8Array(), { senderDid: new DID() })
    ).to.be.rejectedWith('Message handler not provided');

    expect(
      messageHandler.handleMessage(byteEncoder.encode('{"type":"other-type"}'), {
        senderDid: new DID()
      })
    ).to.be.rejectedWith('Message handler not provided');
  });

  it('should handle auth req/resp messages', async () => {
    const kms = registerKeyProvidersInMemoryKMS();
    const dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);

    const dummyHandler = {
      handle: async () => {
        return {
          type: 'msg-type-resp'
        };
      }
    } as unknown as AbstractMessageHandler;
    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    const credWallet = new CredentialWallet(dataStorage, resolvers);
    const idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    const proofService = {
      generateProof: async () => {
        return JSON.parse(
          `{"id":1,"circuitId":"credentialAtomicQuerySigV2","proof":{"pi_a":["6090318505987607359116982693709498160512347822060118450158275035797244829466","10624590653441467100050235454358781645745036858579539447945227388470932932596","1"],"pi_b":[["15579599033734000552482480659488902457490303622893675003352684240718764814125","19853179897655798140882806183640277943881334163549025939133177045611827693142"],["17956252054758699988777560724871589999140996895310716217662917525735985669808","4167679433625239489900435862379953507102203954849993146650986670022269249242"],["1","0"]],"pi_c":["15357965579564127675469843845487444552040169552941561049967346379131096661554","6737190440198712400571200710355589533896053379119710658028067695173227485133","1"],"protocol":"groth16","curve":"bn128"},"pub_signals":["0","21575127216236248869702276246037557119007466180301957762196593786733007617","4487386332479489158003597844990487984925471813907462483907054425759564175341","1","25198543381200665770805816046271594885604002445105767653616878167826895617","1","4487386332479489158003597844990487984925471813907462483907054425759564175341","1712602611","198285726510688200335207273836123338699","1","0","3","1","99","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"]}`
        );
      },
      verifyZKPResponse: () => Promise.resolve({})
    } as unknown as ProofService;

    const packageMgr = new PackageManager();
    packageMgr.registerPackers([new PlainPacker()]);

    const authHandler = new AuthHandler(packageMgr, proofService);

    const { did: userDID, credential: userAuthCredential } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    expect(userAuthCredential).not.to.be.undefined;

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet);
    expect(issuerAuthCredential).not.to.be.undefined;

    const messageHandler = new MessageHandler({
      messageHandlers: [authHandler, dummyHandler],
      packageManager: packageMgr
    });

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

    const id = randomUUID();
    const authReq: AuthorizationRequestMessage = {
      id,
      typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      type: PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
      thid: id,
      body: {
        callbackUrl: 'http://localhost:8080/callback?id=1234442-123123-123123',
        reason: 'reason',
        message: 'mesage',
        did_doc: {},
        scope: [
          {
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
          }
        ]
      },
      from: issuerDID.string()
    };

    const msgBytes = await packageMgr.packMessage(
      PROTOCOL_CONSTANTS.MediaType.PlainMessage,
      authReq,
      {}
    );

    const authResp = await messageHandler.handleMessage(msgBytes, {
      senderDid: issuerDID
    });

    expect(authResp).not.to.be.null;

    const { unpackedMessage: authRespMsg } = await packageMgr.unpack(authResp!);

    expect(authRespMsg.type).to.be.eq(
      PROTOCOL_CONSTANTS.PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE
    );

    await messageHandler.handleMessage(authResp!, {
      request: authReq
    });

    const dummyHandlerResponseMsg = await dummyHandler.handle(
      {
        type: 'msg-type-req'
      } as unknown as BasicMessage,
      {}
    );

    expect(dummyHandlerResponseMsg).not.to.be.null;
    expect(dummyHandlerResponseMsg!.type).to.be.eq('msg-type-resp');
  });

  it('dynamic register message handler with own context', async () => {
    const packageManager = new PackageManager();
    packageManager.registerPackers([new PlainPacker()]);
    const messageHandler = new MessageHandler({
      messageHandlers: [new DummyHandler('dummy-handler-1'), new DummyHandler('dummy-handler-2')],
      packageManager
    });

    // call handleMessage with a message with a custom type
    const resp = await messageHandler.handleMessage(
      byteEncoder.encode('{"type":"dummy-handler-2", "typ": "application/iden3comm-plain-json"}'),
      {
        myKey: 'did:example:123'
      }
    );

    expect(byteDecoder.decode(resp!)).to.be.eq(
      JSON.stringify({
        type: 'dummy-handler-2',
        typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
        body: {
          myKey: 'did:example:123'
        }
      })
    );

    // register a new handler
    messageHandler.registerHandlers([new DummyHandler('dummy-handler-3')]);

    // call handleMessage with a message with a custom type
    const resp2 = await messageHandler.handleMessage(
      byteEncoder.encode('{"type":"dummy-handler-3", "typ": "application/iden3comm-plain-json"}'),
      {
        myKey2: 'did:example:321'
      }
    );
    // verify that handle newly registered msg pass successfully
    expect(byteDecoder.decode(resp2!)).to.be.eq(
      JSON.stringify({
        type: 'dummy-handler-3',
        typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
        body: {
          myKey2: 'did:example:321'
        }
      })
    );

    // call handleMessage with a message with a custom type
    const resp3 = await messageHandler.handleMessage(
      byteEncoder.encode('{"type":"dummy-handler-1", "typ": "application/iden3comm-plain-json"}'),
      {
        myKey3: 'did:example:321'
      }
    );

    // verify that registration didn't broke previous handlers
    expect(byteDecoder.decode(resp3!)).to.be.eq(
      JSON.stringify({
        type: 'dummy-handler-1',
        typ: PROTOCOL_CONSTANTS.MediaType.PlainMessage,
        body: {
          myKey3: 'did:example:321'
        }
      })
    );
  });
});
