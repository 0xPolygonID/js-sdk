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
  PaymentRequestDataType,
  byteEncoder,
  PaymentType,
  BasicMessage,
  createProposal,
  SupportedCurrencies,
  SupportedPaymentProofType,
  PaymentFeatures,
  getPermitSignature
} from '../../src';

import {
  MOCK_STATE_STORAGE,
  getInMemoryDataStorage,
  getPackageMgr,
  registerKeyProvidersInMemoryKMS,
  createIdentity,
  SEED_USER,
  WALLET_KEY,
  RPC_URL
} from '../helpers';

import { expect } from 'chai';
import path from 'path';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { DID } from '@iden3/js-iden3-core';
import {
  convertPaymentAmount,
  createPayment,
  createPaymentRequest,
  IPaymentHandler,
  PaymentHandler
} from '../../src/iden3comm/handlers/payment';
import {
  Iden3PaymentRailsERC20RequestV1,
  Iden3PaymentRailsRequestV1,
  Iden3PaymentRequestCryptoV1,
  PaymentRequestInfo,
  PaymentRequestTypeUnion
} from '../../src/iden3comm/types/protocol/payment';
import { Contract, ethers, JsonRpcProvider } from 'ethers';
import { fail } from 'assert';
import { DIDResolutionResult } from 'did-resolver';
import nock from 'nock';

