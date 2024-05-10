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
  byteEncoder
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
import { MediaType } from '../../src/iden3comm/constants';
import { DID } from '@iden3/js-iden3-core';
import {
  createPaymentRequest,
  IPaymentHandler,
  PaymentHandler
} from '../../src/iden3comm/handlers/payment';
import {
  PaymentMessage,
  PaymentRequestDataInfo,
  PaymentRequestInfo
} from '../../src/iden3comm/types/protocol/payment';
import { Contract, ethers, JsonRpcProvider } from 'ethers';

describe('payment-request handler', () => {
  let packageMgr: IPackageManager;
  let paymentHandler: IPaymentHandler;
  let userDID, issuerDID: DID;
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

  const paymentIntegrationHandlerFunc = async (
    data: PaymentRequestDataInfo,
    txParams: unknown[]
  ): Promise<string> => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const ethSigner = new ethers.Wallet(WALLET_KEY, rpcProvider);
    const payContract = new Contract(data.address, payContractAbi, ethSigner);
    const options = { value: data.amount };
    const txData = await payContract.pay(...txParams, options);
    return txData.hash;
  };

  const paymentCheckIntegrationHandlerFunc = async (
    txId: string,
    data: PaymentRequestDataInfo
  ): Promise<void> => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const tx = await rpcProvider.getTransaction(txId);
    if (tx?.value !== BigInt(data.amount)) {
      throw new Error('invalid value');
    }
  };

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
      amount: '1000000000000000',
      id: 12432,
      chainID: 80002,
      address: '0x2C2007d72f533FfD409F0D9f515983e95bF14992'
    },
    agent: 'https://issuer.com',
    expiration: 2125558127,
    description: 'payment-request integration test'
  };

  const paymentHandlerFuncMock = async (): Promise<string> => {
    return Promise.resolve('0x312312334');
  };

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
  });

  it('payment-request handler test', async () => {
    const paymentRequest = createPaymentRequest(userDID, issuerDID, [paymentReqInfo]);
    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const paymentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentHandlerFuncMock,
      txParams: ['<session-id-hash>', '<issuer-did-hash>']
    });
    const { unpackedMessage: paymentMessage } = await packageManager.unpack(paymentMessageBytes);

    expect((paymentMessage as PaymentMessage).body?.payments[0].id).to.be.eq(
      paymentReqInfo.data.id
    );

    expect((paymentMessage as PaymentMessage).body?.payments[0].paymentData.txID).to.be.not.empty;
  });

  it('payment handler', async () => {
    const paymentRequest = createPaymentRequest(userDID, issuerDID, [paymentReqInfo]);
    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const paymentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentHandlerFuncMock,
      txParams: ['<session-id-hash>', '<issuer-did-hash>']
    });
    const { unpackedMessage: paymentMessage } = await packageManager.unpack(paymentMessageBytes);

    paymentHandler.handlePayment(paymentMessage as PaymentMessage, {
      paymentRequest,
      checkPaymentHandler: async () => {
        Promise.resolve();
      }
    });
  });

  it.skip('payment-request handler (integration test)', async () => {
    const paymentRequest = createPaymentRequest(userDID, issuerDID, [paymentReqInfo]);
    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const paymentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentIntegrationHandlerFunc,
      txParams: ['<session-id-hash>', '<issuer-did-hash>']
    });
    const { unpackedMessage: paymentMessage } = await packageManager.unpack(paymentMessageBytes);

    expect((paymentMessage as PaymentMessage).body?.payments[0].id).to.be.eq(
      paymentReqInfo.data.id
    );

    expect((paymentMessage as PaymentMessage).body?.payments[0].paymentData.txID).to.be.not.empty;
  });

  it.skip('payment handler (integration test)', async () => {
    const paymentRequest = createPaymentRequest(userDID, issuerDID, [paymentReqInfo]);
    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const paymentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentIntegrationHandlerFunc,
      txParams: ['<session-id-hash>', '<issuer-did-hash>']
    });
    const { unpackedMessage: paymentMessage } = await packageManager.unpack(paymentMessageBytes);

    paymentHandler.handlePayment(paymentMessage as PaymentMessage, {
      paymentRequest,
      checkPaymentHandler: paymentCheckIntegrationHandlerFunc
    });
  });
});
