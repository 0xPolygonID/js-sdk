import { AcceptProfile, AuthProof, BasicMessage, IPackageManager, JWSPackerParams, PackerParams, ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse, ZKPPackerParams } from '../types';
import { DID } from '@iden3/js-iden3-core';
import { IProofService } from '../../proof';
import { CircuitId } from '../../circuits';
import { MediaType } from '../constants';
import { Signer } from 'ethers';
import { ProvingMethodAlg } from '@iden3/js-jwz';
import { JWEPackerParams } from '../packers';
/**
 * Union type for handler packer parameters.
 */
export type HandlerPackerParams = JWSPackerParams | JWEPackerParams | ZKPPackerParams | PackerParams;
/**
 * Processes zero knowledge proof requests.
 *
 * @param to - The identifier of the recipient.
 * @param requests - An array of zero knowledge proof requests.
 * @param from - The identifier of the sender.
 * @param proofService - The proof service.
 * @param opts - Additional options for processing the requests.
 * @returns A promise that resolves to an array of zero knowledge proof responses.
 */
export declare const processZeroKnowledgeProofRequests: (to: DID, requests: ZeroKnowledgeProofRequest[] | undefined, from: DID | undefined, proofService: IProofService, opts: {
    mediaType?: MediaType;
    packerOptions?: JWSPackerParams;
    supportedCircuits: CircuitId[];
    ethSigner?: Signer;
    challenge?: bigint;
    bypassProofsCache?: boolean;
    allowExpiredCredentials?: boolean;
}) => Promise<ZeroKnowledgeProofResponse[]>;
/**
 * Processes auth proof requests.
 *
 * @param to - The identifier of the recipient.
 * @param proofService - The proof service.
 * @param opts - Additional options for processing the requests.
 * @returns A promise that resolves to an auth proof response.
 */
export declare const processProofAuth: (to: DID, proofService: IProofService, opts: {
    supportedCircuits: CircuitId[];
    acceptProfile?: AcceptProfile;
    senderAddress: string;
    zkpResponses: ZeroKnowledgeProofResponse[];
}) => Promise<{
    authProof: AuthProof;
}>;
/**
 * Processes a ZeroKnowledgeProofResponse object and prepares it for further use.
 * @param zkProof - The ZeroKnowledgeProofResponse object containing the proof data.
 * @returns An object containing the requestId, zkProofEncoded, and metadata.
 */
export declare const processProofResponse: (zkProof: ZeroKnowledgeProofResponse) => {
    requestId: string | number;
    zkProofEncoded: string;
    metadata: string;
};
/**
 * Calculates the challenge authentication authV2, authV3, authV3-8-32 value.
 * @param senderAddress - The address of the sender.
 * @param zkpResponses - An array of ZeroKnowledgeProofResponse objects.
 * @returns A bigint representing the challenge authentication value.
 */
export declare const calcChallengeAuth: (senderAddress: string, zkpResponses: ZeroKnowledgeProofResponse[]) => bigint;
/**
 * Packs metadata into a string format suitable for encoding in a transaction.
 * @param metas - An array of objects containing key-value pairs to be packed.
 * @returns A string representing the packed metadata.
 */
export declare const packMetadatas: (metas: {
    key: string;
    value: Uint8Array;
}[]) => string;
/**
 * Verifies that the expires_time field of a message is not in the past. Throws an error if it is.
 *
 * @param message - Basic message to verify.
 */
export declare const verifyExpiresTime: (message: BasicMessage) => void;
/**
 * Initializes default packer options based on the media type and provided options.
 * @param mediaType - The media type of the message.
 * @param packerOptions - Optional packer parameters.
 * @param opts - Additional options including proving method algorithm and sender DID.
 * @returns PackerParams
 */
export declare const initDefaultPackerOptions: (mediaType: MediaType, packerOptions?: HandlerPackerParams, opts?: {
    provingMethodAlg?: ProvingMethodAlg;
    senderDID?: DID;
}) => PackerParams;
/**
 * Selects the first supported profile from the provided list of profiles based on the response type and packer manager capabilities.
 *
 * @param responseType
 * @param packerMgr
 * @param profile
 * @returns AcceptProfile
 */
export declare const getFirstSupportedProfile: (responseType: string, packerMgr: IPackageManager, profile?: string[] | undefined) => AcceptProfile;
//# sourceMappingURL=common.d.ts.map