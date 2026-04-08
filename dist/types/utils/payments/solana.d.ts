import { Schema } from 'borsh';
import { Iden3PaymentRailsSolanaRequestV1, Iden3PaymentRailsSolanaSPLRequestV1, MultiChainPaymentConfigOption } from '../../iden3comm';
import { Keypair } from '@solana/web3.js';
import { Resolvable } from 'did-resolver';
export declare class SolanaNativePaymentRequest {
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
    });
}
export declare class SolanaSplPaymentRequest {
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
    });
}
export declare const SolanaNativePaymentSchema: Map<typeof SolanaNativePaymentRequest, {
    kind: string;
    fields: (string | (string | number)[])[][];
}>;
export declare const SolanaSplPaymentSchema: Map<typeof SolanaSplPaymentRequest, {
    kind: string;
    fields: (string | (string | number)[])[][];
}>;
export declare class SolanaPaymentInstruction {
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
    });
}
export declare const SolanaPaymentInstructionSchema: Schema;
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
export declare const buildSolanaPayment: (solSigner: Keypair, option: MultiChainPaymentConfigOption, chainId: string, paymentRails: string, recipient: string, amount: bigint, expirationDate: Date, nonce: bigint) => Promise<Iden3PaymentRailsSolanaRequestV1 | Iden3PaymentRailsSolanaSPLRequestV1>;
export declare const serializeSolanaPaymentInstruction: (data: Iden3PaymentRailsSolanaRequestV1 | Iden3PaymentRailsSolanaSPLRequestV1) => Uint8Array;
export declare const verifyIden3SolanaPaymentRequest: (data: Iden3PaymentRailsSolanaRequestV1 | Iden3PaymentRailsSolanaSPLRequestV1, resolver: Resolvable) => Promise<boolean>;
//# sourceMappingURL=solana.d.ts.map