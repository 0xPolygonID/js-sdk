import { Schema, serialize } from 'borsh';
import {
  Iden3PaymentRailsSolanaRequestV1,
  Iden3PaymentRailsSolanaSPLRequestV1,
  Iden3SolanaEd25519SignatureV1,
  MultiChainPaymentConfigOption
} from '../iden3comm';
import { ed25519 } from '@noble/curves/ed25519';
import { PaymentRequestDataType, SOLANA_CHAIN_REF, SupportedPaymentProofType } from '../verifiable';
import { byteEncoder } from './encoding';
import { getUnixTimestamp } from '@iden3/js-iden3-core';
import { Keypair, PublicKey } from '@solana/web3.js';
import { Resolvable } from 'did-resolver';

export class SolanaNativePaymentRequest {
  version: Uint8Array;
  chainId: bigint;
  verifyingContract: Uint8Array;
  recipient: Uint8Array;
  amount: bigint;
  expirationDate: bigint;
  nonce: bigint;
  metadata: Uint8Array;

  constructor(fields: {
    version: Uint8Array;
    chainId: bigint;
    verifyingContract: Uint8Array;
    recipient: Uint8Array;
    amount: bigint;
    expirationDate: bigint;
    nonce: bigint;
    metadata: Uint8Array;
  }) {
    this.version = fields.version;
    this.chainId = fields.chainId;
    this.verifyingContract = fields.verifyingContract;
    this.recipient = fields.recipient;
    this.amount = fields.amount;
    this.expirationDate = fields.expirationDate;
    this.nonce = fields.nonce;
    this.metadata = fields.metadata;
  }
}

export class SolanaSplPaymentRequest {
  version: Uint8Array;
  chainId: bigint;
  verifyingContract: Uint8Array;
  tokenAddress: Uint8Array;
  recipient: Uint8Array;
  amount: bigint;
  expirationDate: bigint;
  nonce: bigint;
  metadata: Uint8Array;

  constructor(fields: {
    version: Uint8Array;
    chainId: bigint;
    verifyingContract: Uint8Array;
    tokenAddress: Uint8Array;
    recipient: Uint8Array;
    amount: bigint;
    expirationDate: bigint;
    nonce: bigint;
    metadata: Uint8Array;
  }) {
    this.version = fields.version;
    this.chainId = fields.chainId;
    this.verifyingContract = fields.verifyingContract;
    this.tokenAddress = fields.tokenAddress;
    this.recipient = fields.recipient;
    this.amount = fields.amount;
    this.expirationDate = fields.expirationDate;
    this.nonce = fields.nonce;
    this.metadata = fields.metadata;
  }
}

export const SolanaNativePaymentSchema = new Map([
  [
    SolanaNativePaymentRequest,
    {
      kind: 'struct',
      fields: [
        ['version', ['u8']],
        ['chainId', 'u64'],
        ['verifyingContract', ['u8', 32]],
        ['recipient', ['u8', 32]],
        ['amount', 'u64'],
        ['expirationDate', 'u64'],
        ['nonce', 'u64'],
        ['metadata', ['u8']]
      ]
    }
  ]
]);

export const SolanaSplPaymentSchema = new Map([
  [
    SolanaSplPaymentRequest,
    {
      kind: 'struct',
      fields: [
        ['version', ['u8']],
        ['chainId', 'u64'],
        ['verifyingContract', ['u8', 32]],
        ['tokenAddress', ['u8', 32]],
        ['recipient', ['u8', 32]],
        ['amount', 'u64'],
        ['expirationDate', 'u64'],
        ['nonce', 'u64'],
        ['metadata', ['u8']]
      ]
    }
  ]
]);

export class SolanaPaymentInstruction {
  recipient: Uint8Array;
  amount: bigint;
  expiration_date: bigint;
  nonce: bigint;
  metadata: Uint8Array;
  signature: Uint8Array;

  constructor(fields: {
    recipient: Uint8Array;
    amount: bigint;
    expiration_date: bigint;
    nonce: bigint;
    metadata: Uint8Array;
    signature: Uint8Array;
  }) {
    this.recipient = fields.recipient;
    this.amount = fields.amount;
    this.expiration_date = fields.expiration_date;
    this.nonce = fields.nonce;
    this.metadata = fields.metadata;
    this.signature = fields.signature;
  }
}

