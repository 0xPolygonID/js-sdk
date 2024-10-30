import { Contract, Signer } from 'ethers';

const erc20PermitAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      }
    ],
    name: 'nonces',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      {
        internalType: 'bytes1',
        name: 'fields',
        type: 'bytes1'
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'version',
        type: 'string'
      },
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'verifyingContract',
        type: 'address'
      },
      {
        internalType: 'bytes32',
        name: 'salt',
        type: 'bytes32'
      },
      {
        internalType: 'uint256[]',
        name: 'extensions',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

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
  const erc20PermitContract = new Contract(tokenAddress, erc20PermitAbi, signer);
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
