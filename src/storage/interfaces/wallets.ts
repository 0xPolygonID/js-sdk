import { TransactionReceipt, TransactionRequest } from 'ethers';
import { KmsKeyId, TypedData } from '../../kms';

export interface IEthereumWallet {
  /**
   * sign eip712 message with kms key
   *
   * @param {KmsKeyId} keyId - key identifier to sign the typed data
   * @param {TypedData} typedData  - Typed data to sign
   * @param {Object} [opts] - Optional parameters
   * @returns `Promise<Uint8Array>`
   */
  signTypedData(
    keyId: KmsKeyId,
    typedData: TypedData,
    opts?: { [key: string]: unknown }
  ): Promise<Uint8Array>;

  /**
   * Gets ethAddress for the kmsKeyId
   * @param {KmsKeyId} keyId - key identifier
   * @returns {Promise<string>} Public key as a hex string
   */
  getEthAddress(keyId: KmsKeyId): Promise<string>;

  /**
   * Sends a transaction with the kms key
   * @param keyId - The key ID to use for signing and sending the transaction
   * @param request - The transaction request
   * @param {Object} [opts] - Optional parameters
   */
  sendTransaction(
    keyId: KmsKeyId,
    request: TransactionRequest,
    opts?: { [key: string]: unknown }
  ): Promise<TransactionReceipt | null>;

  /**
   * Estimates the gas required for a transaction
   * @param keyId - The key ID to use for estimate gas for the transaction
   * @param request - The transaction request
   * @param {Object} [opts] - Optional parameters
   */
  estimateGas(
    keyId: KmsKeyId,
    request: TransactionRequest,
    opts?: { [key: string]: unknown }
  ): Promise<bigint>;
}
