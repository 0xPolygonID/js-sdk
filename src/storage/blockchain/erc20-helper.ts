import { Contract, Signer, ethers } from 'ethers';

import permitAbi from './abi/ERC20Permit.json';
import erc20Abi from './abi/ERC20.json';

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
export async function getPermitSignature(
  signer: Signer,
  tokenAddress: string,
  spender: string,
  value: bigint,
  deadline: number
) {
  const erc20PermitContract = new Contract(tokenAddress, permitAbi, signer);
  const nonce = await erc20PermitContract.nonces(await signer.getAddress());
  const domainData = await erc20PermitContract.eip712Domain();
  const domain = {
    name: domainData[1],
    version: domainData[2],
    chainId: domainData[3],
    verifyingContract: tokenAddress
  };

  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  const message = {
    owner: await signer.getAddress(),
    spender: spender,
    value: value,
    nonce: nonce,
    deadline: deadline
  };

  return signer.signTypedData(domain, types, message);
}

/**
 * @beta
 * getERC20Decimals is a function to retrieve the number of decimals of an ERC20 token
 * @param {string} tokenAddress - Token address
 */
export async function getERC20Decimals(
  tokenAddress: string,
  runner: ethers.ContractRunner
): Promise<number> {
  const erc20Contract = new Contract(tokenAddress, erc20Abi, runner);
  return erc20Contract.decimals();
}
