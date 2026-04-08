import { Resolvable } from 'did-resolver';
import { VerificationMethodType } from '../constants';
import { RecipientInfo } from '../packers';
export declare const getRecipientsJWKs: (recipients: RecipientInfo[], documentResolver: Resolvable) => Promise<{
    alg: string;
    did: string;
    keyType: VerificationMethodType;
    kid: string;
    recipientJWK: JsonWebKey;
}[]>;
//# sourceMappingURL=jwk.d.ts.map