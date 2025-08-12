import { BasicMessage } from '../';
import {
  PaymentFeatures,
  PaymentRequestDataType,
  SupportedCurrencies,
  SupportedPaymentProofType
} from '../../../verifiable';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';

/** @beta PaymentRequestMessage is struct the represents payment-request message */
export type PaymentRequestMessage = BasicMessage & {
  body: PaymentRequestMessageBody;
  from: string;
  to: string;
  type: typeof PROTOCOL_MESSAGE_TYPE.PAYMENT_REQUEST_MESSAGE_TYPE;
};

/** @beta PaymentRequestMessageBody is struct the represents body for payment-request */
export type PaymentRequestMessageBody = {
  agent: string;
  payments: PaymentRequestInfo[];
};

/** @beta PaymentRequestInfo is struct the represents payment info for payment-request */
export type PaymentRequestInfo = {
  credentials: {
    type: string;
    context: string;
  }[];
  data:
    | Iden3PaymentRequestCryptoV1
    | (
        | Iden3PaymentRequestCryptoV1
        | Iden3PaymentRailsRequestV1
        | Iden3PaymentRailsERC20RequestV1
        | Iden3PaymentRailsSolanaRequestV1
        | Iden3PaymentRailsSolanaSPLRequestV1
      )[];
  description?: string;
};

/** @beta Iden3PaymentRequestCryptoV1 is struct the represents payment data info for payment-request */
export type Iden3PaymentRequestCryptoV1 = {
  type: PaymentRequestDataType.Iden3PaymentRequestCryptoV1;
  '@context'?: string | (string | object)[];
  amount: string;
  id: string;
  chainId: string;
  address: string;
  currency: SupportedCurrencies | string;
  expiration?: string;
};

/** @beta Iden3PaymentRailsRequestV1 is struct the represents EVM native payment rails request */
export type Iden3PaymentRailsRequestV1 = {
  type: PaymentRequestDataType.Iden3PaymentRailsRequestV1;
  '@context': string | (string | object)[];
  recipient: string;
  amount: string;
  expirationDate: string;
  nonce: string;
  metadata: string;
  proof: EthereumEip712Signature2021 | EthereumEip712Signature2021[];
};

/** @beta Iden3PaymentRailsERC20RequestV1 is struct the represents EVM ERC 20 payment rails request */
export type Iden3PaymentRailsERC20RequestV1 = Omit<Required<Iden3PaymentRailsRequestV1>, 'type'> & {
  tokenAddress: string;
  features?: PaymentFeatures[];
  type: PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1;
};

/** @beta Iden3PaymentRailsSolanaRequestV1 is struct the represents Solana native payment rails request */
export type Iden3PaymentRailsSolanaRequestV1 = Omit<
  Required<Iden3PaymentRailsRequestV1>,
  'type' | 'proof'
> & {
  type: PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1;
  proof: Iden3SolanaEd25519SignatureV1 | Iden3SolanaEd25519SignatureV1[];
};

/** @beta Iden3PaymentRailsSolanaSPLRequestV1 is struct the represents Solana SPL payment rails request */
export type Iden3PaymentRailsSolanaSPLRequestV1 = Omit<
  Required<Iden3PaymentRailsERC20RequestV1>,
  'type' | 'proof'
> & {
  type: PaymentRequestDataType.Iden3PaymentRailsSolanaSPLRequestV1;
  proof: Iden3SolanaEd25519SignatureV1 | Iden3SolanaEd25519SignatureV1[];
};

/** @beta EthereumEip712Signature2021 is struct the represents EIP-712 signature for Ethereum */
export type EthereumEip712Signature2021 = {
  type: SupportedPaymentProofType.EthereumEip712Signature2021;
  proofPurpose: string;
  proofValue: string;
  verificationMethod: string;
  created: string;
  eip712: {
    types: string;
    primaryType: string;
    domain: {
      name: string;
      version: string;
      chainId: string;
      verifyingContract: string;
    };
  };
};

