import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { DocumentLoader } from '@iden3/js-jsonld-merklization';
import { CircuitId } from '../../circuits/models';
import { ProofQuery } from '../../verifiable';
import { QueryMetadata } from '../common';
import { JsonLd } from 'jsonld/jsonld-spec';
import { VerifiablePresentation } from '../../iden3comm';
/**
 * Options to verify state
 */
export type VerifyOpts = {
    acceptedStateTransitionDelay?: number;
    acceptedProofGenerationDelay?: number;
};
export interface ClaimOutputs {
    issuerId: Id;
    schemaHash: SchemaHash;
    slotIndex?: number;
    operator: number;
    operatorOutput?: bigint;
    value: bigint[];
    timestamp: number;
    merklized: number;
    claimPathKey?: bigint;
    claimPathNotExists?: number;
    valueArraySize: number;
    isRevocationChecked: number;
}
export declare function checkQueryRequest(query: ProofQuery, queriesMetadata: QueryMetadata[], ldContext: JsonLd, outputs: ClaimOutputs, circuitId: CircuitId, schemaLoader?: DocumentLoader, opts?: VerifyOpts): Promise<void>;
export declare function checkCircuitQueriesLength(circuitId: CircuitId, queriesMetadata: QueryMetadata[]): void;
export declare function checkCircuitOperator(circuitId: CircuitId, operator: number): void;
export declare function verifyFieldValueInclusionV2(outputs: ClaimOutputs, metadata: QueryMetadata): void;
export declare function verifyFieldValueInclusionNativeExistsSupport(outputs: ClaimOutputs, metadata: QueryMetadata): void;
export declare function validateEmptyCredentialSubjectV2Circuit(cq: QueryMetadata, outputs: ClaimOutputs): Promise<void>;
export declare function validateOperators(cq: QueryMetadata, outputs: ClaimOutputs): Promise<void>;
export declare function validateDisclosureV2Circuit(cq: QueryMetadata, outputs: ClaimOutputs, verifiablePresentation?: VerifiablePresentation, ldLoader?: DocumentLoader): Promise<void>;
export declare function validateDisclosureNativeSDSupport(cq: QueryMetadata, outputs: ClaimOutputs, verifiablePresentation?: VerifiablePresentation, ldLoader?: DocumentLoader): Promise<void>;
export declare function validateEmptyCredentialSubjectNoopNativeSupport(outputs: ClaimOutputs): Promise<void>;
export declare const fieldValueFromVerifiablePresentation: (fieldName: string, verifiablePresentation?: VerifiablePresentation, ldLoader?: DocumentLoader) => Promise<bigint>;
export declare function calculateGroupId(): bigint;
export declare function calculateRequestId(requestParams: string, creatorAddress: string): bigint;
export declare function calculateMultiRequestId(requestIds: bigint[], groupIds: bigint[], creatorAddress: string): bigint;
//# sourceMappingURL=query.d.ts.map