import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../constants';

import { BasicMessage, IPackageManager, ProtocolMessage } from '../types';

import * as uuid from 'uuid';
import {
  DiscoverFeatureDiscloseMessage,
  DiscoverFeatureDisclosure,
  DiscoverFeatureQueriesMessage,
  DiscoverFeatureQuery,
  DiscoverFeatureQueryType,
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
  protocols?: Array<ProtocolMessage>;
  goalCodes?: Array<string>;
  headers?: Array<string>;
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
export function createDiscoveryFeatureQueryMessage(
  queries: DiscoverFeatureQuery[],
  opts?: {
    from?: string;
    to?: string;
    expires_time?: number;
  }
): DiscoverFeatureQueriesMessage {
  const uuidv4 = uuid.v4();
  return {
    id: uuidv4,
    thid: uuidv4,
    typ: MediaType.PlainMessage,
    type: PROTOCOL_MESSAGE_TYPE.DISCOVERY_PROTOCOL_QUERIES_MESSAGE_TYPE,
    body: {
      queries
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
    typ: MediaType.PlainMessage,
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
    const headers = [
      'id',
      'typ',
      'type',
      'thid',
      'body',
      'from',
      'to',
      'created_time',
      'expires_time'
    ];
    if (!_options.headers) {
      _options.headers = headers;
    }
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

    const disclosures: DiscoverFeatureDisclosure[] = [];
    for (const query of message.body.queries) {
      disclosures.push(...this.handleQuery(query));
    }

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

  private handleQuery(query: DiscoverFeatureQuery): DiscoverFeatureDisclosure[] {
    let result: DiscoverFeatureDisclosure[] = [];
    switch (query[DiscoverFeatureQueryType.FeatureType]) {
      case DiscoveryProtocolFeatureType.Accept:
        result = this.handleAcceptQuery();
        break;
      case DiscoveryProtocolFeatureType.Protocol:
        result = this.handleProtocolQuery();
        break;
      case DiscoveryProtocolFeatureType.GoalCode:
        result = this.handleGoalCodeQuery();
        break;
      case DiscoveryProtocolFeatureType.Header:
        result = this.handleHeaderQuery();
        break;
    }

    return this.handleMatch(result, query.match);
  }

  private handleAcceptQuery(): DiscoverFeatureDisclosure[] {
    const acceptProfiles = this._options.packageManager.getSupportedProfiles();
    return acceptProfiles.map((profile) => ({
      [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Accept,
      id: profile
    }));
  }

  private handleProtocolQuery(): DiscoverFeatureDisclosure[] {
    return (
      this._options.protocols?.map((protocol) => ({
        [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Protocol,
        id: protocol
      })) ?? []
    );
  }

  private handleGoalCodeQuery(): DiscoverFeatureDisclosure[] {
    return (
      this._options.goalCodes?.map((goalCode) => ({
        [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.GoalCode,
        id: goalCode
      })) ?? []
    );
  }

  private handleHeaderQuery(): DiscoverFeatureDisclosure[] {
    return (
      this._options.headers?.map((header) => ({
        [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Header,
        id: header
      })) ?? []
    );
  }

  private handleMatch(
    disclosures: DiscoverFeatureDisclosure[],
    match?: string
  ): DiscoverFeatureDisclosure[] {
    if (!match || match === '*') {
      return disclosures;
    }
    const regExp = this.wildcardToRegExp(match);
    return disclosures.filter((disclosure) => regExp.test(disclosure.id));
  }

  private wildcardToRegExp(match: string): RegExp {
    // Escape special regex characters, then replace `*` with `.*`
    const regexPattern = match.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${regexPattern}$`);
  }
}
