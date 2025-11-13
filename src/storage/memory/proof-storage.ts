import { ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from '../../iden3comm';
import { DEFAULT_PROOF_VERIFY_DELAY } from '../../iden3comm/constants';
import { IProofStorage } from '../interfaces';
import { CACHE_KEY_VERSION, createZkpRequestCacheKey } from '../utils';
import { createInMemoryCache } from './cache-lru';

export class InMemoryProofStorage implements IProofStorage {
  private readonly _cache;
  constructor(options?: { ttl?: number; maxSize?: number }) {
    const ttl = options?.ttl ?? DEFAULT_PROOF_VERIFY_DELAY;
    const maxSize = options?.maxSize ?? 1000;
    this._cache = createInMemoryCache<ZeroKnowledgeProofResponse>({ maxSize, ttl });
  }
  getProof(
    credentialId: string,
    request: ZeroKnowledgeProofRequest
  ): Promise<ZeroKnowledgeProofResponse | undefined> {
    return this._cache.get(createZkpRequestCacheKey(CACHE_KEY_VERSION.V1, request, credentialId));
  }
  storeProof(
    credentialId: string,
    request: ZeroKnowledgeProofRequest,
    response: ZeroKnowledgeProofResponse
  ): Promise<void> {
    return this._cache.set(
      createZkpRequestCacheKey(CACHE_KEY_VERSION.V1, request, credentialId),
      response
    );
  }
}
