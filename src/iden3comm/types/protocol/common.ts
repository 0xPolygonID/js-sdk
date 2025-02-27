import { DID } from '@iden3/js-iden3-core';
import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { BasicMessage } from '../packer';

/**
 * Represents information about a credential schema.
 *
 * @property {string} type - The type of the credential schema.
 * @property {string} context - The context in which the credential schema is used.
 */
export type CredentialSchemaInfo = {
  type: string;
  context: string;
};

/**
 * Represents information about a credential schema.
 *
 * @property {string} type - The type of the credential schema.
 * @property {string} context - The context in which the credential schema is used.
 */
export type Iden3DIDcommCompatibilityOptions = {
  multipleRecipientsFormat?: boolean;
};

/**
 * Enum representing the goal codes used in the iden3 communication protocol.
 *
 * @enum {string}
 * @property {string} ProposalRequest - Represents a proposal request in the iden3 communication protocol.
 */
export enum GoalCode {
  ProposalRequest = 'iden3comm.credentials.v1-1.proposal-request'
}

export const getProtocolMessageTypeByGoalCode = (goalCode: GoalCode) => {
  switch (goalCode) {
    case GoalCode.ProposalRequest:
      return PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE;
    default:
      throw new Error(`Unknown goal code ${goalCode}`);
  }
};

/*
  Iden3Comm messages works only with single recipient in from field.
  Historically `message.to` has `string` type, but according to DIDcomm it must be array of strings.

  function throws if it has multiple recipients.
*/

export function getIden3CommSingleRecipient(message: BasicMessage): DID | undefined {
  if (Array.isArray(message.to) && message.to.length > 1) {
    throw new Error('single recipient is supported for iden3comm messages');
  }

  const recipient = Array.isArray(message.to) ? message.to[0] : message.to;

  return recipient ? DID.parse(recipient) : undefined;
}
