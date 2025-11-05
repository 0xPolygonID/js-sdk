import { Signer, ethers } from 'ethers';
import {
  EthereumEip712Signature2021,
  Iden3PaymentRailsERC20RequestV1,
  Iden3PaymentRailsRequestV1,
  MultiChainPaymentConfigOption
} from '../../iden3comm';
import { PaymentRequestDataType, SupportedPaymentProofType } from '../../verifiable';
import { getUnixTimestamp } from '@iden3/js-iden3-core';
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
export const buildEvmPayment = async (
  signer: Signer,
  option: MultiChainPaymentConfigOption,
  chainId: string,
  paymentRails: string,
  recipient: string,
  amount: bigint,
  expirationDateRequired: Date,
  nonce: bigint
): Promise<Iden3PaymentRailsRequestV1 | Iden3PaymentRailsERC20RequestV1> => {
  const typeUrl = `https://schema.iden3.io/core/json/${option.type}.json`;
  const typesFetchResult = await fetch(typeUrl);
  const types = await typesFetchResult.json();
  delete types.EIP712Domain;
  const paymentData =
    option.type === PaymentRequestDataType.Iden3PaymentRailsRequestV1
      ? {
          recipient,
          amount: amount,
          expirationDate: getUnixTimestamp(expirationDateRequired),
          nonce,
          metadata: '0x'
        }
      : {
          tokenAddress: option.contractAddress,
          recipient,
          amount: amount,
          expirationDate: getUnixTimestamp(expirationDateRequired),
          nonce,
          metadata: '0x'
        };

  const domain = {
    name: 'MCPayment',
    version: '1.0.0',
    chainId,
    verifyingContract: paymentRails
  };

  const signature = await signer.signTypedData(domain, types, paymentData);

  const proof: EthereumEip712Signature2021[] = [
    {
      type: SupportedPaymentProofType.EthereumEip712Signature2021,
      proofPurpose: 'assertionMethod',
      proofValue: signature,
      verificationMethod: `did:pkh:eip155:${chainId}:${await signer.getAddress()}`,
      created: new Date().toISOString(),
      eip712: {
        types: typeUrl,
        primaryType: 'Iden3PaymentRailsRequestV1',
        domain
      }
    }
  ];
  const d: Iden3PaymentRailsRequestV1 = {
    type: PaymentRequestDataType.Iden3PaymentRailsRequestV1,
    '@context': [
      `https://schema.iden3.io/core/jsonld/payment.jsonld#${option.type}`,
      'https://w3id.org/security/suites/eip712sig-2021/v1'
    ],
    recipient,
    amount: amount.toString(),
    expirationDate: expirationDateRequired.toISOString(),
    nonce: nonce.toString(),
    metadata: '0x',
    proof
  };

  if (option.type === PaymentRequestDataType.Iden3PaymentRailsRequestV1) {
    return d;
  }
  return {
    ...d,
    type: option.type,
    tokenAddress: option.contractAddress || '',
    features: option.features || []
  } as Iden3PaymentRailsERC20RequestV1;
};

export async function verifyEIP712TypedData(
  data: Iden3PaymentRailsRequestV1 | Iden3PaymentRailsERC20RequestV1,
  resolver: Resolvable
): Promise<string> {
  const paymentData =
    data.type === PaymentRequestDataType.Iden3PaymentRailsRequestV1
      ? {
          recipient: data.recipient,
          amount: data.amount,
          expirationDate: getUnixTimestamp(new Date(data.expirationDate)),
          nonce: data.nonce,
          metadata: '0x'
        }
      : {
          tokenAddress: data.tokenAddress,
          recipient: data.recipient,
          amount: data.amount,
          expirationDate: getUnixTimestamp(new Date(data.expirationDate)),
          nonce: data.nonce,
          metadata: '0x'
        };
  const proof = Array.isArray(data.proof) ? data.proof[0] : data.proof;
  const typesFetchResult = await fetch(proof.eip712.types);
  const types = await typesFetchResult.json();
  delete types.EIP712Domain;
  const recovered = ethers.verifyTypedData(
    proof.eip712.domain,
    types,
    paymentData,
    proof.proofValue
  );

  const { didDocument } = await resolver.resolve(proof.verificationMethod);
  if (didDocument?.verificationMethod) {
    for (const verificationMethod of didDocument.verificationMethod) {
      if (
        verificationMethod.blockchainAccountId?.split(':').slice(-1)[0].toLowerCase() ===
        recovered.toLowerCase()
      ) {
        return recovered;
      }
    }
  } else {
    throw new Error('failed request. issuer DIDDocument does not contain any verificationMethods');
  }

  throw new Error(`failed request. no matching verificationMethod`);
}
