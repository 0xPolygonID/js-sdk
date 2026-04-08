import { DocumentLoader } from '@iden3/js-jsonld-merklization';
import { IStateStorage } from '../../storage';
import { ProofQuery } from '../../verifiable';
import { BaseConfig } from '../../circuits';
import { VerifyOpts } from './query';
import { JSONObject, VerifiablePresentation } from '../../iden3comm';
/**
 *  Verify Context - params for pub signal verification
 * @type VerifyContext
 */
export type VerifyContext = {
    pubSignals: string[];
    query: ProofQuery;
    verifiablePresentation?: VerifiablePresentation;
    sender: string;
    challenge: bigint;
    opts?: VerifyOpts;
    params?: JSONObject;
};
export declare const userStateError: Error;
/**
 * PubSignalsVerifier provides verify method
 * @public
 * @class PubSignalsVerifier
 */
export declare class PubSignalsVerifier {
    private readonly _documentLoader;
    private readonly _stateStorage;
    /**
     * Creates an instance of PubSignalsVerifier.
     * @param {DocumentLoader} _documentLoader document loader
     * @param {IStateStorage} _stateStorage state storage
     */
    constructor(_documentLoader: DocumentLoader, _stateStorage: IStateStorage);
    /**
     * verify public signals
     *
     * @param {string} circuitId circuit id
     * @param {VerifyContext} ctx verification parameters
     * @returns `Promise<BaseConfig>`
     */
    verify(circuitId: string, ctx: VerifyContext): Promise<BaseConfig>;
    private credentialAtomicQueryMTPV2Verify;
    private credentialAtomicQuerySigV2Verify;
    private performQueryVerificationV3;
    private credentialAtomicQueryV3BetaVerify;
    private credentialAtomicQueryV3Verify;
    private credentialAtomicQueryV3_16_16_64Verify;
    private authV2Verify;
    private linkedMultiQueryNVerify;
    private linkedMultiQuery10Verify;
    private linkedMultiQueryVerify;
    private linkedMultiQuery5Verify;
    private linkedMultiQuery3Verify;
    private verifyIdOwnership;
    private checkQueryV2Circuits;
    private resolve;
    private rootResolve;
    private checkStateExistenceForId;
    private checkGlobalState;
    private checkRevocationStateForId;
    private checkRevocationState;
}
//# sourceMappingURL=pub-signals-verifier.d.ts.map