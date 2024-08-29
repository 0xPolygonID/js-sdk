import {
  IPackageManager,
  IdentityWallet,
  CredentialWallet,
  CredentialStatusResolverRegistry,
  RHSResolver,
  CredentialStatusType,
  FSCircuitStorage,
  ProofService,
  CircuitId,
  PlainPacker,
  PackageManager,
  PaymentRequestType,
  PaymentRequestDataType,
  byteEncoder,
  PaymentType,
  BasicMessage,
  createProposal,
  SupportedCurrencies
} from '../../src';

import {
  MOCK_STATE_STORAGE,
  getInMemoryDataStorage,
  getPackageMgr,
  registerKeyProvidersInMemoryKMS,
  createIdentity,
  SEED_USER,
  SEED_ISSUER,
  WALLET_KEY,
  RPC_URL
} from '../helpers';

import { expect } from 'chai';
import path from 'path';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { DID } from '@iden3/js-iden3-core';
import {
  createPayment,
  createPaymentRequest,
  IPaymentHandler,
  PaymentHandler
} from '../../src/iden3comm/handlers/payment';
import {
  PaymentRequestDataInfo,
  PaymentRequestInfo
} from '../../src/iden3comm/types/protocol/payment';
import { Contract, ethers, JsonRpcProvider } from 'ethers';
import fetchMock from '@gr2m/fetch-mock';
import { fail } from 'assert';

describe('payment-request handler', () => {
  let packageMgr: IPackageManager;
  let paymentHandler: IPaymentHandler;
  let userDID, issuerDID: DID;
  let agentMessageResponse: BasicMessage;
  const packageManager: IPackageManager = new PackageManager();
  packageManager.registerPackers([new PlainPacker()]);

  const payContractAbi = [
    {
      inputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string'
        }
      ],
      name: 'Payments',
      outputs: [
        {
          internalType: 'string',
          name: 'issuerIdHash',
          type: 'string'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'string',
          name: 'sessionIdHash',
          type: 'string'
        },
        {
          internalType: 'string',
          name: 'issuerIdHash',
          type: 'string'
        }
      ],
      name: 'pay',
      outputs: [],
      stateMutability: 'payable',
      type: 'function'
    }
  ];

  const paymentIntegrationHandlerFunc =
    (sessionId: string, did: string) =>
    async (data: PaymentRequestDataInfo): Promise<string> => {
      const rpcProvider = new JsonRpcProvider(RPC_URL);
      const ethSigner = new ethers.Wallet(WALLET_KEY, rpcProvider);
      const payContract = new Contract(data.address, payContractAbi, ethSigner);
      if (data.currency !== SupportedCurrencies.ETH) {
        throw new Error('integration can only pay in eth currency');
      }
      const options = { value: ethers.parseUnits(data.amount, 'ether') };
      const txData = await payContract.pay(sessionId, did, options);
      return txData.hash;
    };

  const paymentValidationIntegrationHandlerFunc = async (
    txId: string,
    data: PaymentRequestDataInfo
  ): Promise<void> => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const tx = await rpcProvider.getTransaction(txId);
    if (tx?.value !== ethers.parseUnits(data.amount, 'ether')) {
      throw new Error('invalid value');
    }
  };
  const agent = 'https://agent-url.com';
  const paymentReqInfo: PaymentRequestInfo = {
    credentials: [
      {
        type: 'AML',
        context: 'http://test.com'
      }
    ],
    type: PaymentRequestType.PaymentRequest,
    data: {
      type: PaymentRequestDataType.Iden3PaymentRequestCryptoV1,
      amount: '0.001',
      id: '12432',
      chainId: '80002',
      address: '0x2C2007d72f533FfD409F0D9f515983e95bF14992',
      currency: SupportedCurrencies.ETH
    },
    expiration: '2125558127',
    description: 'payment-request integration test'
  };

  const paymentHandlerFuncMock = async (): Promise<string> => {
    return Promise.resolve('0x312312334');
  };

  afterEach(() => {
    fetchMock.restore();
  });

  beforeEach(async () => {
    const kms = registerKeyProvidersInMemoryKMS();
    const dataStorage = getInMemoryDataStorage(MOCK_STATE_STORAGE);
    const circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, '../proofs/testdata')
    });
    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    const credWallet = new CredentialWallet(dataStorage, resolvers);
    const idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    const proofService = new ProofService(idWallet, credWallet, circuitStorage, MOCK_STATE_STORAGE);
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );
    paymentHandler = new PaymentHandler(packageMgr, {
      packerParams: {
        mediaType: MediaType.PlainMessage
      }
    });

    const userIdentity = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    userDID = userIdentity.did;

    const issuerIdentity = await createIdentity(idWallet, {
      seed: SEED_ISSUER
    });

    issuerDID = issuerIdentity.did;

    agentMessageResponse = createProposal(issuerDID, userDID, []);
    fetchMock.spy();
    fetchMock.post('https://agent-url.com', JSON.stringify(agentMessageResponse));
  });

  it('payment-request handler test', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [paymentReqInfo]);
    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const agentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentHandlerFuncMock
    });
    if (!agentMessageBytes) {
      fail('handlePaymentRequest is not expected null response');
    }
    const { unpackedMessage: agentMessage } = await packageManager.unpack(agentMessageBytes);

    expect((agentMessage as BasicMessage).type).to.be.eq(
      PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE
    );
  });

  it('payment-request handler test with empty agent response', async () => {
    fetchMock.post('https://agent-url.com', '', { overwriteRoutes: true });

    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [paymentReqInfo]);
    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const agentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentHandlerFuncMock
    });
    expect(agentMessageBytes).to.be.null;
  });

  it('payment handler', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [paymentReqInfo]);
    const payment = createPayment(userDID, issuerDID, [
      {
        id: paymentRequest.body.payments[0].data.id,
        type: PaymentType.Iden3PaymentCryptoV1,
        paymentData: {
          txId: '0x312312334'
        }
      }
    ]);

    await paymentHandler.handlePayment(payment, {
      paymentRequest,
      paymentValidationHandler: async () => {
        Promise.resolve();
      }
    });
  });

  it.skip('payment-request handler (integration test)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [paymentReqInfo]);
    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const agentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentIntegrationHandlerFunc('<session-id-hash>', '<issuer-did-hash>')
    });
    if (!agentMessageBytes) {
      fail('handlePaymentRequest is not expected null response');
    }
    const { unpackedMessage: agentMessage } = await packageManager.unpack(agentMessageBytes);

    expect((agentMessage as BasicMessage).type).to.be.eq(
      PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE
    );
  });

  it.skip('payment handler (integration test)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [paymentReqInfo]);
    const payment = createPayment(userDID, issuerDID, [
      {
        id: paymentRequest.body.payments[0].data.id,
        type: PaymentType.Iden3PaymentCryptoV1,
        paymentData: {
          txId: '0xe9bea8e7adfe1092a8a4ca2cd75f4d21cc54b9b7a31bd8374b558d11b58a6a1a'
        }
      }
    ]);

    await paymentHandler.handlePayment(payment, {
      paymentRequest,
      paymentValidationHandler: paymentValidationIntegrationHandlerFunc
    });
  });
});
