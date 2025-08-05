import { Schema, serialize } from 'borsh';
import {
  Iden3PaymentRailsSolanaRequestV1,
  Iden3PaymentRailsSolanaSPLRequestV1
} from '../iden3comm';
import { ed25519 } from '@noble/curves/ed25519';
import { PaymentRequestDataType } from '../verifiable';
import { byteEncoder } from './encoding';
import { getUnixTimestamp } from '@iden3/js-iden3-core';
import bs58 from 'bs58';
import { sha256 } from 'ethers';

export class SolanaNativePaymentRequest {
  version: string;
  chainId: bigint;
  verifyingContract: Uint8Array;
  recipient: Uint8Array;
  amount: bigint;
  expirationDate: bigint;
  nonce: bigint;
  metadata: Uint8Array;

  constructor(fields: {
    version: string;
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
  version: string;
  chainId: bigint;
  verifyingContract: Uint8Array;
  tokenAddress: Uint8Array;
  recipient: Uint8Array;
  amount: bigint;
  expirationDate: bigint;
  nonce: bigint;
  metadata: Uint8Array;

  constructor(fields: {
    version: string;
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
        ['version', ['string']],
        ['chainId', 'u64'],
        ['verifyingContract', [32]],
        ['recipient', [32]],
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
        ['version', ['string']],
        ['chainId', 'u64'],
        ['verifyingContract', [32]],
        ['tokenAddress', [32]],
        ['recipient', [32]],
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
  recovery_id: number;

  constructor(fields: {
    recipient: Uint8Array;
    amount: bigint;
    expiration_date: bigint;
    nonce: bigint;
    metadata: Uint8Array;
    signature: Uint8Array;
    recovery_id: number;
  }) {
    this.recipient = fields.recipient;
    this.amount = fields.amount;
    this.expiration_date = fields.expiration_date;
    this.nonce = fields.nonce;
    this.metadata = fields.metadata;
    this.signature = fields.signature;
    this.recovery_id = fields.recovery_id;
  }
}

export const SolanaPaymentInstructionSchema: Schema = new Map([
  [
    SolanaPaymentInstruction,
    {
      kind: 'struct',
      fields: [
        ['recipient', [32]],
        ['amount', 'u64'],
        ['expiration_date', 'u64'],
        ['nonce', 'u64'],
        ['metadata', ['u8']],
        ['signature', [64]],
        ['recovery_id', 'u8']
      ]
    }
  ]
]);

export const VerifyIden3SolanaPaymentRequest = (
  data: Iden3PaymentRailsSolanaRequestV1 | Iden3PaymentRailsSolanaSPLRequestV1
): boolean => {
  const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
  let serialized: Uint8Array;
  if (data.type === PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1) {
    const request = new SolanaNativePaymentRequest({
      version: proof.domain.version,
      chainId: BigInt(proof.domain.chainId),
      verifyingContract: bs58.decode(proof.domain.verifyingContract),
      recipient: bs58.decode(data.recipient),
      amount: BigInt(data.amount),
      expirationDate: BigInt(getUnixTimestamp(new Date(data.expirationDate))),
      nonce: BigInt(data.nonce),
      metadata: byteEncoder.encode('0x')
    });
    serialized = serialize(SolanaNativePaymentSchema, request);
  } else {
    const request = new SolanaSplPaymentRequest({
      version: proof.domain.version,
      chainId: BigInt(proof.domain.chainId),
      verifyingContract: bs58.decode(proof.domain.verifyingContract),
      tokenAddress: bs58.decode(data.tokenAddress),
      recipient: bs58.decode(data.recipient),
      amount: BigInt(data.amount),
      expirationDate: BigInt(getUnixTimestamp(new Date(data.expirationDate))),
      nonce: BigInt(data.nonce),
      metadata: byteEncoder.encode('0x')
    });
    serialized = serialize(SolanaSplPaymentSchema, request);
  }
  const hash = sha256(serialized);
  return ed25519.verify(proof.proofValue, byteEncoder.encode(hash), bs58.decode(proof.pubKey));
};
