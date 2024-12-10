import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import { BasicMessage, IPackageManager } from '../types';

import * as uuid from 'uuid';
import {
  DiscoverFeatureDiscloseMessage,
  DiscoverFeatureQueriesMessage,
  DiscoveryProtocolFeatureType
} from '../types/protocol/discovery-protocol';
import { AbstractMessageHandler, IProtocolMessageHandler } from './message-handler';

/**
 * RefreshHandlerOptions contains options for RefreshHandler
 * @public
 * @interface   RefreshHandlerOptions
 */
export interface DiscoveryProtocolOptions {
  packageManager: IPackageManager;
}

/**
 * Interface to work with discovery protocol handler
 *
 * @public
 * @interface IDiscoveryProtocolHandler
 */
export interface IDiscoveryProtocolHandler {
  /**
   * handle discovery query message
   *
   * @param {DiscoverFeatureQueriesMessage} message - discover feature queries message
   * @returns {Promise<DiscoverFeatureDiscloseMessage>} - discover feature disclose message
   */
  handleDiscoveryQuery(
    message: DiscoverFeatureQueriesMessage
  ): Promise<DiscoverFeatureDiscloseMessage>;
}

/**
 *
 * Handler for discovery protocol
 *
 * @public
 * @beta
 * @class DiscoveryProtocolHandler
 * @implements implements DiscoveryProtocolHandler interface
 */
export class DiscoveryProtocolHandler
  extends AbstractMessageHandler
  implements IDiscoveryProtocolHandler, IProtocolMessageHandler
{
  /**
   * Creates an instance of DiscoveryProtocolHandler.
   * @param {DiscoveryProtocolOptions} _options - discovery protocol options
   */
  constructor(private readonly _options: DiscoveryProtocolOptions) {
    super();
  }

  /**
   * @inheritdoc IProtocolMessageHandler#handle
   */
  public async handle(
    message: BasicMessage,
    context: { [key: string]: unknown }
  ): Promise<BasicMessage | null> {
    switch (message.type) {
      case PROTOCOL_MESSAGE_TYPE.DISCOVERY_PROTOCOL_QUERIES_MESSAGE_TYPE:
        return await this.handleDiscoveryQuery(message as DiscoverFeatureQueriesMessage);
      default:
        return super.handle(message, context as { [key: string]: unknown });
    }
  }

  /**
   * @inheritdoc IDiscoveryProtocolHandler#handleDiscoveryQuery
   */
  async handleDiscoveryQuery(
    message: DiscoverFeatureQueriesMessage
  ): Promise<DiscoverFeatureDiscloseMessage> {
    if (message.body.queries.length !== 1) {
      throw new Error('Invalid number of queries. Only one query is supported');
    }

    if (message.body.queries[0]['feature-type'] !== DiscoveryProtocolFeatureType.Accept) {
      throw new Error('Invalid feature-type. Only "accept" is supported');
    }

    const accept = this._options.packageManager.getSupportedProfiles();

    return Promise.resolve({
      id: uuid.v4(),
      type: PROTOCOL_MESSAGE_TYPE.DISCOVERY_PROTOCOL_DISCLOSE_MESSAGE_TYPE,
      body: {
        disclosures: [
          {
            'feature-type': DiscoveryProtocolFeatureType.Accept,
            accept
          }
        ]
      }
    });
  }
}
