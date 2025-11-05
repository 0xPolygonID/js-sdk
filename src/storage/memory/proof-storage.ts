import { sha256, toUtf8Bytes } from 'ethers';
import {
  JsonDocumentObject,
  ZeroKnowledgeProofRequest,
  ZeroKnowledgeProofResponse
} from '../../iden3comm';
import { DEFAULT_PROOF_VERIFY_DELAY } from '../../iden3comm/constants';
import { IProofStorage } from '../interfaces';
import { createInMemoryCache } from './cache-lru';

export class InMemoryProofStorage implements IProofStorage {
  private readonly _cache;
  constructor(options?: { ttl?: number; maxSize?: number }) {
    const ttl = options?.ttl ?? DEFAULT_PROOF_VERIFY_DELAY;
    const maxSize = options?.maxSize ?? 1000;
    this._cache = createInMemoryCache<ZeroKnowledgeProofResponse>({ maxSize, ttl });
  }
  getProof(request: ZeroKnowledgeProofRequest): Promise<ZeroKnowledgeProofResponse | undefined> {
    return this._cache.get(this.keyFromZKPRequest(request));
  }
  storeProof(
    request: ZeroKnowledgeProofRequest,
    response: ZeroKnowledgeProofResponse
  ): Promise<void> {
    return this._cache.set(this.keyFromZKPRequest(request), response);
  }

  private keyFromZKPRequest = (r: ZeroKnowledgeProofRequest) => {
    const cs = r.query.credentialSubject
      ? Object.keys(r.query.credentialSubject)
          .sort()
          .map(
            (k) => `${k}:${JSON.stringify((r.query.credentialSubject as JsonDocumentObject)[k])}`
          )
          .join('|')
      : '';
    const s =
      `id=${r.id}|circuit=${r.circuitId}|opt=${!!r.optional}|` +
      `ctx=${r.query.context}|type=${r.query.type}|proofType=${r.query.proofType ?? ''}|` +
      `rev=${r.query.skipClaimRevocationCheck ?? ''}|group=${r.query.groupId ?? ''}|` +
      `issuers=[${r.query.allowedIssuers.sort().join(',')}]|` +
      `cs={${cs}}|params=${r.params?.nullifierSessionId ?? ''}`;
    return 'v1:' + sha256(toUtf8Bytes(s));
  };
}
