/**
 * Merges two objects together, prioritizing the properties of the second object.
 * If a property exists in both objects, the value from the second object will be used.
 * @param credSubject - The first object to merge.
 * @param otherCredSubject - The second object to merge.
 * @returns A new object with the merged properties.
 */
import { JsonDocumentObject } from '../iden3comm';
export declare function mergeObjects(credSubject?: JsonDocumentObject | undefined, otherCredSubject?: JsonDocumentObject | undefined): JsonDocumentObject;
//# sourceMappingURL=object.d.ts.map