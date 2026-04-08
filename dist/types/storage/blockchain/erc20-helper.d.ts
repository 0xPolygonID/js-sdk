import { Signer, ethers } from 'ethers';
/**
 * @beta
 * getPermitSignature is a function to create EIP712 Permit signature
 * @param {Signer} signer - User who owns the tokens
 * @param {string} tokenAddress - EIP-2612 contract address
 * @param {string} spender -  The contract address that will spend tokens
 * @param {bigint} value - Amount of tokens to approve
 * @param {number} deadline - Timestamp when the permit expires
 * @returns {Promise<PaymentRequestMessage>}
 */
export declare function getPermitSignature(signer: Signer, tokenAddress: string, spender: string, value: bigint, deadline: number, chainId: bigint): Promise<string>;
/**
 * @beta
 * getERC20Decimals is a function to retrieve the number of decimals of an ERC20 token
 * @param {string} tokenAddress - Token address
 * @param {ethers.ContractRunner} runner - Contract runner
 */
export declare function getERC20Decimals(tokenAddress: string, runner: ethers.ContractRunner): Promise<number>;
//# sourceMappingURL=erc20-helper.d.ts.map