import { Schema, serialize } from 'borsh';
import {
  Iden3PaymentRailsSolanaRequestV1,
  Iden3PaymentRailsSolanaSPLRequestV1
} from '../iden3comm';
import { ed25519 } from '@noble/curves/ed25519';
import { PaymentRequestDataType } from '../verifiable';
import { byteEncoder } from './encoding';
import { getUnixTimestamp } from '@iden3/js-iden3-core';
import { PublicKey } from '@solana/web3.js';

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
export const VerifyIden3SolanaPaymentRequest = (
  data: Iden3PaymentRailsSolanaRequestV1 | Iden3PaymentRailsSolanaSPLRequestV1
): boolean => {
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
  const signer = proof.verificationMethod.split(':').slice(-1)[0];
  return ed25519.verify(proof.proofValue, serialized, new PublicKey(signer).toBytes());
};
