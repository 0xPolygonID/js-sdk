import { getRandomBytes } from '@iden3/js-crypto';
import { JSONObject, ZeroKnowledgeProofRequest } from '../types';
import { mergeObjects } from '../../utils';

export const findCombinedQueries = (
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
