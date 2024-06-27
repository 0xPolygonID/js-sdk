import { InvitationMessage } from '../types/protocol/invitation';
import * as uuid from 'uuid';
import { BasicMessage, IPackageManager, PackerParams } from '../types';
import { AbstractMessageHandler, IProtocolMessageHandler } from './message-handler';
import {
  AcceptAuthMode,
  AcceptJwzMode,
  AcceptProtocolVersion,
  parseAcceptProfile
} from '../accept-profiles';
import { PROTOCOL_MESSAGE_TYPE } from '../constants';

/**
 *  @beta
 *  createInvitationRequest is a function to create protocol invitation request
 * @param {string} sender - sender did
 * @param {string} goalCode - goal сode
 * @param {string} goal - goal
 * @param {string[]} accept - accept array
 * @param {BasicMessage} attachmentMessage - attachment message
 * @returns `InvitationMessage`
 */
export function createInvitationMessage(
  sender: string,
  goalCode: string,
  goal: string,
  accept: string[],
  attachmentMessage: BasicMessage
): InvitationMessage {
  const uuid4 = uuid.v4();
  return {
    type: PROTOCOL_MESSAGE_TYPE.INVITATION_MESSAGE_TYPE,
    id: uuid4,
    from: sender,
    body: {
      goal_code: goalCode,
      goal,
      accept
    },
    attachments: [
      {
        id: attachmentMessage.id,
        media_type: 'application/json',
        data: {
          json: attachmentMessage
        }
      }
    ]
  };
}

/** @beta InvitationHandlerParams represents invitation handler params */
export type InvitationHandlerParams = {
  packerParams: PackerParams;
  acceptOptions: AcceptOptions;
};

/** @beta InvitationHandlerOptions represents invitation handler options */
export type InvitationHandlerOptions = {
  useProfile?: boolean;
};

/** @beta AcceptOptions represents invitation handler accept options */
export type AcceptOptions = {
  protocolVersion: AcceptProtocolVersion[];
  authMode: AcceptAuthMode[];
  jwzMode: AcceptJwzMode[];
};

/**
 * Interface that allows the processing of the invitation message in the raw format for given identifier
 * @beta
 * @public
 * @interface IInvitationHandler
 */
export interface IInvitationHandler {
  /**
   * unpacks invitation message
   * @public
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<AuthorizationRequestMessage>`
   */
  parseInvitationMessage(request: Uint8Array): Promise<InvitationMessage>;
}

/**
 *
 * Allows to process Invitation protocol message
 * @beta
 * @class InvitationHandler
 * @implements implements InvitationHandler interface
 */
export class InvitationHandler
  extends AbstractMessageHandler
  implements InvitationHandler, IProtocolMessageHandler
{
  /**
   * @beta Creates an instance of InvitationHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {InvitationHandlerParams} _params - payment handler params
   *
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _params: InvitationHandlerParams
  ) {
    super();
  }

  /**
   * @inheritdoc IProtocolMessageHandler#parseInvitationMessage
   */
  async parseInvitationMessage(request: Uint8Array): Promise<InvitationMessage> {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const invitationMessage = message as InvitationMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.INVITATION_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    return invitationMessage;
  }

  public async handle(
    message: BasicMessage,
    context: InvitationHandlerOptions
  ): Promise<BasicMessage | null> {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.INVITATION_MESSAGE_TYPE: {
        const invitationMessage = message as InvitationMessage;
        if (!this.isSupportAcceptProfile(invitationMessage.body.accept)) {
          throw new Error('accept profile not supported');
        }
        // TODO: support profile
        const iden3message = invitationMessage.attachments[0].data.json;
        return super.handle(iden3message, context as { [key: string]: unknown });
      }
      default:
        return super.handle(message, context as { [key: string]: unknown });
    }
  }

  private isSupportAcceptProfile(acceptParams: string[]): boolean {
    const acceptOpts = this._params.acceptOptions;
    for (const acceptProfile of acceptParams) {
      const { protocolVersion, authMode, jwzMode } = parseAcceptProfile(acceptProfile);
      if (!acceptOpts.protocolVersion.includes(protocolVersion)) {
        continue;
      }
      if (!acceptOpts.authMode.filter((value) => authMode.includes(value)).length) {
        continue;
      }
      if (!acceptOpts.jwzMode.filter((value) => jwzMode.includes(value)).length) {
        continue;
      }
      return true;
    }
    return false;
  }
}
