export declare const byteEncoder: TextEncoder;
export declare const byteDecoder: TextDecoder;
export declare function bytesToBase64url(b: Uint8Array, opts?: {
    pad: boolean;
}): string;
export declare function base64ToBytes(s: string, opts?: {
    loose: boolean;
}): Uint8Array;
export declare function bytesToBase64(b: Uint8Array, opts?: {
    pad: boolean;
}): string;
export declare function base64UrlToBytes(s: string, opts?: {
    loose: boolean;
}): Uint8Array;
export declare function base58ToBytes(s: string): Uint8Array;
export declare function bytesToBase58(b: Uint8Array): string;
export declare function hexToBytes(s: string): Uint8Array;
export declare function encodeBase64url(s: string, opts?: {
    pad: boolean;
}): string;
export declare function decodeBase64url(s: string, opts?: {
    loose: boolean;
}): string;
export declare function bytesToHex(b: Uint8Array): string;
//# sourceMappingURL=encoding.d.ts.map