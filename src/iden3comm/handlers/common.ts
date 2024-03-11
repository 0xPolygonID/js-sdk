import { getRandomBytes } from '@iden3/js-crypto';
import {
  BasicMessage,
  JSONObject,
  ZeroKnowledgeProofRequest,
  ZeroKnowledgeProofResponse
} from '../types';
import { mergeObjects } from '../../utils';
import { RevocationStatus, W3CCredential } from '../../verifiable';
import { DID } from '@iden3/js-iden3-core';
import { IProofService } from '../../proof';
import { CircuitId } from '../../circuits';

/**
 * Groups the ZeroKnowledgeProofRequest objects based on their groupId.
 * Returns a Map where the key is the groupId and the value is an object containing the query and linkNonce.
 *
 * @param requestScope - An array of ZeroKnowledgeProofRequest objects.
 * @returns A Map<number, { query: JSONObject; linkNonce: number }> representing the grouped queries.
 */
export const getGroupedQueries = (
  requestScope: ZeroKnowledgeProofRequest[]
): Map<number, { query: JSONObject; linkNonce: number }> =>
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
      existedData.query.credentialSubject as JSONObject,
      proofReq.query.credentialSubject as JSONObject
    );

    acc.set(groupId, {
      ...existedData,
      query: {
        skipClaimRevocationCheck:
          existedData.query.skipClaimRevocationCheck || proofReq.query.skipClaimRevocationCheck,
        ...(existedData.query as JSONObject),
        credentialSubject
      }
    });

    return acc;
  }, new Map<number, { query: JSONObject; linkNonce: number }>());

/**
 * Processes protocol requests and generates zero-knowledge proof responses.
 *
 * @param senderIdentifier - The DID identifier.
 * @param request - protocol message.
 * @param opts - additional options.  verifierDid is the DID of the verifier.
 * @param opts.allowedCircuits - allowedCircuits is a list of allowed circuits.
 * @param opts.verifierDid - verifierDid is the DID of the verifier.
 * @returns A promise that resolves to an array of zero-knowledge proof responses.
 */
export const processProtocolRequests = async (
  senderIdentifier: DID,
  request: BasicMessage,
  proofService: IProofService,
  opts: { allowedCircuits: CircuitId[]; verifierDid?: DID }
): Promise<ZeroKnowledgeProofResponse[]> => {
  const requestScope = request.body?.scope ?? [];

  const combinedQueries = getGroupedQueries(requestScope);

  const groupedCredentialsCache = new Map<
    number,
    { cred: W3CCredential; revStatus?: RevocationStatus }
  >();

  const zkpResponses = [];

  for (const proofReq of requestScope) {
    if (!opts.allowedCircuits.includes(proofReq.circuitId as CircuitId)) {
      throw new Error(`Circuit ${proofReq.circuitId} is not allowed`);
    }

    let verifierDid: DID;

    if (opts.verifierDid) {
      verifierDid = opts.verifierDid;
    } else {
      if (!request.from) {
        throw new Error('please provide verifier DID');
      }
      verifierDid = DID.parse(request.from);
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
          senderIdentifier,
          combinedQueryData.query
        );
        if (!credWithRevStatus.cred) {
          throw new Error(`Credential not found for query ${JSON.stringify(combinedQuery)}`);
        }

        groupedCredentialsCache.set(groupId, credWithRevStatus);
      }
    }

    const credWithRevStatus = groupedCredentialsCache.get(groupId as number);

    const zkpRes: ZeroKnowledgeProofResponse = await proofService.generateProof(
      proofReq,
      senderIdentifier,
      {
        verifierDid,
        skipRevocation: Boolean(query.skipClaimRevocationCheck),
        credential: credWithRevStatus?.cred,
        credentialRevocationStatus: credWithRevStatus?.revStatus,
        linkNonce: combinedQueryData?.linkNonce ? BigInt(combinedQueryData.linkNonce) : undefined
      }
    );

    zkpResponses.push(zkpRes);
  }

  return zkpResponses;
};
