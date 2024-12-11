import { PROTOCOL_MESSAGE_TYPE } from '../constants';

import { BasicMessage, IPackageManager } from '../types';

import * as uuid from 'uuid';
import {
  DiscoverFeatureDiscloseMessage,
  DiscoverFeatureDisclosure,
  DiscoverFeatureQueriesMessage,
  DiscoveryProtocolFeatureType
} from '../types/protocol/discovery-protocol';
import {
  AbstractMessageHandler,
  BasicHandlerOptions,
  IProtocolMessageHandler
} from './message-handler';
import { getUnixTimestamp } from '@iden3/js-iden3-core';
import { verifyExpiresTime } from './common';

/**
 * @beta
 * DiscoveryProtocolOptions contains options for DiscoveryProtocolHandler
 * @public
 * @interface   DiscoveryProtocolOptions
 */
export interface DiscoveryProtocolOptions {
  packageManager: IPackageManager;
}

/**
 *
 * Options to pass to discovery-protocol handler
 *
 * @beta
 * @public
 * @type DiscoveryProtocolHandlerOptions
 */
export type DiscoveryProtocolHandlerOptions = BasicHandlerOptions & {
  disclosureExpiresDate?: Date;
};

/**
 * @beta
 * createDiscoveryFeatureQueryMessage is a function to create didcomm protocol discovery-feature query message
 * @param opts - discovery-feature query options
 * @returns `DiscoverFeatureQueriesMessage`
 */
export function createDiscoveryFeatureQueryMessage(opts?: {
  featureTypes?: (DiscoveryProtocolFeatureType | string)[];
  from?: string;
  to?: string;
  expires_time?: number;
}): DiscoverFeatureQueriesMessage {
  const uuidv4 = uuid.v4();
  return {
    id: uuidv4,
    thid: uuidv4,
    type: PROTOCOL_MESSAGE_TYPE.DISCOVERY_PROTOCOL_QUERIES_MESSAGE_TYPE,
    body: {
      queries: opts?.featureTypes?.length
        ? opts.featureTypes.map((featureType) => ({ 'feature-type': featureType }))
        : [
            {
              'feature-type': DiscoveryProtocolFeatureType.Accept
            }
          ]
    },
    from: opts?.from,
    to: opts?.to,
    created_time: getUnixTimestamp(new Date()),
    expires_time: opts?.expires_time
  };
}

/**
 * @beta
 * createDiscoveryFeatureDiscloseMessage is a function to create didcomm protocol discovery-feature disclose message
 * @param {DiscoverFeatureDisclosure[]} disclosures - array of disclosures
 * @param opts - basic message options
 * @returns `DiscoverFeatureQueriesMessage`
 */
export function createDiscoveryFeatureDiscloseMessage(
  disclosures: DiscoverFeatureDisclosure[],
  opts?: {
    from?: string;
    to?: string;
    expires_time?: number;
  }
): DiscoverFeatureDiscloseMessage {
  const uuidv4 = uuid.v4();
  return {
    id: uuidv4,
    thid: uuidv4,
    type: PROTOCOL_MESSAGE_TYPE.DISCOVERY_PROTOCOL_DISCLOSE_MESSAGE_TYPE,
    body: {
      disclosures
    },
    from: opts?.from,
    to: opts?.to,
    created_time: getUnixTimestamp(new Date()),
    expires_time: opts?.expires_time
  };
}

/**
 * Interface to work with discovery protocol handler
 *
 * @beta
 * @public
 * @interface IDiscoveryProtocolHandler
 */
export interface IDiscoveryProtocolHandler {
  /**
   * handle discovery query message
   *
   * @param {DiscoverFeatureQueriesMessage} message - discover feature queries message
   * @param {{ expires_time?: number}} opts - discover feature handle options
   * @returns {Promise<DiscoverFeatureDiscloseMessage>} - discover feature disclose message
   */
  handleDiscoveryQuery(
    message: DiscoverFeatureQueriesMessage,
    opts?: DiscoveryProtocolHandlerOptions
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
        return await this.handleDiscoveryQuery(message as DiscoverFeatureQueriesMessage, context);
      default:
        return super.handle(message, context as { [key: string]: unknown });
    }
  }

  /**
   * @inheritdoc IDiscoveryProtocolHandler#handleDiscoveryQuery
   */
  async handleDiscoveryQuery(
    message: DiscoverFeatureQueriesMessage,
    opts?: DiscoveryProtocolHandlerOptions
  ): Promise<DiscoverFeatureDiscloseMessage> {
    if (!opts?.allowExpiredMessages) {
      verifyExpiresTime(message);
    }

    if (message.body.queries.length !== 1) {
      throw new Error('Invalid number of queries. Only one query is supported');
    }

    if (message.body.queries[0]['feature-type'] !== DiscoveryProtocolFeatureType.Accept) {
      throw new Error('Invalid feature-type. Only "accept" is supported');
    }

    const disclosures = [
      {
        'feature-type': DiscoveryProtocolFeatureType.Accept,
        accept: this._options.packageManager.getSupportedProfiles()
      }
    ];

    return Promise.resolve(
      createDiscoveryFeatureDiscloseMessage(disclosures, {
        to: message.from,
        from: message.to,
        expires_time: opts?.disclosureExpiresDate
          ? getUnixTimestamp(opts.disclosureExpiresDate)
          : undefined
      })
    );
  }
}
