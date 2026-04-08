import { DID } from '@iden3/js-iden3-core';
import { ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from '../../iden3comm';
import { IProofStorage } from '../interfaces';
export declare class InMemoryProofStorage implements IProofStorage {
    private readonly _cache;
    constructor(options?: {
        ttl?: number;
        maxSize?: number;
    });
    getProof(profileDID: DID, credentialId: string, request: ZeroKnowledgeProofRequest): Promise<ZeroKnowledgeProofResponse | undefined>;
    storeProof(profileDID: DID, credentialId: string, request: ZeroKnowledgeProofRequest, response: ZeroKnowledgeProofResponse): Promise<void>;
    removeProof(profileDID: DID, credentialId: string, request: ZeroKnowledgeProofRequest): Promise<void>;
}
//# sourceMappingURL=proof-storage.d.ts.map