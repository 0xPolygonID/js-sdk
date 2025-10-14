import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import { BasicMessage, EncryptedCredentialIssuanceMessage } from '../types';

import { W3CCredential } from '../../verifiable';
import { ICredentialWallet } from '../../credentials';

import {
  AbstractMessageHandler,
  BasicHandlerOptions,
  IProtocolMessageHandler
} from './message-handler';
import { JoseService, KMS } from '../../kms';
import { decryptsJWE } from '../utils';
import { byteDecoder, byteEncoder } from '../../utils';

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
  private readonly _joseService: JoseService;
  /**
   * Constructs a new instance of the EncryptedIssuanceResponseHandler class.
   *
   * @param _credentialWallet The credential wallet used for managing credentials.
   */
  constructor(
    private readonly _credentialWallet: ICredentialWallet,
    private readonly options: {
      resolvePrivateKeyByKid?: (kid: string) => Promise<CryptoKey>;
      kms?: KMS;
    }
  ) {
    super();
    this._joseService = new JoseService();
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
    const plaintext = await decryptsJWE(
      byteEncoder.encode(JSON.stringify(message.body.data)),
      this._joseService,
      {
        resolvePrivateKeyByKid: this.options?.resolvePrivateKeyByKid,
        kms: this.options.kms
      }
    );

    const credential = W3CCredential.fromJSON({
      ...JSON.parse(byteDecoder.decode(plaintext)),
      proof: message.body.proof
    });
    await this._credentialWallet.save(credential);
    return credential;
  }
}
