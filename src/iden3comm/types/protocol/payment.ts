import { BasicMessage } from '../';
import {
  PaymentRequestDataType,
  SupportedCurrencies,
  SupportedPaymentProofType
} from '../../../verifiable';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';

/** @beta PaymentRequestMessage is struct the represents payment-request message */
export type PaymentRequestMessage = BasicMessage & {
  body: PaymentRequestMessageBody;
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
    | (Iden3PaymentRailsRequestV1 | Iden3PaymentRailsERC20RequestV1)[];
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
  currency: SupportedCurrencies;
  expiration?: string;
};

export type Iden3PaymentRailsRequestV1 = {
  type: PaymentRequestDataType.Iden3PaymentRailsRequestV1;
  '@context': string | (string | object)[];
  recipient: string;
  amount: string;
  currency: SupportedCurrencies;
  expirationDate: string;
  nonce: string;
  metadata: string;
  proof: EthereumEip712Signature2021 | EthereumEip712Signature2021[];
};

export type Iden3PaymentRailsERC20RequestV1 = Omit<Required<Iden3PaymentRailsRequestV1>, 'type'> & {
  tokenAddress: string;
  ERC20PermitSupported?: boolean;
  type: PaymentRequestDataType.Iden3PaymentRailsERC20RequestV1;
};

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

/** @beta  PaymentMessage is struct the represents payment message */
export type PaymentMessage = BasicMessage & {
  body: PaymentMessageBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.PAYMENT_MESSAGE_TYPE;
};

/** @beta  PaymentMessageBody is struct the represents body for payment message */
export type PaymentMessageBody = {
  payments: (Iden3PaymentCryptoV1 | Iden3PaymentRailsV1 | Iden3PaymentRailsERC20V1)[];
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
  };
};
