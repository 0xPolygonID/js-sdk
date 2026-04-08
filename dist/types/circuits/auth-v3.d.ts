import { AuthV2Inputs, AuthV2PubSignals } from './auth-v2';
/**
 * Auth v3 circuit representation
 * Inputs and public signals declaration, marshalling and parsing
 *
 * @public
 * @class AuthV3Inputs
 * @extends {BaseConfig}
 */
export declare class AuthV3Inputs extends AuthV2Inputs {
    constructor(opts?: {
        mtLevel?: number;
        mtLevelOnChain?: number;
    });
}
/**
 * public signals
 *
 * @public
 * @class AuthV3PubSignals
 */
export declare class AuthV3PubSignals extends AuthV2PubSignals {
}
//# sourceMappingURL=auth-v3.d.ts.map