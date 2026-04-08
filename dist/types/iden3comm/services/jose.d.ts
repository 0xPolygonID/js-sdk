import { FlattenedJWE, GeneralDecryptResult, GeneralJWE } from 'jose';
import { VerificationMethodType } from '../constants';
export type JoseParams = {
    enc: string;
    typ: string;
    recipients: {
        alg: string;
        did: string;
        keyType: VerificationMethodType;
        kid: string;
        recipientJWK: JsonWebKey;
    }[];
};
/**
 * JoseService performs encryption and decryption of messages based on JOSE standard
 *
 * @beta
 * @class JoseService
 */
export declare class JoseService {
    private readonly resolvePrivateKeyByKid;
    constructor(resolvePrivateKeyByKid: (kid: string) => Promise<CryptoKey>);
    encrypt(msg: Uint8Array, options: JoseParams): Promise<GeneralJWE>;
    decrypt(data: GeneralJWE | FlattenedJWE): Promise<GeneralDecryptResult>;
    private removeDuplicates;
}
//# sourceMappingURL=jose.d.ts.map