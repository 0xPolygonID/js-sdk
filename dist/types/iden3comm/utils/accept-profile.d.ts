import { ProvingMethodAlg } from '@iden3/js-jwz';
import { AcceptProfile } from '../types';
export declare const buildAcceptFromProvingMethodAlg: (provingMethodAlg: ProvingMethodAlg) => string;
export declare const acceptHasProvingMethodAlg: (accept: string[], provingMethodAlg: ProvingMethodAlg) => boolean;
export declare const buildAccept: (profiles: AcceptProfile[]) => string[];
export declare const parseAcceptProfile: (profile: string) => AcceptProfile;
//# sourceMappingURL=accept-profile.d.ts.map