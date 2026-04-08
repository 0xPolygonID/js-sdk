import { Block, JsonRpcProvider, Signer, TransactionReceipt, TransactionRequest } from 'ethers';
/**
 * Resend transaction options
 * @type ResendTxnOptions
 */
export type ResendTxnOptions = {
    increasedFeesPercentage?: number;
};
/**
 * Interface for TransactionService
 * @public
 */
export interface ITransactionService {
    /**
     * Returns transaction receipt and block by transaction hash
     *
     * @param {string} transactionHash - transaction hash.
     * @returns `Promise<{receipt?: TransactionReceipt , block?: Block}>` - returns transaction receipt and block
     * @public
     */
    getTransactionReceiptAndBlock(transactionHash: string): Promise<{
        receipt?: TransactionReceipt;
        block?: Block;
    }>;
    /**
     * Send transaction.
     *
     * @param {Signer} signer - transaction signer.
     * @param {TransactionRequest} request - transaction request.
     * @returns `Promise<txnHash: string, txnReceipt: TransactionReceipt` - returns txn hash and txn receipt.
     * @public
     */
    sendTransactionRequest(signer: Signer, request: TransactionRequest): Promise<{
        txnHash: string;
        txnReceipt: TransactionReceipt;
    }>;
    /**
     * Resend transaction with options. Useful when `transaction underpriced` error thrown on transaction.
     *
     * @param {Signer} signer - transaction signer.
     * @param {TransactionRequest} request - transaction request.
     * @param {ResendTxnOptions} opts - resend transaction options.
     * @returns `Promise<{ txnHash: string; txnReceipt: TransactionReceipt }>` -returns txn hash and txn receipt.
     * @public
     */
    resendTransaction(signer: Signer, request: TransactionRequest, opts?: ResendTxnOptions): Promise<{
        txnHash: string;
        txnReceipt: TransactionReceipt;
    }>;
}
/**
 * Transaction service to provide interaction with blockchain transactions.
 * allows to: get tx receipt by tx id, send and resend transaction with new fees.
 * @class TransactionService
 * @public
 * @implements ITransactionService interface
 */
export declare class TransactionService implements ITransactionService {
    private readonly _provider;
    /**
     * Creates an instance of TransactionService.
     * @param {JsonRpcProvider} - RPC provider
     */
    constructor(_provider: JsonRpcProvider);
    /** {@inheritDoc ITransactionService.getTransactionReceiptAndBlock} */
    getTransactionReceiptAndBlock(txnHash: string): Promise<{
        receipt?: TransactionReceipt;
        block?: Block;
    }>;
    /** {@inheritDoc ITransactionService.sendTransactionRequest} */
    sendTransactionRequest(signer: Signer, request: TransactionRequest): Promise<{
        txnHash: string;
        txnReceipt: TransactionReceipt;
    }>;
    /** {@inheritDoc ITransactionService.resendTransaction} */
    resendTransaction(signer: Signer, request: TransactionRequest, opts?: ResendTxnOptions): Promise<{
        txnHash: string;
        txnReceipt: TransactionReceipt;
    }>;
}
//# sourceMappingURL=transaction-service.d.ts.map