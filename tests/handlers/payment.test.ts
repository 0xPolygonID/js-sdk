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
  SupportedCurrencies,
  SupportedPaymentProofType
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
  Iden3PaymentRailsRequestV1,
  Iden3PaymentRequestCryptoV1,
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

  const mcPayContractAbi = [
    {
      inputs: [],
      name: 'InvalidInitialization',
      type: 'error'
    },
    {
      inputs: [
        {
          internalType: 'string',
          name: 'message',
          type: 'string'
        }
      ],
      name: 'InvalidSignature',
      type: 'error'
    },
    {
      inputs: [],
      name: 'NotInitializing',
      type: 'error'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address'
        }
      ],
      name: 'OwnableInvalidOwner',
      type: 'error'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address'
        }
      ],
      name: 'OwnableUnauthorizedAccount',
      type: 'error'
    },
    {
      inputs: [
        {
          internalType: 'string',
          name: 'message',
          type: 'string'
        }
      ],
      name: 'PaymentError',
      type: 'error'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'recipient',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'nonce',
          type: 'uint256'
        }
      ],
      name: 'Payment',
      type: 'event'
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'address',
              name: 'recipient',
              type: 'address'
            },
            {
              internalType: 'uint256',
              name: 'value',
              type: 'uint256'
            },
            {
              internalType: 'uint256',
              name: 'expirationDate',
              type: 'uint256'
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256'
            },
            {
              internalType: 'bytes',
              name: 'metadata',
              type: 'bytes'
            }
          ],
          internalType: 'struct MCPayment.Iden3PaymentRailsRequestV1',
          name: 'paymentData',
          type: 'tuple'
        },
        {
          internalType: 'bytes',
          name: 'signature',
          type: 'bytes'
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
    async (data: Iden3PaymentRequestCryptoV1 | Iden3PaymentRailsRequestV1): Promise<string> => {
      const rpcProvider = new JsonRpcProvider(RPC_URL);
      const ethSigner = new ethers.Wallet(WALLET_KEY, rpcProvider);
      if (data.type === PaymentRequestDataType.Iden3PaymentRequestCryptoV1) {
        const payContract = new Contract(data.address, payContractAbi, ethSigner);
        if (data.currency !== SupportedCurrencies.ETH) {
          throw new Error('integration can only pay in eth currency');
        }
        const options = { value: ethers.parseUnits(data.amount, 'ether') };
        const txData = await payContract.pay(sessionId, did, options);
        return txData.hash;
      } else if (data.type === PaymentRequestDataType.Iden3PaymentRailsRequestV1) {
        const payContract = new Contract(
          data.proof[0].eip712.domain.verifyingContract,
          mcPayContractAbi,
          ethSigner
        );
        const paymentData = {
          recipient: data.recipient,
          value: data.value,
          expirationDate: new Date(data.expirationDate).getTime(),
          nonce: data.nonce,
          metadata: data.metadata
        };

        const options = { value: data.value };
        const txData = await payContract.pay(paymentData, data.proof[0].proofValue, options);
        return txData.hash;
      } else {
        throw new Error('invalid payment request data type');
      }
    };

  const paymentValidationIntegrationHandlerFunc = async (
    txId: string,
    data: Iden3PaymentRequestCryptoV1 | Iden3PaymentRailsRequestV1
  ): Promise<void> => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const tx = await rpcProvider.getTransaction(txId);
    if (data.type === PaymentRequestDataType.Iden3PaymentRequestCryptoV1) {
      if (tx?.value !== ethers.parseUnits(data.amount, 'ether')) {
        throw new Error('invalid value');
      }
    } else if (data.type === PaymentRequestDataType.Iden3PaymentRailsRequestV1) {
      if (tx?.value !== BigInt(data.value)) {
        throw new Error('invalid value');
      }
    } else {
      throw new Error('invalid payment request data type');
    }
  };

  const agent = 'https://agent-url.com';
  const paymentReqCryptoV1Info: PaymentRequestInfo = {
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
    description: 'Iden3PaymentRequestCryptoV1 payment-request integration test'
  };

  const paymentReqPaymentRailsV1Info: PaymentRequestInfo = {
    credentials: [
      {
        type: 'AML',
        context: 'http://test.com'
      }
    ],
    type: PaymentRequestType.PaymentRequest,
    data: [
      {
        type: PaymentRequestDataType.Iden3PaymentRailsRequestV1,
        recipient: '0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
        value: '100',
        expirationDate: new Date(new Date().setHours(new Date().getHours() + 1)).toISOString(),
        nonce: '25',
        metadata: '0x',
        proof: [
          {
            type: SupportedPaymentProofType.EthereumEip712Signature2021,
            proofPurpose: 'assertionMethod',
            proofValue:
              '0xa05292e9874240c5c2bbdf5a8fefff870c9fc801bde823189fc013d8ce39c7e5431bf0585f01c7e191ea7bbb7110a22e018d7f3ea0ed81a5f6a3b7b828f70f2d1c',
            verificationMethod:
              'did:pkh:eip155:0:0x3e1cFE1b83E7C1CdB0c9558236c1f6C7B203C34e#blockchainAccountId',
            created: new Date().toISOString(),
            eip712: {
              types: 'https://example.com/schemas/v1',
              primaryType: 'Iden3PaymentRailsRequestV1',
              domain: {
                name: 'MCPayment',
                version: '1.0.0',
                chainId: '80002',
                verifyingContract: '0x8e08d46D77a06CeF290268a5553669f165751c70',
                salt: ''
              }
            }
          }
        ]
      }
    ],
    expiration: '2125558127',
    description: 'Iden3PaymentRailsRequestV1 payment-request integration test'
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

  it('payment-request handler test (Iden3PaymentRequestCryptoV1)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqCryptoV1Info
    ]);
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

  it('payment-request handler test (Iden3PaymentRailsRequestV1)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqPaymentRailsV1Info
    ]);
    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const agentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentHandlerFuncMock,
      multichainSelectedChainId: '80002'
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

    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqCryptoV1Info
    ]);
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

  it('payment handler (Iden3PaymentRequestCryptoV1)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqCryptoV1Info
    ]);
    const payment = createPayment(userDID, issuerDID, {
      payments: [
        {
          id: (paymentRequest.body.payments[0].data as Iden3PaymentRequestCryptoV1).id,
          type: PaymentType.Iden3PaymentCryptoV1,
          paymentData: {
            txId: '0x312312334'
          }
        }
      ]
    });

    await paymentHandler.handlePayment(payment, {
      paymentRequest,
      paymentValidationHandler: async () => {
        Promise.resolve();
      }
    });
  });

  it('payment handler (Iden3PaymentRailsRequestV1)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqPaymentRailsV1Info
    ]);
    const payment = createPayment(userDID, issuerDID, {
      payments: [
        {
          nonce: (paymentRequest.body.payments[0].data[0] as Iden3PaymentRailsRequestV1).nonce,
          type: PaymentType.Iden3PaymentRailsResponseV1,
          paymentData: {
            txId: '0x312312334',
            chainId: '80002'
          }
        }
      ]
    });

    await paymentHandler.handlePayment(payment, {
      paymentRequest,
      paymentValidationHandler: async () => {
        Promise.resolve();
      }
    });
  });

  it.skip('payment-request handler (Iden3PaymentRequestCryptoV1, integration test)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqCryptoV1Info
    ]);
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

  it.skip('payment-request handler (Iden3PaymentRailsRequestV1, integration test)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqPaymentRailsV1Info
    ]);

    // issuer prepares and signs the payment request
    const nonce = BigInt(26); // change nonce for each test
    const data = paymentRequest.body.payments[0].data[0] as Iden3PaymentRailsRequestV1;
    data.nonce = nonce.toString();

    const domainData = data.proof[0].eip712.domain;
    delete domainData.salt; // todo: should we support salt?
    const types = {
      // todo: fetch this from the `type` URL in request
      Iden3PaymentRailsRequestV1: [
        { name: 'recipient', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'expirationDate', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'metadata', type: 'bytes' }
      ]
    };
    const paymentData = {
      recipient: data.recipient,
      value: data.value,
      expirationDate: new Date(data.expirationDate).getTime(),
      nonce: nonce,
      metadata: '0x'
    };

    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const ethSigner = new ethers.Wallet(WALLET_KEY, rpcProvider);
    const signature = await ethSigner.signTypedData(domainData, types, paymentData);
    data.proof[0].proofValue = signature;

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

  it.skip('payment handler (Iden3PaymentRequestCryptoV1, integration test)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqCryptoV1Info
    ]);
    const payment = createPayment(userDID, issuerDID, {
      payments: [
        {
          id: (paymentRequest.body.payments[0].data as Iden3PaymentRequestCryptoV1).id,
          type: PaymentType.Iden3PaymentCryptoV1,
          paymentData: {
            txId: '0xe9bea8e7adfe1092a8a4ca2cd75f4d21cc54b9b7a31bd8374b558d11b58a6a1a'
          }
        }
      ]
    });
    await paymentHandler.handlePayment(payment, {
      paymentRequest,
      paymentValidationHandler: paymentValidationIntegrationHandlerFunc
    });
  });

  it.skip('payment handler (Iden3PaymentRailsRequestV1, integration test)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqPaymentRailsV1Info
    ]);

    const data = paymentRequest.body.payments[0].data[0] as Iden3PaymentRailsRequestV1;
    data.nonce = '26';

    const payment = createPayment(userDID, issuerDID, {
      payments: [
        {
          nonce: '26',
          type: PaymentType.Iden3PaymentRailsResponseV1,
          paymentData: {
            txId: '0xbbfab123780717247c15a96be859bf774d582769c63044d130c77b06d850e393',
            chainId: '80002'
          }
        }
      ]
    });
    await paymentHandler.handlePayment(payment, {
      paymentRequest,
      paymentValidationHandler: paymentValidationIntegrationHandlerFunc
    });
  });
});
