import { Block, JsonRpcProvider, Signer, TransactionReceipt, TransactionRequest } from 'ethers';
import { EthConnectionConfig } from '../storage';

/**
 * Resend transaction options
 * @type RecendTxnOptions
 */
export type RecendTxnOptions = {
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
  getTransactionReceiptAndBlock(
    transactionHash: string
  ): Promise<{ receipt?: TransactionReceipt; block?: Block }>;

  /**
   * Send transaction.
   *
   * @param {Signer} signer - transaction signer.
   * @param {TransactionRequest} request - transaction request.
   * @returns `Promise<txnHash: string, txnReceipt: TransactionReceipt` - returns txn hash and txn receipt.
   * @public
   */
  sendTransactionRequest(
    signer: Signer,
    request: TransactionRequest
  ): Promise<{ txnHash: string; txnReceipt: TransactionReceipt }>;

  /**
   * Resend transaction with options. Useful when `transaction underpriced` error thrown on transaction.
   *
   * @param {Signer} signer - transaction signer.
   * @param {TransactionRequest} request - transaction request.
   * @param {RecendTxnOptions} opts - resend transaction options.
   * @returns `Promise<{ txnHash: string; txnReceipt: TransactionReceipt }>` -returns txn hash and txn receipt.
   * @public
   */
  resendTransaction(
    signer: Signer,
    request: TransactionRequest,
    opts?: RecendTxnOptions
  ): Promise<{ txnHash: string; txnReceipt: TransactionReceipt }>;
}

/**
 * Transaction service to provide interaction with blockchain transactions.
 * allows to: get tx receipt by tx id, send and resend transaction with new fees.
 * @class TransactionService
 * @public
 * @implements ITransactionService interface
 */
export class TransactionService implements ITransactionService {
  private readonly _provider: JsonRpcProvider;

  /**
   * Creates an instance of TransactionService.
   * @param {EthConnectionConfig | EthConnectionConfig[]} [ethConfig=defaultEthConnectionConfig]
   */
  constructor(ethConfig: EthConnectionConfig | EthConnectionConfig[]) {
    const config = Array.isArray(ethConfig) ? ethConfig[0] : ethConfig;
    this._provider = new JsonRpcProvider(config.url);
  }

  /** {@inheritDoc ITransactionService.getTransactionReceiptAndBlock} */
  async getTransactionReceiptAndBlock(
    txnHash: string
  ): Promise<{ receipt?: TransactionReceipt; block?: Block }> {
    const receipt = await this._provider.getTransactionReceipt(txnHash);
    const block = await receipt?.getBlock();
    return { receipt: receipt || undefined, block };
  }

  /** {@inheritDoc ITransactionService.sendTransactionRequest} */
  async sendTransactionRequest(
    signer: Signer,
    request: TransactionRequest
  ): Promise<{ txnHash: string; txnReceipt: TransactionReceipt }> {
    const tx = await signer.sendTransaction(request);
    const txnReceipt = await tx.wait();
    if (!txnReceipt) {
      throw new Error(`transaction: ${tx.hash} failed to mined`);
    }
    const status: number | null = txnReceipt.status;
    const txnHash: string = txnReceipt.hash;

    if (!status) {
      throw new Error(`transaction: ${txnHash} failed to mined`);
    }

    return { txnHash, txnReceipt };
  }

  /** {@inheritDoc ITransactionService.resendTransaction} */
  async resendTransaction(
    signer: Signer,
    request: TransactionRequest,
    opts?: RecendTxnOptions
  ): Promise<{ txnHash: string; txnReceipt: TransactionReceipt }> {
    const feeData = await this._provider.getFeeData();
    let { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = feeData;

    if (opts?.increasedFeesPercentage) {
      const multiplyVal = BigInt((opts.increasedFeesPercentage + 100) / 100);
      maxFeePerGas = maxFeePerGas ? maxFeePerGas * multiplyVal : null;
      maxPriorityFeePerGas = maxPriorityFeePerGas ? maxPriorityFeePerGas * multiplyVal : null;
      gasPrice = gasPrice ? gasPrice * multiplyVal : null;
    }

    request.maxFeePerGas = maxFeePerGas;
    request.maxPriorityFeePerGas = maxPriorityFeePerGas;
    request.gasPrice = gasPrice;

    return this.sendTransactionRequest(signer, request);
  }
}
