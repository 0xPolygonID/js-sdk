import { AuthV2Inputs, AuthV2PubSignals } from './auth-v2';

/**
 * Auth v3 circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class AuthV3Inputs
 * @extends {BaseConfig}
 */
export class AuthV3Inputs extends AuthV2Inputs {}
// AuthV3PubSignals auth.circom public signals
/**
 * public signals
 *
 * @public
 * @class AuthV3PubSignals
 */
export class AuthV3PubSignals extends AuthV2PubSignals {}
