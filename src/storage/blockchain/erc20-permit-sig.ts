import { Contract, Signer } from 'ethers';

import abi from './abi/ERC20Permit.json';

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
  const erc20PermitContract = new Contract(tokenAddress, abi, signer);
  const nonce = await erc20PermitContract.nonces(await signer.getAddress());
  const domainData = await erc20PermitContract.eip712Domain();
  const domain = {
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
