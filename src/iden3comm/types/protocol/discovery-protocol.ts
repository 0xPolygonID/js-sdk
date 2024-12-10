import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { BasicMessage } from '../packer';

/** @beta DiscoveryProtocolFeatureType is enum for supported feature-types */
export enum DiscoveryProtocolFeatureType {
  Accept = 'accept'
}

/** @beta DiscoverFeatureQueriesMessage is struct the represents discover feature queries message */
export type DiscoverFeatureQueriesMessage = BasicMessage & {
  body: DiscoverFeatureQueriesBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.DISCOVERY_PROTOCOL_QUERIES_MESSAGE_TYPE;
};

/** @beta DiscoverFeatureQueriesBody is struct the represents discover feature queries body */
export type DiscoverFeatureQueriesBody = {
  queries: {
    'feature-type': DiscoveryProtocolFeatureType | string;
  }[];
};

/** @beta DiscoverFeatureDiscloseMessage is struct the represents discover feature disclose message */
export type DiscoverFeatureDiscloseMessage = BasicMessage & {
  body: DiscoverFeatureDiscloseBody;
  type: typeof PROTOCOL_MESSAGE_TYPE.DISCOVERY_PROTOCOL_DISCLOSE_MESSAGE_TYPE;
};

/** @beta DiscoverFeatureDiscloseBody is struct the represents discover feature disclose body */
export type DiscoverFeatureDiscloseBody = {
  disclosures: {
    'feature-type': DiscoveryProtocolFeatureType | string;
    accept: Array<string>;
  }[];
};
