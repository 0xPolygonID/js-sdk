import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { BasicMessage } from '../types';
import { AuthHandler, AuthProtocolMessagePayload } from './auth';
import { ContractRequestHandler, ProofProtocolMessagePayload } from './contract-request';

export type ProtocolMessagePayload = AuthProtocolMessagePayload | ProofProtocolMessagePayload;

export type MessageHandler = (payload: ProtocolMessagePayload) => Promise<BasicMessage | null>;

/**
 * Handles protocol messages for the Iden3 SDK.
 */
export class ProtocolMessageHandler {
  constructor(
    private readonly _authHandler: AuthHandler,
    private readonly _contractRequestHandler: ContractRequestHandler
  ) {}

  async handle(payload: ProtocolMessagePayload): Promise<BasicMessage | null> {
    switch (payload.message.type) {
      case PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE:
      case PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE:
        return this._authHandler.handle(payload as AuthProtocolMessagePayload);
      case PROTOCOL_MESSAGE_TYPE.CONTRACT_INVOKE_REQUEST_MESSAGE_TYPE:
        return this._contractRequestHandler.handle(payload as ProofProtocolMessagePayload);
      default:
        return null;
    }
  }
}
