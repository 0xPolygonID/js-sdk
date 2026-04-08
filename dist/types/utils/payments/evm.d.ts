import { Signer } from 'ethers';
import { Iden3PaymentRailsERC20RequestV1, Iden3PaymentRailsRequestV1, MultiChainPaymentConfigOption } from '../../iden3comm';
import { Resolvable } from 'did-resolver';
/**
 * @beta
 * buildEvmPayment creates an EVM-based payment request and signs it using EIP-712.
 * @param {Signer} signer - EIP-712 compatible signer
 * @param {MultiChainPaymentConfigOption} option - payment option configuration
 * @param {string} chainId - EVM chain ID
 * @param {string} paymentRails - payment rails contract address
 * @param {string} recipient - recipient address
 * @param {bigint} amount - payment amount in smallest units
 * @param {Date} expirationDateRequired - expiration date
 * @param {bigint} nonce - unique nonce for the payment
 * @returns {Promise<Iden3PaymentRailsRequestV1 | Iden3PaymentRailsERC20RequestV1>} payment request object
 */
export declare const buildEvmPayment: (signer: Signer, option: MultiChainPaymentConfigOption, chainId: string, paymentRails: string, recipient: string, amount: bigint, expirationDateRequired: Date, nonce: bigint) => Promise<Iden3PaymentRailsRequestV1 | Iden3PaymentRailsERC20RequestV1>;
export declare function verifyEIP712TypedData(data: Iden3PaymentRailsRequestV1 | Iden3PaymentRailsERC20RequestV1, resolver: Resolvable): Promise<string>;
//# sourceMappingURL=evm.d.ts.map