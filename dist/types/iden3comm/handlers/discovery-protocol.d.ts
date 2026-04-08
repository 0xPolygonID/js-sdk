import { BasicMessage, IPackageManager, ProtocolMessage } from '../types';
import { DiscoverFeatureDiscloseMessage, DiscoverFeatureDisclosure, DiscoverFeatureQueriesMessage, DiscoverFeatureQuery } from '../types/protocol/discovery-protocol';
import { AbstractMessageHandler, BasicHandlerOptions, IProtocolMessageHandler } from './message-handler';
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
export declare function createDiscoveryFeatureQueryMessage(queries: DiscoverFeatureQuery[], opts?: {
    from?: string;
    to?: string;
    expires_time?: number;
}): DiscoverFeatureQueriesMessage;
/**
 * @beta
 * createDiscoveryFeatureDiscloseMessage is a function to create didcomm protocol discovery-feature disclose message
 * @param {DiscoverFeatureDisclosure[]} disclosures - array of disclosures
 * @param opts - basic message options
 * @returns `DiscoverFeatureQueriesMessage`
 */
export declare function createDiscoveryFeatureDiscloseMessage(disclosures: DiscoverFeatureDisclosure[], opts?: {
    from?: string;
    to?: string;
    expires_time?: number;
}): DiscoverFeatureDiscloseMessage;
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
    handleDiscoveryQuery(message: DiscoverFeatureQueriesMessage, opts?: DiscoveryProtocolHandlerOptions): Promise<DiscoverFeatureDiscloseMessage>;
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
export declare class DiscoveryProtocolHandler extends AbstractMessageHandler implements IDiscoveryProtocolHandler, IProtocolMessageHandler {
    private readonly _options;
    /**
     * Creates an instance of DiscoveryProtocolHandler.
     * @param {DiscoveryProtocolOptions} _options - discovery protocol options
     */
    constructor(_options: DiscoveryProtocolOptions);
    /**
     * @inheritdoc IProtocolMessageHandler#handle
     */
    handle(message: BasicMessage, context: {
        [key: string]: unknown;
    }): Promise<BasicMessage | null>;
    /**
     * @inheritdoc IDiscoveryProtocolHandler#handleDiscoveryQuery
     */
    handleDiscoveryQuery(message: DiscoverFeatureQueriesMessage, opts?: DiscoveryProtocolHandlerOptions): Promise<DiscoverFeatureDiscloseMessage>;
    private handleQuery;
    private handleAcceptQuery;
    private handleProtocolQuery;
    private handleGoalCodeQuery;
    private handleHeaderQuery;
    private handleMatch;
    private wildcardToRegExp;
}
//# sourceMappingURL=discovery-protocol.d.ts.map