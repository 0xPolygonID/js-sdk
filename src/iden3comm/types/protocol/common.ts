import { PROTOCOL_MESSAGE_TYPE } from '../../constants';

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