export const SolanaPaymentInstructionSchema: Schema = new Map([
  [
    SolanaPaymentInstruction,
    {
      kind: 'struct',
      fields: [
        ['recipient', ['u8', 32]],
        ['amount', 'u64'],
        ['expiration_date', 'u64'],
        ['nonce', 'u64'],
        ['metadata', ['u8']],
        ['signature', [64]]
      ]
    }
  ]
]);

/**
 * @beta
 * buildSolanaPayment creates an Solana-based payment request and signs it using ed25519.
 * @param {Keypair} solSigner - Keypair for signing the payment request
 * @param {MultiChainPaymentConfigOption} option - payment option configuration
 * @param {string} chainId - EVM chain ID
 * @param {string} paymentRails - payment rails contract address
 * @param {string} recipient - recipient address
 * @param {bigint} amount - payment amount in smallest units
 * @param {Date} expirationDateRequired - expiration date
 * @param {bigint} nonce - unique nonce for the payment
 * @returns {Promise<Iden3PaymentRailsSolanaRequestV1 | Iden3PaymentRailsSolanaSPLRequestV1>} payment request object
 */
export const buildSolanaPayment = async (
  solSigner: Keypair,
  option: MultiChainPaymentConfigOption,
  chainId: string,
  paymentRails: string,
  recipient: string,
  amount: bigint,
  expirationDate: Date,
  nonce: bigint
): Promise<Iden3PaymentRailsSolanaRequestV1 | Iden3PaymentRailsSolanaSPLRequestV1> => {
  let serialized: Uint8Array;
  const proofVersion =
    option.type === PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1
      ? 'SolanaEd25519NativeV1'
      : 'SolanaEd25519SPLV1';
  let chainRef = chainId;
  switch (chainId) {
    case '101':
      chainRef = SOLANA_CHAIN_REF.DEVNET;
      break;
    case '102':
      chainRef = SOLANA_CHAIN_REF.TESTNET;
      break;
    case '103':
      chainRef = SOLANA_CHAIN_REF.MAINNET;
      break;
  }
  if (option.type === PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1) {
    const request = new SolanaNativePaymentRequest({
      version: byteEncoder.encode(proofVersion),
      chainId: BigInt(chainId),
      verifyingContract: new PublicKey(paymentRails).toBytes(),
      recipient: new PublicKey(recipient).toBytes(),
      amount: BigInt(amount),
      expirationDate: BigInt(getUnixTimestamp(expirationDate)),
      nonce: nonce,
      metadata: byteEncoder.encode('0x')
    });
    serialized = serialize(SolanaNativePaymentSchema, request);
  } else {
    if (!option.contractAddress) {
      throw new Error(`failed request. no contract address for ${option.type} payment type`);
    }
    const request = new SolanaSplPaymentRequest({
      version: byteEncoder.encode(proofVersion),
      chainId: BigInt(chainId),
      verifyingContract: new PublicKey(paymentRails).toBytes(),
      tokenAddress: new PublicKey(option.contractAddress).toBytes(),
      recipient: new PublicKey(recipient).toBytes(),
      amount: BigInt(amount),
      expirationDate: BigInt(getUnixTimestamp(expirationDate)),
      nonce: nonce,
      metadata: byteEncoder.encode('0x')
    });
    serialized = serialize(SolanaSplPaymentSchema, request);
  }
  const privateKey = solSigner.secretKey.slice(0, 32);
  const signature = await ed25519.sign(serialized, privateKey);
  const proof: Iden3SolanaEd25519SignatureV1[] = [
    {
      type: SupportedPaymentProofType.SolanaEd25519Signature2025,
      proofPurpose: 'assertionMethod',
      proofValue: Buffer.from(signature).toString('hex'),
      created: new Date().toISOString(),
      verificationMethod: `did:pkh:solana:${chainRef}:${solSigner.publicKey.toBase58()}`,
      domain: {
        version: proofVersion,
        chainId,
        verifyingContract: paymentRails
      }
    }
  ];
  const d: Iden3PaymentRailsSolanaRequestV1 = {
    type: PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1,
    '@context': [
      `https://schema.iden3.io/core/jsonld/payment.jsonld#${option.type}`,
      'https://schema.iden3.io/core/jsonld/solanaEd25519.jsonld'
    ],
    recipient,
    amount: amount.toString(),
    expirationDate: expirationDate.toISOString(),
    nonce: nonce.toString(),
    metadata: '0x',
    proof
  };
  if (option.type === PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1) {
    return d;
  }

  return {
    ...d,
    type: option.type,
    tokenAddress: option.contractAddress || '',
    features: option.features || []
  } as Iden3PaymentRailsSolanaSPLRequestV1;
};

