import { Hasher, MtValue, Options, Path } from '@iden3/js-jsonld-merklization';
import { W3CCredential } from './credential';
import { ProofQuery } from './proof';
export declare const stringByPath: (obj: {
    [key: string]: unknown;
}, path: string) => string;
export declare const buildQueryPath: (contextURL: string, contextType: string, field: string, opts?: Options) => Promise<Path>;
export declare const createVerifiablePresentation: (context: string, tp: string, path: string, value: unknown) => object;
export declare const verifiablePresentationFromCred: (w3cCred: W3CCredential, requestObj: ProofQuery, field: string, opts?: Options) => Promise<{
    vp: object;
    mzValue: MtValue;
    dataType: string;
    hasher: Hasher;
}>;