/** @beta Iden3SolanaEd25519SignatureV1 is struct the represents Ed25519 signature for Solana Payment Instruction */
export type Iden3SolanaEd25519SignatureV1 = {
  type: SupportedPaymentProofType.SolanaEd25519Signature2025;
  proofPurpose: string;
  proofValue: string;
  created: string;
  verificationMethod: string;
  domain: {
    version: 'SolanaEd25519NativeV1' | 'SolanaEd25519SPLV1';
    chainId: string;
    verifyingContract: string;
  };
};

/** @beta  PaymentMessage is struct the represents payment message */
export type PaymentMessage = BasicMessage & {
  body: PaymentMessageBody;
  from: string;
  to: string;
  type: typeof PROTOCOL_MESSAGE_TYPE.PAYMENT_MESSAGE_TYPE;
};

/** @beta  PaymentMessageBody is struct the represents body for payment message */
export type PaymentMessageBody = {
  payments: PaymentTypeUnion[];
};

/** @beta Iden3PaymentCryptoV1 is struct the represents payment info for payment */
export type Iden3PaymentCryptoV1 = {
  id: string;
  type: 'Iden3PaymentCryptoV1';
  '@context'?: string | (string | object)[];
  paymentData: {
    txId: string;
  };
};

/** @beta Iden3PaymentRailsV1 is struct the represents payment info for Iden3PaymentRailsRequestV1 */
export type Iden3PaymentRailsV1 = {
  nonce: string;
  type: 'Iden3PaymentRailsV1';
  '@context': string | (string | object)[];
  paymentData: {
    txId: string;
    chainId: string;
  };
};

/** @beta Iden3PaymentRailsERC20V1 is struct the represents payment info for Iden3PaymentRailsERC20RequestV1 */
export type Iden3PaymentRailsERC20V1 = {
  nonce: string;
  type: 'Iden3PaymentRailsERC20V1';
  '@context': string | (string | object)[];
  paymentData: {
    txId: string;
    chainId: string;
    tokenAddress: string;
  };
};

/** @beta Iden3PaymentRailsSolanaV1 is struct the represents payment info for Iden3PaymentRailsSolanaV1 */
export type Iden3PaymentRailsSolanaV1 = {
  nonce: string;
  type: 'Iden3PaymentRailsSolanaV1';
  '@context': string | (string | object)[];
  paymentData: {
    txId: string;
    chainId: string;
  };
};

/** @beta Iden3PaymentRailsSolanaSPLV1 is struct the represents payment info for Iden3PaymentRailsSolanaSPLV1 */
export type Iden3PaymentRailsSolanaSPLV1 = {
  nonce: string;
  type: 'Iden3PaymentRailsSolanaSPLV1';
  '@context': string | (string | object)[];
  paymentData: {
    txId: string;
    chainId: string;
    tokenAddress: string;
  };
};

/** @beta MultiChainPaymentConfig is struct that represents payments contracts information for different chains */
export type MultiChainPaymentConfig = {
  chainId: string;
  paymentRails: string;
  recipient: string;
  options: {
    id: string;
    type:
      | PaymentRequestDataType.Iden3PaymentRailsRequestV1
      | PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1
      | PaymentRequestDataType.Iden3PaymentRailsSolanaRequestV1
      | PaymentRequestDataType.Iden3PaymentRailsSolanaSPLRequestV1;
    contractAddress?: string;
    features?: PaymentFeatures[];
  }[];
};

/**
 * @beta
 * PaymentRequestTypeUnion is a type of supported payment request types
 */
export type PaymentRequestTypeUnion =
  | Iden3PaymentRequestCryptoV1
  | Iden3PaymentRailsRequestV1
  | Iden3PaymentRailsERC20RequestV1
  | Iden3PaymentRailsSolanaRequestV1
  | Iden3PaymentRailsSolanaSPLRequestV1;

/**
 * @beta
 * PaymentTypeUnion is a type of supported payment types
 */
export type PaymentTypeUnion =
  | Iden3PaymentCryptoV1
  | Iden3PaymentRailsV1
  | Iden3PaymentRailsERC20V1
  | Iden3PaymentRailsSolanaV1
  | Iden3PaymentRailsSolanaSPLV1;
