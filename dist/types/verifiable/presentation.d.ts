import { Options, Path } from '@iden3/js-jsonld-merklization';
import { W3CCredential } from './credential';
import { QueryMetadata } from '../proof';
import { VerifiablePresentation, JsonDocumentObject } from '../iden3comm';
export declare const stringByPath: (obj: {
    [key: string]: unknown;
}, path: string) => string;
export declare const buildFieldPath: (ldSchema: string, contextType: string, field: string, opts?: Options) => Promise<Path>;
export declare const findValue: (fieldName: string, credential: W3CCredential) => JsonDocumentObject;
export declare const createVerifiablePresentation: (context: string, tp: string, credential: W3CCredential, queries: QueryMetadata[]) => VerifiablePresentation;
//# sourceMappingURL=presentation.d.ts.map