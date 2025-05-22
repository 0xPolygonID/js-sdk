import { getRandomBytes } from '@iden3/js-crypto';
import {
  AcceptProfile,
  AuthMethod,
  AuthProofResponse,
  BasicMessage,
  JsonDocumentObject,
  JWSPackerParams,
  ZeroKnowledgeProofAuthResponse,
  ZeroKnowledgeProofQuery,
  ZeroKnowledgeProofRequest,
  ZeroKnowledgeProofResponse
} from '../types';
import { bytesToHex, mergeObjects } from '../../utils';
import { RevocationStatus, W3CCredential } from '../../verifiable';
import { BytesHelper, DID, getUnixTimestamp, Id } from '@iden3/js-iden3-core';
import { IProofService } from '../../proof';
import { CircuitId } from '../../circuits';
import { AcceptJwsAlgorithms, defaultAcceptProfile, MediaType } from '../constants';
import { ethers, Signer } from 'ethers';

/**
 * Groups the ZeroKnowledgeProofRequest objects based on their groupId.
 * Returns a Map where the key is the groupId and the value is an object containing the query and linkNonce.
 *
 * @param requestScope - An array of ZeroKnowledgeProofRequest objects.
 * @returns A Map<number, { query: ZeroKnowledgeProofQuery; linkNonce: number }> representing the grouped queries.
 */
const getGroupedQueries = (
  requestScope: ZeroKnowledgeProofRequest[]
): Map<number, { query: ZeroKnowledgeProofQuery; linkNonce: number }> =>
  requestScope.reduce((acc, proofReq) => {
    const groupId = proofReq.query.groupId as number | undefined;
    if (!groupId) {
      return acc;
    }

    const existedData = acc.get(groupId);
    if (!existedData) {
      const seed = getRandomBytes(12);
      const dataView = new DataView(seed.buffer);
      const linkNonce = dataView.getUint32(0);
      acc.set(groupId, { query: proofReq.query, linkNonce });
      return acc;
    }

    const credentialSubject = mergeObjects(
      existedData.query.credentialSubject as JsonDocumentObject,
      proofReq.query.credentialSubject as JsonDocumentObject
    );

    acc.set(groupId, {
      ...existedData,
      query: {
        skipClaimRevocationCheck:
          existedData.query.skipClaimRevocationCheck || proofReq.query.skipClaimRevocationCheck,
        ...existedData.query,
        credentialSubject
      }
    });

    return acc;
  }, new Map<number, { query: ZeroKnowledgeProofQuery; linkNonce: number }>());

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
export const processZeroKnowledgeProofRequests = async (
  to: DID,
  requests: ZeroKnowledgeProofRequest[] | undefined,
  from: DID | undefined,
  proofService: IProofService,
  opts: {
    mediaType?: MediaType;
    packerOptions?: JWSPackerParams;
    supportedCircuits: CircuitId[];
    ethSigner?: Signer;
    challenge?: bigint;
  }
): Promise<ZeroKnowledgeProofResponse[]> => {
  const requestScope = requests ?? [];

  const combinedQueries = getGroupedQueries(requestScope);

  const groupedCredentialsCache = new Map<
    number,
    { cred: W3CCredential; revStatus?: RevocationStatus }
  >();

  const zkpResponses = [];

  for (const proofReq of requestScope) {
    if (!opts.supportedCircuits.includes(proofReq.circuitId as CircuitId)) {
      throw new Error(`Circuit ${proofReq.circuitId} is not allowed`);
    }

    const query = proofReq.query;
    const groupId = query.groupId as number | undefined;
    const combinedQueryData = combinedQueries.get(groupId as number);
    if (groupId) {
      if (!combinedQueryData) {
        throw new Error(`Invalid group id ${query.groupId}`);
      }
      const combinedQuery = combinedQueryData.query;

      if (!groupedCredentialsCache.has(groupId)) {
        const credWithRevStatus = await proofService.findCredentialByProofQuery(
          to,
          combinedQueryData.query
        );
        if (!credWithRevStatus.cred) {
          throw new Error(`Credential not found for query ${JSON.stringify(combinedQuery)}`);
        }

        groupedCredentialsCache.set(groupId, credWithRevStatus);
      }
    }

    const credWithRevStatus = groupedCredentialsCache.get(groupId as number);

    const zkpRes: ZeroKnowledgeProofResponse = await proofService.generateProof(proofReq, to, {
      verifierDid: from,
      challenge: opts.challenge,
      skipRevocation: Boolean(query.skipClaimRevocationCheck),
      credential: credWithRevStatus?.cred,
      credentialRevocationStatus: credWithRevStatus?.revStatus,
      linkNonce: combinedQueryData?.linkNonce ? BigInt(combinedQueryData.linkNonce) : undefined
    });

    zkpResponses.push(zkpRes);
  }

  return zkpResponses;
};

