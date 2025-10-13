import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import { BasicMessage, EncryptedCredentialIssuanceMessage, IPackageManager } from '../types';

import { W3CCredential } from '../../verifiable';
import { ICredentialWallet } from '../../credentials';

import {
  AbstractMessageHandler,
  BasicHandlerOptions,
  IProtocolMessageHandler
} from './message-handler';
import { byteEncoder } from '../../utils';

/**
 *
 * Options to pass to encrypted issuance response handler
 *
 * @public
 * @interface EncryptedIssuanceResponseOptions
 */
export type EncryptedIssuanceResponseOptions = BasicHandlerOptions;

/**
 * Handler for encrypted issuance response messages
 *
 * @public

 * @class EncryptedIssuanceResponseHandler
 */
export class EncryptedIssuanceResponseHandler
  extends AbstractMessageHandler
  implements IProtocolMessageHandler
{
  /**
   * Constructs a new instance of the EncryptedIssuanceResponseHandler class.
   *
   * @param _packerMgr The package manager used for packing and unpacking data.
   * @param _credentialWallet The credential wallet used for managing credentials.
   * @param opts Optional configuration options for the handler.
   */
  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _credentialWallet: ICredentialWallet,
    private readonly opts?: object
  ) {
    super();
  }

  async handle(
    message: BasicMessage,
    ctx: EncryptedIssuanceResponseOptions
  ): Promise<BasicMessage | null> {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.ENCRYPTED_CREDENTIAL_ISSUANCE_RESPONSE_MESSAGE_TYPE: {
        await this.handleEncryptedIssuanceResponseMessage(
          message as EncryptedCredentialIssuanceMessage
        );
        return null;
      }
      default:
        return super.handle(message, ctx);
    }
  }

  private async handleEncryptedIssuanceResponseMessage(
    message: EncryptedCredentialIssuanceMessage
  ): Promise<W3CCredential> {
    const credentialUnpacked = await this._packerMgr.unpack(
      byteEncoder.encode(JSON.stringify(message.body.data))
    );
    const credential = W3CCredential.fromJSON({
      ...credentialUnpacked.unpackedMessage,
      proof: message.body.proof
    });
    await this._credentialWallet.save(credential);
    return credential;
  }
}
