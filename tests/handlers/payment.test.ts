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
  getPermitSignature,
  SolanaPaymentInstruction,
  SolanaPaymentInstructionSchema
} from '../../src';

import {
  MOCK_STATE_STORAGE,
  getInMemoryDataStorage,
  getPackageMgr,
  registerKeyProvidersInMemoryKMS,
  createIdentity,
  SEED_USER,
  WALLET_KEY,
  RPC_URL,
  SOLANA_BASE_58_PK
} from '../helpers';

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import path from 'path';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { DID, getUnixTimestamp } from '@iden3/js-iden3-core';
import {
  createPayment,
  createPaymentRequest,
  IPaymentHandler,
  PaymentHandler
} from '../../src/iden3comm/handlers/payment';
import {
  Iden3PaymentRailsERC20RequestV1,
  Iden3PaymentRailsRequestV1,
  Iden3PaymentRailsSolanaRequestV1,
  Iden3PaymentRailsSolanaSPLRequestV1,
  Iden3PaymentRequestCryptoV1,
  PaymentRequestInfo,
  PaymentRequestTypeUnion
} from '../../src/iden3comm/types/protocol/payment';
import { Contract, ethers, JsonRpcProvider } from 'ethers';
import { fail } from 'assert';
import { DIDResolutionResult } from 'did-resolver';
import nock from 'nock';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
  sendAndConfirmTransaction,
  Ed25519Program
} from '@solana/web3.js';
import bs58 from 'bs58';
import { deserialize, serialize } from 'borsh';
import { sha256 } from '@iden3/js-crypto';
import BN from 'bn.js';
import {
  TOKEN_PROGRAM_ID,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer
} from '@solana/spl-token';

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

  class InitializeInstruction {
    constructor(fields: { owner_percentage: number; fee_collector: Uint8Array }) {
      this.owner_percentage = fields.owner_percentage;
      this.fee_collector = fields.fee_collector;
    }
    owner_percentage: number;
    fee_collector: Uint8Array;
  }

  class PaymentRecord {
    is_paid: boolean;

    constructor(fields: { is_paid: boolean }) {
      this.is_paid = fields.is_paid;
    }
  }

  const PaymentRecordSchema = new Map([
    [
      PaymentRecord,
      {
        kind: 'struct',
        fields: [['is_paid', 'u8']]
      }
    ]
  ]);

  const paymentIntegrationHandlerFunc =
    (sessionId: string, did: string) =>
    async (
      data:
        | Iden3PaymentRequestCryptoV1
        | Iden3PaymentRailsRequestV1
        | Iden3PaymentRailsERC20RequestV1
        | Iden3PaymentRailsSolanaRequestV1
        | Iden3PaymentRailsSolanaSPLRequestV1
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

        const paymentData = {
          recipient: data.recipient,
          amount: data.amount,
          expirationDate: getUnixTimestamp(new Date(data.expirationDate)),
          nonce: data.nonce,
          metadata: data.metadata
        };

        const options = { value: data.amount };
        const txData = await payContract.pay(paymentData, data.proof[0].proofValue, options);
        return txData.hash;
      } else if (data.type == PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1) {
        const payContract = new Contract(
          data.proof[0].eip712.domain.verifyingContract,
          mcPayContractAbi,
          ethSigner
        );
        const paymentData = {
          tokenAddress: data.tokenAddress,
          recipient: data.recipient,
          amount: data.amount,
          expirationDate: getUnixTimestamp(new Date(data.expirationDate)),
          nonce: data.nonce,
          metadata: data.metadata
        };

        if (data.features?.includes(PaymentFeatures.EIP_2612)) {
          const permitSignature = await getPermitSignature(
            ethSigner,
            data.tokenAddress,
            await payContract.getAddress(),
            BigInt(data.amount),
            getUnixTimestamp(new Date(data.expirationDate))
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
      } else if (
        data.type == PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1 ||
        data.type == PaymentRequestDataType.Iden3PaymentRailsSolanaSPLRequestV1
      ) {
        const connection = new Connection(clusterApiUrl('devnet'));
        const payer = Keypair.fromSecretKey(bs58.decode(SOLANA_BASE_58_PK));
        const signer = new PublicKey(data.proof[0].pubKey);
        const payerPublicKey = payer.publicKey;
        console.log('Payer Public Key:', payerPublicKey.toBase58());
        const recipient = new PublicKey(data.recipient);
        const programId = new PublicKey(data.proof[0].domain.verifyingContract);

        const amount = BigInt(data.amount); // in lamports
        const expiration_date = getUnixTimestamp(new Date(data.expirationDate));
        const nonce = BigInt(data.nonce);
        const metadata = data.metadata;
        const signature = Uint8Array.from(Buffer.from(data.proof[0].proofValue, 'hex'));

        const instruction = new SolanaPaymentInstruction({
          recipient: recipient.toBytes(),
          amount,
          expiration_date: BigInt(expiration_date),
          nonce,
          metadata: byteEncoder.encode(metadata),
          signature
        });
        const serializedArgs = Buffer.from(serialize(SolanaPaymentInstructionSchema, instruction));
        let discriminator = sha256(Buffer.from('global:pay')).slice(0, 8);
        if (data.type === PaymentRequestDataType.Iden3PaymentRailsSolanaSPLRequestV1) {
          discriminator = sha256(Buffer.from('global:pay_spl')).slice(0, 8);
        }
        const instructionData = Buffer.concat([discriminator, serializedArgs]);
        const [configPda] = await PublicKey.findProgramAddressSync(
          [Buffer.from('config')],
          programId
        );
        const [paymentRecordPda] = await PublicKey.findProgramAddressSync(
          [Buffer.from('payment'), signer.toBuffer(), new BN(nonce).toArrayLike(Buffer, 'le', 8)],
          programId
        );

        const [recipientBalancePda] = await PublicKey.findProgramAddressSync(
          [Buffer.from('balance'), recipient.toBuffer()],
          programId
        );

        const [treasuryPda] = await PublicKey.findProgramAddressSync(
          [Buffer.from('treasury')],
          programId
        );
        const balance = await connection.getBalance(treasuryPda);
        const solBalance = balance / LAMPORTS_PER_SOL;
        console.log(`Treasury balance: ${solBalance} SOL on address ${treasuryPda.toBase58()}`);
        const [noncePda] = await PublicKey.findProgramAddressSync(
          [Buffer.from('nonce'), payer.publicKey.toBuffer()],
          programId
        );

        const keys = [
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: signer, isSigner: false, isWritable: true },
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: paymentRecordPda, isSigner: false, isWritable: true }
        ];
        if (data.type === PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1) {
          const payKeys = [
            { pubkey: recipientBalancePda, isSigner: false, isWritable: true },
            { pubkey: treasuryPda, isSigner: false, isWritable: true },
            { pubkey: noncePda, isSigner: false, isWritable: true },
            { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
          ];
          keys.push(...payKeys);
        }
        if (data.type === PaymentRequestDataType.Iden3PaymentRailsSolanaSPLRequestV1) {
          const tokenMint = new PublicKey(data.tokenAddress);

          const mintInfo = await getMint(connection, tokenMint);
          console.log('Mint decimals:', mintInfo.decimals);

          const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            tokenMint,
            payer.publicKey
          );
          console.log(`Sender Token Account: ${senderTokenAccount.address.toBase58()}`);
          // create if not exists
          const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            tokenMint,
            recipient
          );
          console.log(`Recipient Token Account: ${recipientTokenAccount.address.toBase58()}`);
          // create treasury token account if not exists
          const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            tokenMint,
            treasuryPda,
            true
          );
          console.log(`Treasury Token Account: ${treasuryTokenAccount.address.toBase58()}`);

          const splKeys = [
            { pubkey: senderTokenAccount.address, isSigner: false, isWritable: true },
            { pubkey: recipientTokenAccount.address, isSigner: false, isWritable: true },
            { pubkey: treasuryTokenAccount.address, isSigner: false, isWritable: true },
            { pubkey: tokenMint, isSigner: false, isWritable: false },
            { pubkey: treasuryPda, isSigner: false, isWritable: true },
            { pubkey: noncePda, isSigner: false, isWritable: true },
            { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
          ];
          keys.push(...splKeys);
        }

        const pubkey = new PublicKey(data.proof[0].pubKey);
        const signedMessage = Uint8Array.from(Buffer.from(data.proof[0].signedMessage, 'hex'));
        const edIx = Ed25519Program.createInstructionWithPublicKey({
          message: signedMessage,
          signature,
          publicKey: pubkey.toBytes()
        });

        const ix = new TransactionInstruction({
          programId,
          keys,
          data: instructionData
        });
        const { blockhash } = await connection.getLatestBlockhash('finalized');
        const tx = new Transaction().add(edIx, ix);
        tx.recentBlockhash = blockhash;
        tx.feePayer = payer.publicKey;
        tx.sign(payer);
        const rawTx = tx.serialize();
        const sig = await connection.sendRawTransaction(rawTx);
        console.log('Transaction sent:', sig);
        return sig;
      } else {
        throw new Error('invalid payment request data type');
      }
    };

  const paymentValidationIntegrationHandlerFunc = async (
    txId: string,
    data: PaymentRequestTypeUnion
  ): Promise<void> => {
    if (data.type === PaymentRequestDataType.Iden3PaymentRequestCryptoV1) {
      const rpcProvider = new JsonRpcProvider(RPC_URL);
      const tx = await rpcProvider.getTransaction(txId);
      if (tx?.value !== ethers.parseUnits(data.amount, 'ether')) {
        throw new Error('invalid value');
      }
    } else if (data.type === PaymentRequestDataType.Iden3PaymentRailsRequestV1) {
      const rpcProvider = new JsonRpcProvider(RPC_URL);
      const tx = await rpcProvider.getTransaction(txId);
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
      const rpcProvider = new JsonRpcProvider(RPC_URL);
      const payContract = new Contract(
        data.proof[0].eip712.domain.verifyingContract,
        mcPayContractAbi,
        rpcProvider
      );
      const isSuccess = await payContract.isPaymentDone(data.recipient, data.nonce);
      if (!isSuccess) {
        throw new Error('payment failed');
      }
    } else if (
      data.type === PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1 ||
      data.type === PaymentRequestDataType.Iden3PaymentRailsSolanaSPLRequestV1
    ) {
      const connection = new Connection('https://api.devnet.solana.com');
      const signer = Keypair.fromSecretKey(bs58.decode(SOLANA_BASE_58_PK));
      const [paymentRecordPda] = await PublicKey.findProgramAddressSync(
        [
          Buffer.from('payment'),
          signer.publicKey.toBuffer(),
          new BN(data.nonce).toArrayLike(Buffer, 'le', 8)
        ],
        new PublicKey(data.proof[0].domain.verifyingContract)
      );
      const accountInfo = await connection.getAccountInfo(paymentRecordPda);
      if (!accountInfo) {
        throw new Error('payment record not found');
      }
      // Skip the first 8 bytes (Anchor discriminator)
      const accountDataWithoutDiscriminator = accountInfo.data.slice(8);

      const paymentRecord = deserialize(
        PaymentRecordSchema,
        PaymentRecord,
        accountDataWithoutDiscriminator
      );
      if (!paymentRecord.is_paid) {
        throw new Error('payment not completed');
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
        amount: '2',
        expirationDate: '2124-12-10T17:25:18.907Z',
        nonce: '411393',
        metadata: '0x',
        proof: [
          {
            type: SupportedPaymentProofType.EthereumEip712Signature2021,
            proofPurpose: 'assertionMethod',
            proofValue:
              '0x31b57b1be0c22c21359252723a10b21c7c3e438705e1d46d2384feacdd8b429e3f1a3a230ac49fccdeef0aa1f7604020d4d4098c4078c4f24280c91c0dab45611b',
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
        tokenAddress: '0x71dcc8Dc5Eb138003d3571255458Bc5692a60eD4',
        recipient: '0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
        amount: '2',
        expirationDate: '2124-12-10T17:25:18.907Z',
        nonce: '411393',
        metadata: '0x',
        proof: [
          {
            type: SupportedPaymentProofType.EthereumEip712Signature2021,
            proofPurpose: 'assertionMethod',
            proofValue:
              '0x2b355fbeb6f303ebf3c5a88b335129799c67fa5db3debee8ee265b4d46fbeb7349a1b22e4c012d8a3c48581f8d77d8888337f5f0c9b7a38a0a7869749173937f1b',
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
          paymentRails: '0xF8E49b922D5Fb00d3EdD12bd14064f275726D339',
          recipient: '0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
          options: [
            {
              id: 'amoy-native',
              type: PaymentRequestDataType.Iden3PaymentRailsRequestV1
            },
            {
              id: 'amoy-usdt',
              type: PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1,
              contractAddress: '0x2FE40749812FAC39a0F380649eF59E01bccf3a1A'
            },
            {
              id: 'amoy-usdc',
              features: [PaymentFeatures.EIP_2612],
              type: PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1,
              contractAddress: '0x2FE40749812FAC39a0F380649eF59E01bccf3a1A'
            }
          ]
        },
        {
          chainId: '1101',
          paymentRails: '0x380dd90852d3Fe75B4f08D0c47416D6c4E0dC774',
          recipient: '0xE9D7fCDf32dF4772A7EF7C24c76aB40E4A42274a',
          options: [
            {
              id: 'zkevm-native',
              type: PaymentRequestDataType.Iden3PaymentRailsRequestV1
            },
            {
              id: 'zkevm-usdc',
              type: PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1,
              contractAddress: '0x2FE40749812FAC39a0F380649eF59E01bccf3a1A',
              features: [PaymentFeatures.EIP_2612]
            }
          ]
        },
        {
          chainId: '103',
          paymentRails: 'AKNPPwWHYx5ejCs9RsrJ8PLdsdLAhHeMrk8qi6bHizH7',
          recipient: 'HcCoHQFPjU2brBFW1hAZvEtZx7nSrYCBJVq4vKsjo6jf',
          options: [
            {
              id: 'solana-devnet',
              type: PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1
            },
            {
              id: 'solana-devnet-spl',
              type: PaymentRequestDataType.Iden3PaymentRailsSolanaSPLRequestV1,
              contractAddress: '4MjRhSkDaXmgdAL9d9UM7kmgJrWYGJH66oocUN2f3VUp'
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
      nonce: '411393'
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
      nonce: '411393',
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
          options: [
            {
              nonce: 1000416n,
              amount: '1000000000000',
              chainId: '80002',
              optionId: 'amoy-native'
            },
            {
              nonce: 10001123n,
              amount: '2233',
              chainId: '1101',
              optionId: 'zkevm-native'
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
      nonce: '1000416'
    });
    if (!agentMessageBytes) {
      fail('handlePaymentRequest is not expected null response');
    }
    const { unpackedMessage: agentMessage } = await packageManager.unpack(agentMessageBytes);

    expect((agentMessage as BasicMessage).type).to.be.eq(
      PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE
    );
  });

  it.skip('payment-request handler (Iden3PaymentRailsSolanaRequestV1, integration test)', async () => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const ethSigner = new ethers.Wallet(WALLET_KEY, rpcProvider);
    const nonce = 4n;
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
          description: 'Iden3PaymentRailsRequestSolanaV1 payment-request integration test',
          options: [
            {
              nonce,
              amount: '44000000',
              chainId: '103',
              optionId: 'solana-devnet'
            }
          ]
        }
      ],
      {
        solSigner: Keypair.fromSecretKey(bs58.decode(SOLANA_BASE_58_PK))
      }
    );

    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const agentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentIntegrationHandlerFunc('<session-id-hash>', '<issuer-did-hash>'),
      nonce: nonce.toString()
    });
    if (!agentMessageBytes) {
      fail('handlePaymentRequest is not expected null response');
    }
    const { unpackedMessage: agentMessage } = await packageManager.unpack(agentMessageBytes);

    expect((agentMessage as BasicMessage).type).to.be.eq(
      PROTOCOL_MESSAGE_TYPE.PROPOSAL_MESSAGE_TYPE
    );
  });

  it.skip('payment-request handler (Iden3PaymentRailsRequestSolanaSPLV1, integration test)', async () => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const ethSigner = new ethers.Wallet(WALLET_KEY, rpcProvider);
    const nonce = 10004n;
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
          description: 'Iden3PaymentRailsRequestSolanaSPLV1 payment-request integration test',
          options: [
            {
              nonce,
              amount: '500000000',
              chainId: '103',
              optionId: 'solana-devnet-spl'
            }
          ]
        }
      ],
      {
        solSigner: Keypair.fromSecretKey(bs58.decode(SOLANA_BASE_58_PK))
      }
    );

    const msgBytesRequest = await packageManager.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(JSON.stringify(paymentRequest)),
      {}
    );
    const agentMessageBytes = await paymentHandler.handlePaymentRequest(msgBytesRequest, {
      paymentHandler: paymentIntegrationHandlerFunc('<session-id-hash>', '<issuer-did-hash>'),
      nonce: nonce.toString()
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
          options: [
            {
              nonce: 220015n,
              amount: '1',
              chainId: '80002',
              optionId: 'amoy-usdt'
            },
            {
              nonce: 220011124n,
              amount: '1',
              optionId: 'zkevm-usdc',
              chainId: '1101'
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
      nonce: '220015',
      erc20TokenApproveHandler: async (data: Iden3PaymentRailsERC20RequestV1) => {
        const token = new Contract(data.tokenAddress, erc20Abi, ethSigner);
        const txData = await token.approve(
          data.proof[0].eip712.domain.verifyingContract,
          data.amount
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
          options: [
            {
              nonce: 330007n,
              amount: '2',
              optionId: 'amoy-usdc',
              chainId: '80002'
            },
            {
              nonce: 330001122n,
              amount: '2',
              optionId: 'zkevm-usdc',
              chainId: '1101'
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
      nonce: '330007'
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

  it.skip('payment handler (Iden3PaymentRailsSolanaV1, integration test)', async () => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const ethSigner = new ethers.Wallet(WALLET_KEY, rpcProvider);
    const nonce = 1n;
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
          description: 'Iden3PaymentRailsRequestSolanaV1 payment-request integration test',
          options: [
            {
              nonce,
              amount: '44000000',
              chainId: '103',
              optionId: 'solana-devnet'
            }
          ]
        }
      ],
      {
        solSigner: Keypair.fromSecretKey(bs58.decode(SOLANA_BASE_58_PK))
      }
    );
    const payment = createPayment(userDID, issuerDID, [
      {
        nonce: nonce.toString(),
        type: PaymentType.Iden3PaymentRailsSolanaV1,
        '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld',
        paymentData: {
          txId: 'zr1DhEWHaTsD1thHrn5oh4MNHESmNbaq7CEYQ9cR3mfRDmVNDrwMSDzVrnruAzopGpd2gsh6sQC2gCzhS78NZ8s',
          chainId: '103'
        }
      }
    ]);
    await paymentHandler.handlePayment(payment, {
      paymentRequest,
      paymentValidationHandler: paymentValidationIntegrationHandlerFunc
    });
  });

  it.skip('payment handler (Iden3PaymentRailsSolanaSPLV1, integration test)', async () => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const ethSigner = new ethers.Wallet(WALLET_KEY, rpcProvider);
    const nonce = 10001n;
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
          description: 'Iden3PaymentRailsRequestSolanaV1 payment-request integration test',
          options: [
            {
              nonce,
              amount: '500000000',
              chainId: '103',
              optionId: 'solana-devnet-spl'
            }
          ]
        }
      ],
      {
        solSigner: Keypair.fromSecretKey(bs58.decode(SOLANA_BASE_58_PK))
      }
    );
    const payment = createPayment(userDID, issuerDID, [
      {
        nonce: nonce.toString(),
        type: PaymentType.Iden3PaymentRailsSolanaV1,
        '@context': 'https://schema.iden3.io/core/jsonld/payment.jsonld',
        paymentData: {
          txId: '5tw4Wvk3S3LpyhVAezTiY7LPBhWY43AXpGAavuXsKQoTvao46qRiSCaoygsqtTzhtyncmbV5UBraQRyBM9KXeDZx',
          chainId: '103'
        }
      }
    ]);
    await paymentHandler.handlePayment(payment, {
      paymentRequest,
      paymentValidationHandler: paymentValidationIntegrationHandlerFunc
    });
  });

  it.skip('initialize Solana', async () => {
    const connection = new Connection('https://api.devnet.solana.com');
    const payer = Keypair.fromSecretKey(bs58.decode(SOLANA_BASE_58_PK));
    const programId = new PublicKey('AKNPPwWHYx5ejCs9RsrJ8PLdsdLAhHeMrk8qi6bHizH7');

    const schema = new Map([
      [
        InitializeInstruction,
        {
          kind: 'struct',
          fields: [
            ['owner_percentage', 'u8'],
            ['fee_collector', [32]]
          ]
        }
      ]
    ]);

    const ixData = Buffer.from(
      serialize(
        schema,
        new InitializeInstruction({
          owner_percentage: 15,
          fee_collector: payer.publicKey.toBytes()
        })
      )
    );

    const discriminator = sha256(Buffer.from('global:initialize')).slice(0, 8);
    const txData = Buffer.concat([Buffer.from(discriminator), ixData]);

    const [configPda] = await PublicKey.findProgramAddressSync([Buffer.from('config')], programId);

    const [treasuryPda] = await PublicKey.findProgramAddressSync(
      [Buffer.from('treasury')],
      programId
    );
    const balance = await connection.getBalance(treasuryPda);
    console.log(`Treasury balance: ${balance} lamports`);
    const ix = new TransactionInstruction({
      programId,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: treasuryPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      data: txData
    });
    const tx = new Transaction().add(ix);
    const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log('Initialize transaction signature:', sig);
    return sig;
  });

  it.skip('create and mint SPL: ', async () => {
    const connection = new Connection(clusterApiUrl('devnet'));
    const payer = Keypair.fromSecretKey(bs58.decode(SOLANA_BASE_58_PK));

    // 1. Create mint
    // const mint = await createMint(connection, payer, payer.publicKey, null, 9, undefined, {
    //   commitment: 'confirmed',
    //   preflightCommitment: 'confirmed'
    // }); // 9 decimals

    const mint = new PublicKey('4MjRhSkDaXmgdAL9d9UM7kmgJrWYGJH66oocUN2f3VUp');
    console.log(`Mint created: ${mint.toBase58()}`);
    // 2. Create token accounts
    // const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
    //   connection,
    //   payer,
    //   mint,
    //   payer.publicKey
    // );
    const senderTokenAccount = new PublicKey('BRRSY94cU3odT56GwmRjAFf293Ed5iGgkYrg2siUApH2');
    // 3. Mint tokens to sender
    await mintTo(
      connection,
      payer,
      mint,
      senderTokenAccount,
      payer,
      1_000_000_000_000_000, // 1 million tokens
      [],
      { commitment: 'confirmed', preflightCommitment: 'confirmed' }
    );

    // 4. Send some to the address
    const recipient = new PublicKey('GenCHmoE59ad9dx8CUhcfJKh2KRfhFwDhcQL6DAE8udK');
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      recipient
    );

    await transfer(
      connection,
      payer,
      senderTokenAccount,
      recipientTokenAccount.address,
      payer,
      10_000_000_000, // 10 tokens
      [],
      { commitment: 'confirmed', preflightCommitment: 'confirmed' }
    );
  });
});