export const serializeSolanaPaymentInstruction = (
  data: Iden3PaymentRailsSolanaRequestV1 | Iden3PaymentRailsSolanaSPLRequestV1
): Uint8Array => {
  let serialized: Uint8Array;
  const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
  const proofVersion =
    data.type === PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1
      ? 'SolanaEd25519NativeV1'
      : 'SolanaEd25519SPLV1';
  if (data.type === PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1) {
    const request = new SolanaNativePaymentRequest({
      version: byteEncoder.encode(proofVersion),
      chainId: BigInt(proof.domain.chainId),
      verifyingContract: new PublicKey(proof.domain.verifyingContract).toBytes(),
      recipient: new PublicKey(data.recipient).toBytes(),
      amount: BigInt(data.amount),
      expirationDate: BigInt(getUnixTimestamp(new Date(data.expirationDate))),
      nonce: BigInt(data.nonce),
      metadata: byteEncoder.encode('0x')
    });
    serialized = serialize(SolanaNativePaymentSchema, request);
  } else {
    const request = new SolanaSplPaymentRequest({
      version: byteEncoder.encode(proofVersion),
      chainId: BigInt(proof.domain.chainId),
      verifyingContract: new PublicKey(proof.domain.verifyingContract).toBytes(),
      tokenAddress: new PublicKey(data.tokenAddress).toBytes(),
      recipient: new PublicKey(data.recipient).toBytes(),
      amount: BigInt(data.amount),
      expirationDate: BigInt(getUnixTimestamp(new Date(data.expirationDate))),
      nonce: BigInt(data.nonce),
      metadata: byteEncoder.encode('0x')
    });
    serialized = serialize(SolanaSplPaymentSchema, request);
  }
  return serialized;
};
export const verifyIden3SolanaPaymentRequest = async (
  data: Iden3PaymentRailsSolanaRequestV1 | Iden3PaymentRailsSolanaSPLRequestV1,
  resolver: Resolvable
): Promise<boolean> => {
  const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
  let serialized: Uint8Array;
  if (data.type === PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1) {
    const request = new SolanaNativePaymentRequest({
      version: byteEncoder.encode(proof.domain.version),
      chainId: BigInt(proof.domain.chainId),
      verifyingContract: new PublicKey(proof.domain.verifyingContract).toBytes(),
      recipient: new PublicKey(data.recipient).toBytes(),
      amount: BigInt(data.amount),
      expirationDate: BigInt(getUnixTimestamp(new Date(data.expirationDate))),
      nonce: BigInt(data.nonce),
      metadata: byteEncoder.encode('0x')
    });
    serialized = serialize(SolanaNativePaymentSchema, request);
  } else {
    const request = new SolanaSplPaymentRequest({
      version: byteEncoder.encode(proof.domain.version),
      chainId: BigInt(proof.domain.chainId),
      verifyingContract: new PublicKey(proof.domain.verifyingContract).toBytes(),
      tokenAddress: new PublicKey(data.tokenAddress).toBytes(),
      recipient: new PublicKey(data.recipient).toBytes(),
      amount: BigInt(data.amount),
      expirationDate: BigInt(getUnixTimestamp(new Date(data.expirationDate))),
      nonce: BigInt(data.nonce),
      metadata: byteEncoder.encode('0x')
    });
    serialized = serialize(SolanaSplPaymentSchema, request);
  }

  const { didDocument } = await resolver.resolve(proof.verificationMethod);
  let publicKeyMultibase;
  if (didDocument?.verificationMethod) {
    for (const verificationMethod of didDocument.verificationMethod) {
      if (verificationMethod.type === 'Ed25519VerificationKey2020') {
        publicKeyMultibase = verificationMethod.publicKeyMultibase;
      }
    }
  }

  if (!publicKeyMultibase) {
    throw new Error('No Ed25519VerificationKey2020 found in DID document');
  }

  return ed25519.verify(proof.proofValue, serialized, new PublicKey(publicKeyMultibase).toBytes());
};