describe('payment-request handler', () => {
  afterEach(() => {
    nock.cleanAll();
  });

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
      inputs: [
        {
          components: [
            {
              internalType: 'address',
              name: 'tokenAddress',
              type: 'address'
            },
            {
              internalType: 'address',
              name: 'recipient',
              type: 'address'
            },
            {
              internalType: 'uint256',
              name: 'amount',
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
          internalType: 'struct MCPayment.Iden3PaymentRailsERC20RequestV1',
          name: 'paymentData',
          type: 'tuple'
        },
        {
          internalType: 'bytes',
          name: 'signature',
          type: 'bytes'
        }
      ],
      name: 'payERC20',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'bytes',
          name: 'permitSignature',
          type: 'bytes'
        },
        {
          components: [
            {
              internalType: 'address',
              name: 'tokenAddress',
              type: 'address'
            },
            {
              internalType: 'address',
              name: 'recipient',
              type: 'address'
            },
            {
              internalType: 'uint256',
              name: 'amount',
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
          internalType: 'struct MCPayment.Iden3PaymentRailsERC20RequestV1',
          name: 'paymentData',
          type: 'tuple'
        },
        {
          internalType: 'bytes',
          name: 'signature',
          type: 'bytes'
        }
      ],
      name: 'payERC20Permit',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: 'nonce',
          type: 'uint256'
        }
      ],
      name: 'isPaymentDone',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool'
        }
      ],
      stateMutability: 'view',
      type: 'function'
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
              name: 'amount',
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

  const erc20Abi = [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256'
        }
      ],
      name: 'approve',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool'
        }
      ],
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ];

  const paymentIntegrationHandlerFunc =
    (sessionId: string, did: string) =>
    async (
      data:
        | Iden3PaymentRequestCryptoV1
        | Iden3PaymentRailsRequestV1
        | Iden3PaymentRailsERC20RequestV1
    ): Promise<string> => {
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
        const convertedAmount = await convertPaymentAmount(
          data.amount,
          data.currency as SupportedCurrencies
        );
        const paymentData = {
          recipient: data.recipient,
          amount: convertedAmount,
          expirationDate: data.expirationDate,
          nonce: data.nonce,
          metadata: data.metadata
        };

        const options = { value: convertedAmount };
        const txData = await payContract.pay(paymentData, data.proof[0].proofValue, options);
        return txData.hash;
      } else if (data.type == PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1) {
        const payContract = new Contract(
          data.proof[0].eip712.domain.verifyingContract,
          mcPayContractAbi,
          ethSigner
        );
        const convertedAmount = await convertPaymentAmount(
          data.amount,
          data.currency as SupportedCurrencies
        );
        const paymentData = {
          tokenAddress: data.tokenAddress,
          recipient: data.recipient,
          amount: convertedAmount,
          expirationDate: data.expirationDate,
          nonce: data.nonce,
          metadata: data.metadata
        };

        if (data.features?.includes(PaymentFeatures.EIP_2612)) {
          const permitSignature = await getPermitSignature(
            ethSigner,
            data.tokenAddress,
            await payContract.getAddress(),
            convertedAmount,
            +data.expirationDate
          );
          const txData = await payContract.payERC20Permit(
            permitSignature,
            paymentData,
            data.proof[0].proofValue
          );
          return txData.hash;
        }

        const txData = await payContract.payERC20(paymentData, data.proof[0].proofValue);
        return txData.hash;
      } else {
        throw new Error('invalid payment request data type');
      }
    };

  const paymentValidationIntegrationHandlerFunc = async (
    txId: string,
    data: PaymentRequestTypeUnion
  ): Promise<void> => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const tx = await rpcProvider.getTransaction(txId);
    if (data.type === PaymentRequestDataType.Iden3PaymentRequestCryptoV1) {
      if (tx?.value !== ethers.parseUnits(data.amount, 'ether')) {
        throw new Error('invalid value');
      }
    } else if (data.type === PaymentRequestDataType.Iden3PaymentRailsRequestV1) {
      if (tx?.value !== BigInt(data.amount)) {
        throw new Error('invalid value');
      }
      const payContract = new Contract(
        data.proof[0].eip712.domain.verifyingContract,
        mcPayContractAbi,
        rpcProvider
      );
      const isSuccess = await payContract.isPaymentDone(data.recipient, data.nonce);
      if (!isSuccess) {
        throw new Error('payment failed');
      }
    } else if (data.type === PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1) {
      const payContract = new Contract(
        data.proof[0].eip712.domain.verifyingContract,
        mcPayContractAbi,
        rpcProvider
      );
      const isSuccess = await payContract.isPaymentDone(data.recipient, data.nonce);
      if (!isSuccess) {
        throw new Error('payment failed');
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
    data: {
      type: PaymentRequestDataType.Iden3PaymentRequestCryptoV1,
      amount: '0.001',
      id: '12432',
      chainId: '80002',
      address: '0x2C2007d72f533FfD409F0D9f515983e95bF14992',
      currency: SupportedCurrencies.ETH,
      expiration: '2125558127'
    },
    description: 'Iden3PaymentRequestCryptoV1 payment-request integration test'
  };

  const paymentReqPaymentRailsV1Info: PaymentRequestInfo = {
    credentials: [
      {
        type: 'AML',
        context: 'http://test.com'
      }
    ],
    data: [
      {
        type: PaymentRequestDataType.Iden3PaymentRailsRequestV1,
        '@context': [
          'https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsRequestV1',
          'https://w3id.org/security/suites/eip712sig-2021/v1'
        ],
        recipient: '0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
        amount: '0.00003',
        currency: SupportedCurrencies.ETH_GWEI,
        expirationDate: '2362135500',
        nonce: '411390',
        metadata: '0x',
        proof: [
          {
            type: SupportedPaymentProofType.EthereumEip712Signature2021,
            proofPurpose: 'assertionMethod',
            proofValue:
              '0xb93fb0ddd4d89c7ae7fcdc7a675f7a949766bc385804adc63f7f5340de68625b21dd046e9d8698d78b3c67ca84f640de1b8eae865092f633c0e6e198d0d5cc971b',
            verificationMethod: 'did:pkh:eip155:80002:0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
            created: new Date().toISOString(),
            eip712: {
              types: 'https://schema.iden3.io/core/json/Iden3PaymentRailsRequestV1.json',
              primaryType: 'Iden3PaymentRailsRequestV1',
              domain: {
                name: 'MCPayment',
                version: '1.0.0',
                chainId: '80002',
                verifyingContract: '0xF8E49b922D5Fb00d3EdD12bd14064f275726D339'
              }
            }
          }
        ]
      }
    ],
    description: 'Iden3PaymentRailsRequestV1 payment-request integration test'
  };

  const paymentReqPaymentRailsERC20V1Info: PaymentRequestInfo = {
    credentials: [
      {
        type: 'AML',
        context: 'http://test.com'
      }
    ],
    data: [
      {
        type: PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1,
        '@context': [
          'https://schema.iden3.io/core/jsonld/payment.jsonld#Iden3PaymentRailsERC20RequestV1',
          'https://w3id.org/security/suites/eip712sig-2021/v1'
        ],
        tokenAddress: '0x2FE40749812FAC39a0F380649eF59E01bccf3a1A',
        recipient: '0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
        amount: '0.00003',
        currency: 'USDT',
        expirationDate: '2362135500',
        nonce: '411390',
        metadata: '0x',
        proof: [
          {
            type: SupportedPaymentProofType.EthereumEip712Signature2021,
            proofPurpose: 'assertionMethod',
            proofValue:
              '0xfcc7eef264932f2a1a388a1479299f1614f11ffcb7d885f5d369b5ad202b03023f1a2fa85c70b4e08d8a0e5c97464f31c593bcc3bf9a92ada79ea8a653f199681c',
            verificationMethod: 'did:pkh:eip155:80002:0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
            created: new Date().toISOString(),
            eip712: {
              types: 'https://schema.iden3.io/core/json/Iden3PaymentRailsERC20RequestV1.json',
              primaryType: 'Iden3PaymentRailsERC20RequestV1',
              domain: {
                name: 'MCPayment',
                version: '1.0.0',
                chainId: '80002',
                verifyingContract: '0xF8E49b922D5Fb00d3EdD12bd14064f275726D339'
              }
            }
          }
        ]
      }
    ],
    description: 'Iden3PaymentRailsRequestV1 payment-request integration test'
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
    const didExampleRecovery = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        {
          EcdsaSecp256k1RecoveryMethod2020:
            'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020#EcdsaSecp256k1RecoveryMethod2020',
          blockchainAccountId: 'https://w3id.org/security#blockchainAccountId'
        }
      ],
      id: 'did:pkh:eip155:80002:0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
      verificationMethod: [
        {
          id: 'did:pkh:eip155:80002:0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a#blockchainAccountId',
          type: 'EcdsaSecp256k1RecoveryMethod2020',
          controller: 'did:pkh:eip155:80002:0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
          blockchainAccountId: 'eip155:80002:0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a'
        }
      ],
      authentication: [
        'did:pkh:eip155:80002:0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a#blockchainAccountId'
      ],
      assertionMethod: [
        'did:pkh:eip155:80002:0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a#blockchainAccountId'
      ]
    };
    const resolveDIDDocument = {
      resolve: () => Promise.resolve({ didDocument: didExampleRecovery } as DIDResolutionResult)
    };
    packageMgr = await getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService)
    );
    paymentHandler = new PaymentHandler(packageMgr, {
      packerParams: {
        mediaType: MediaType.PlainMessage
      },
      documentResolver: resolveDIDDocument,
      multiChainPaymentConfig: [
        {
          chainId: '80002',
          paymentContract: '0xF8E49b922D5Fb00d3EdD12bd14064f275726D339',
          recipient: '0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
          erc20TokenAddressArr: [
            { symbol: 'USDT', address: '0x2FE40749812FAC39a0F380649eF59E01bccf3a1A' }
          ]
        },
        {
          chainId: '1101',
          paymentContract: '0x380dd90852d3Fe75B4f08D0c47416D6c4E0dC774',
          recipient: '0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
          erc20TokenAddressArr: [
            {
              symbol: SupportedCurrencies.USDT,
              address: '0x1e4a5963abfd975d8c9021ce480b42188849d41d'
            }
          ]
        }
      ]
    });

    const userIdentity = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    userDID = userIdentity.did;
    issuerDID = DID.parse('did:iden3:polygon:amoy:x6x5sor7zpyZX9yNpm8h1rPBDSN9idaEhDj1Qm8Q9');

    agentMessageResponse = createProposal(issuerDID, userDID, []);

    nock(agent).post('/').reply(200, JSON.stringify(agentMessageResponse));
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
      paymentHandler: paymentHandlerFuncMock,
      nonce: '12432'
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
      nonce: '411390'
    });
    if (!agentMessageBytes) {
      fail('handlePaymentRequest is not expected null response');
    }
    const { unpackedMessage: agentMessage } = await packageManager.unpack(agentMessageBytes);

    expect((agentMessage as BasicMessage).type).to.be.eq(
      PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE
    );
  });

  it('payment-request handler test (Iden3PaymentRailsERC20RequestV1)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqPaymentRailsERC20V1Info
    ]);
    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const agentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentHandlerFuncMock,
      nonce: '411390',
      erc20TokenApproveHandler: () => Promise.resolve('0x312312334')
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
    const newAgent = `${agent}.ua`;
    nock(newAgent).post('/').reply(200, '');

    const paymentRequest = createPaymentRequest(issuerDID, userDID, newAgent, [
      paymentReqCryptoV1Info
    ]);
    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const agentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentHandlerFuncMock,
      nonce: '12432'
    });
    expect(agentMessageBytes).to.be.null;
  });

  it('payment handler (Iden3PaymentRequestCryptoV1)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqCryptoV1Info
    ]);
    const payment = createPayment(userDID, issuerDID, [
      {
        id: (paymentRequest.body.payments[0].data as Iden3PaymentRequestCryptoV1).id,
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

  it('payment handler (Iden3PaymentRailsERC20V1)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqPaymentRailsERC20V1Info
    ]);
    const payment = createPayment(userDID, issuerDID, [
      {
        nonce: (paymentRequest.body.payments[0].data[0] as Iden3PaymentRailsRequestV1).nonce,
        type: PaymentType.Iden3PaymentRailsERC20V1,
        '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld',
        paymentData: {
          txId: '0x312312334',
          chainId: '80002',
          tokenAddress: '0x5fb4a5c46d7f2067AA235fbEA350A0261eAF71E3'
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

  it('payment handler (paymentReqPaymentRailsERC20V1Info)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqPaymentRailsERC20V1Info
    ]);
    const payment = createPayment(userDID, issuerDID, [
      {
        nonce: (paymentRequest.body.payments[0].data[0] as Iden3PaymentRailsRequestV1).nonce,
        type: PaymentType.Iden3PaymentRailsV1,
        '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld',
        paymentData: {
          txId: '0x312312334',
          chainId: '80002'
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
      paymentHandler: paymentIntegrationHandlerFunc('<session-id-hash>', '<issuer-did-hash>'),
      nonce: '12432'
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
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const ethSigner = new ethers.Wallet(WALLET_KEY, rpcProvider);
    const paymentRequest = await paymentHandler.createPaymentRailsV1(
      issuerDID,
      userDID,
      agent,
      ethSigner,
      [
        {
          credentials: [
            {
              type: 'AML',
              context: 'http://test.com'
            }
          ],
          description: 'Iden3PaymentRailsRequestV1 payment-request integration test',
          chains: [
            {
              nonce: 1000412n,
              amount: '0.001',
              currency: SupportedCurrencies.ETH_GWEI,
              chainId: '80002',
              type: PaymentRequestDataType.Iden3PaymentRailsRequestV1
            },
            {
              nonce: 10001123n,
              amount: '2233',
              currency: SupportedCurrencies.ETH_WEI,
              chainId: '1101',
              type: PaymentRequestDataType.Iden3PaymentRailsRequestV1
            }
          ]
        }
      ]
    );

    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const agentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentIntegrationHandlerFunc('<session-id-hash>', '<issuer-did-hash>'),
      nonce: '1000412'
    });
    if (!agentMessageBytes) {
      fail('handlePaymentRequest is not expected null response');
    }
    const { unpackedMessage: agentMessage } = await packageManager.unpack(agentMessageBytes);

    expect((agentMessage as BasicMessage).type).to.be.eq(
      PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE
    );
  });

  it.skip('payment-request handler (Iden3PaymentRailsERC20RequestV1, integration test)', async () => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const ethSigner = new ethers.Wallet(WALLET_KEY, rpcProvider);
    const paymentRequest = await paymentHandler.createPaymentRailsV1(
      issuerDID,
      userDID,
      agent,
      ethSigner,
      [
        {
          credentials: [
            {
              type: 'AML',
              context: 'http://test.com'
            }
          ],
          description: 'Iden3PaymentRailsERC20RequestV1 payment-request integration test',
          chains: [
            {
              nonce: 220011n,
              amount: '0.000001',
              currency: 'USDT',
              chainId: '80002',
              type: PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1
            },
            {
              nonce: 220011124n,
              amount: '0.000001',
              currency: SupportedCurrencies.USDT,
              chainId: '1101',
              type: PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1
            }
          ]
        }
      ]
    );

    console.log(JSON.stringify(paymentRequest));

    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const agentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentIntegrationHandlerFunc('<session-id-hash>', '<issuer-did-hash>'),
      nonce: '220011',
      erc20TokenApproveHandler: async (data: Iden3PaymentRailsERC20RequestV1) => {
        const token = new Contract(data.tokenAddress, erc20Abi, ethSigner);
        const convertedAmount = await convertPaymentAmount(
          data.amount,
          data.currency as SupportedCurrencies
        );
        const txData = await token.approve(
          data.proof[0].eip712.domain.verifyingContract,
          convertedAmount
        );
        await txData.wait(1);
        return txData.hash;
      }
    });
    if (!agentMessageBytes) {
      fail('handlePaymentRequest is not expected null response');
    }
    const { unpackedMessage: agentMessage } = await packageManager.unpack(agentMessageBytes);

    expect((agentMessage as BasicMessage).type).to.be.eq(
      PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE
    );
  });

  it.skip('payment-request handler (Iden3PaymentRailsERC20RequestV1 Permit, integration test)', async () => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const ethSigner = new ethers.Wallet(WALLET_KEY, rpcProvider);
    const paymentRequest = await paymentHandler.createPaymentRailsV1(
      issuerDID,
      userDID,
      agent,
      ethSigner,
      [
        {
          credentials: [
            {
              type: 'AML',
              context: 'http://test.com'
            }
          ],
          description: 'Iden3PaymentRailsERC20RequestV1 payment-request integration test',
          chains: [
            {
              features: [PaymentFeatures.EIP_2612],
              nonce: 330004n,
              amount: '0.000002',
              currency: 'USDT',
              chainId: '80002',
              type: PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1
            },
            {
              nonce: 330001122n,
              amount: '0.000002',
              currency: SupportedCurrencies.USDT,
              chainId: '1101',
              type: PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1
            }
          ]
        }
      ]
    );

    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const agentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentIntegrationHandlerFunc('<session-id-hash>', '<issuer-did-hash>'),
      nonce: '330004'
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
    const payment = createPayment(userDID, issuerDID, [
      {
        id: (paymentRequest.body.payments[0].data as Iden3PaymentRequestCryptoV1).id,
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

  it.skip('payment handler (Iden3PaymentRailsRequestV1, integration test)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqPaymentRailsV1Info
    ]);

    const data = paymentRequest.body.payments[0].data[0] as Iden3PaymentRailsRequestV1;
    data.nonce = '10001';

    const payment = createPayment(userDID, issuerDID, [
      {
        nonce: data.nonce,
        type: PaymentType.Iden3PaymentRailsV1,
        '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld',
        paymentData: {
          txId: '0x59b54f1a3a53d48d891c750db7c300acf8e0dc6bb7daccbf42ce8f62d2957bae',
          chainId: '80002'
        }
      }
    ]);
    await paymentHandler.handlePayment(payment, {
      paymentRequest,
      paymentValidationHandler: paymentValidationIntegrationHandlerFunc
    });
  });

  it.skip('payment handler (Iden3PaymentRailsERC20V1, integration test)', async () => {
    const paymentRequest = createPaymentRequest(issuerDID, userDID, agent, [
      paymentReqPaymentRailsERC20V1Info
    ]);

    const data = paymentRequest.body.payments[0].data[0] as Iden3PaymentRailsRequestV1;
    data.nonce = '330001';

    const payment = createPayment(userDID, issuerDID, [
      {
        nonce: data.nonce,
        type: PaymentType.Iden3PaymentRailsERC20V1,
        '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld',
        paymentData: {
          txId: '0xfd270399a07a7dfc9e184699e8ff8c8b2c59327f27841401b28dc910307d4cb0',
          chainId: '80002',
          tokenAddress: '0x2FE40749812FAC39a0F380649eF59E01bccf3a1A'
        }
      }
    ]);
    await paymentHandler.handlePayment(payment, {
      paymentRequest,
      paymentValidationHandler: paymentValidationIntegrationHandlerFunc
    });
  });

  it('convertPaymentAmount tests', async () => {
    const convertedWei = await convertPaymentAmount('100', SupportedCurrencies.ETH_WEI);
    expect(convertedWei).to.be.eq(BigInt(100));

    const convertedGwei = await convertPaymentAmount('100', SupportedCurrencies.ETH_GWEI);
    expect(convertedGwei).to.be.eq(BigInt(100000000000));

    const convertedEth = await convertPaymentAmount('100', SupportedCurrencies.ETH);
    expect(convertedEth).to.be.eq(BigInt(100000000000000000000));

    const convertedMatic = await convertPaymentAmount('100', SupportedCurrencies.MATIC);
    expect(convertedMatic).to.be.eq(BigInt(100000000000000000000));

    const convertedPol = await convertPaymentAmount('100', SupportedCurrencies.POL);
    expect(convertedPol).to.be.eq(BigInt(100000000000000000000));

    const convertedUsdt = await convertPaymentAmount('100', SupportedCurrencies.USDT);
    expect(convertedUsdt).to.be.eq(BigInt(100000000));

    const convertedUsdc = await convertPaymentAmount('100', SupportedCurrencies.USDC);
    expect(convertedUsdc).to.be.eq(BigInt(100000000));
  });
});
