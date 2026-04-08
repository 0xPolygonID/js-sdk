import { Id, DID } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';
import { VerificationMethod, DIDResolutionMetadata } from 'did-resolver';
/**
 * Supported DID Document Signatures
 */
export declare enum DIDDocumentSignature {
    EthereumEip712Signature2021 = "EthereumEip712Signature2021"
}
/**
 * Checks if state is genesis state
 *
 * @param {DID} did - did
 * @param {bigint|string} state  - hash on bigInt or hex string format
 * @returns boolean
 */
export declare function isGenesisState(did: DID, state: bigint | string): boolean;
/**
 * Checks if state is genesis state by id
 *
 * @param {Id} id - id
 * @param {bigint} state  - hash as bigint
 * @returns boolean
 */
export declare function getIsGenesisStateById(id: Id, state: bigint): boolean;
/**
 * Checks if DID is an ethereum identity
 *
 * @param {DID} did - did
 * @returns boolean
 */
export declare function isEthereumIdentity(did: DID): boolean;
export declare const buildVerifierId: (address: string, info: {
    method: string;
    blockchain: string;
    networkId: string;
}) => Id;
export declare const validateDIDDocumentAuth: (did: DID, resolverURL: string, state: Hash) => Promise<void>;
export declare const resolveDIDDocumentAuth: (did: DID, resolveURL: string, state?: Hash) => Promise<VerificationMethod | undefined>;
export declare const resolveDidDocument: (did: DID, resolverUrl: string, opts?: {
    state?: Hash;
    gist?: Hash;
    signature?: DIDDocumentSignature;
}) => Promise<DIDResolutionMetadata>;
export declare const buildDIDFromEthPubKey: (didType: Uint8Array, pubKeyEth: string) => DID;
export declare const buildDIDFromEthAddress: (didType: Uint8Array, ethAddress: string) => DID;
export declare const getChallengeFromEthAddress: (address: string) => bigint;
//# sourceMappingURL=did-helper.d.ts.map