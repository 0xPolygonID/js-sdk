import { getRandomBytes } from '@iden3/js-crypto';
import {
  BasicMessage,
  JsonDocumentObject,
  JWSPackerParams,
  ZeroKnowledgeProofQuery,
  ZeroKnowledgeProofRequest,
  ZeroKnowledgeProofResponse
} from '../types';
import { mergeObjects } from '../../utils';
import { RevocationStatus, W3CCredential } from '../../verifiable';
import { DID, getUnixTimestamp } from '@iden3/js-iden3-core';
import { IProofService } from '../../proof';
import { CircuitId } from '../../circuits';
import { MediaType } from '../constants';
import { Signer } from 'ethers';

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
 * Verifies that the expires_time field of a message is not in the past. Throws an error if it is.
 *
 * @param message - Basic message to verify.
 */
export const verifyExpiresTime = (message: BasicMessage) => {
  if (message?.expires_time && message.expires_time < getUnixTimestamp(new Date())) {
    throw new Error('Message expired');
  }
};