/**
 * Processes auth proof requests.
 *
 * @param to - The identifier of the recipient.
 * @param proofService - The proof service.
 * @param opts - Additional options for processing the requests.
 * @returns A promise that resolves to an auth proof response.
 */
export const processProofAuth = async (
  to: DID,
  proofService: IProofService,
  opts: {
    supportedCircuits: CircuitId[];
    acceptProfile?: AcceptProfile;
    challenge?: bigint;
  }
): Promise<AuthProofResponse> => {
  if (!opts.acceptProfile) {
    opts.acceptProfile = defaultAcceptProfile;
  }

  switch (opts.acceptProfile.env) {
    case MediaType.ZKPMessage:
      if (!opts.acceptProfile.circuits) {
        throw new Error('Circuit not specified in accept profile');
      }

      for (const circuitId of opts.acceptProfile.circuits) {
        if (!opts.supportedCircuits.includes(circuitId as unknown as CircuitId)) {
          throw new Error(`Circuit ${circuitId} is not supported`);
        }

        const zkpRes: ZeroKnowledgeProofAuthResponse = await proofService.generateAuthProof(
          circuitId as unknown as CircuitId,
          to,
          { challenge: opts.challenge, skipRevocation: true }
        );

        const zkProofEncoded = packAuthV2Proof(
          zkpRes.pub_signals,
          zkpRes.proof.pi_a.slice(0, 2),
          [
            [zkpRes.proof.pi_b[0][1], zkpRes.proof.pi_b[0][0]],
            [zkpRes.proof.pi_b[1][1], zkpRes.proof.pi_b[1][0]]
          ],
          zkpRes.proof.pi_c.slice(0, 2)
        );

        return {
          authMethod: AuthMethod.AUTHV2,
          proof: zkProofEncoded
        };
      }
      throw new Error(`No circuit found`);
    case MediaType.SignedMessage:
      if (!opts.acceptProfile.alg || opts.acceptProfile.alg.length === 0) {
        throw new Error('Algorithm not specified');
      }
      if (opts.acceptProfile.alg[0] === AcceptJwsAlgorithms.ES256KR) {
        const ethIdProof = packEthIdentityProof(to);

        return {
          authMethod: AuthMethod.ETH_IDENTITY,
          proof: ethIdProof
        };
      }
      throw new Error(`Algorithm ${opts.acceptProfile.alg[0]} not supported`);
    default:
      throw new Error('Accept env not supported');
  }
};

/**
 * Verifies that the expires_time field of a message is not in the past. Throws an error if it is.
 *
 * @param message - Basic message to verify.
 */
export const verifyExpiresTime = (message: BasicMessage) => {
  if (message?.expires_time && message.expires_time < getUnixTimestamp(new Date())) {
    throw new Error('Message expired');
  }
};

export const packAuthV2Proof = (
  inputs: string[],
  a: string[],
  b: string[][],
  c: string[]
): string => {
  return new ethers.AbiCoder().encode(
    ['uint256[] inputs', 'uint256[2]', 'uint256[2][2]', 'uint256[2]'],
    [inputs, a, b, c]
  );
};

export const packEthIdentityProof = (did: DID): string => {
  return `0x${bytesToHex(BytesHelper.intToBytes(DID.idFromDID(did).bigInt()))}`;
};
