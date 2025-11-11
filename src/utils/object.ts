/**
 * Merges two objects together, prioritizing the properties of the second object.
 * If a property exists in both objects, the value from the second object will be used.
 * @param credSubject - The first object to merge.
 * @param otherCredSubject - The second object to merge.
 * @returns A new object with the merged properties.
 */

import { JsonDocumentObject } from '../iden3comm';

export function mergeObjects(
  credSubject: JsonDocumentObject,
  otherCredSubject: JsonDocumentObject
) {
  if (!credSubject && otherCredSubject) {
    return otherCredSubject;
  }
  if (!otherCredSubject && credSubject) {
    return credSubject;
  }
  if (!credSubject && !otherCredSubject) {
    return {};
  }
  let result = {} as JsonDocumentObject;
  const credSubjectKeys = Object.keys(credSubject);

  for (const key of credSubjectKeys) {
    if (typeof otherCredSubject[key] !== 'undefined') {
      if (typeof credSubject[key] !== 'object' && typeof otherCredSubject[key] !== 'object') {
        throw new Error('Invalid query');
      }
      const subjectProperty = credSubject[key] as JsonDocumentObject;
      const otherSubjectProperty = otherCredSubject[key] as JsonDocumentObject;
      const propertyOperators = Object.keys(subjectProperty);
      const subjectPropertyResult: JsonDocumentObject = {};
      for (const operatorKey of propertyOperators) {
        if (typeof otherSubjectProperty[operatorKey] !== 'undefined') {
          const operatorValue1 = subjectProperty[operatorKey] as JsonDocumentObject;
          const operatorValue2 = otherSubjectProperty[operatorKey];
          subjectPropertyResult[operatorKey] = [
            ...new Set([
              ...((subjectPropertyResult[operatorKey] as Array<JsonDocumentObject>) ?? []),
              operatorValue1,
              ...(Array.isArray(operatorValue2) ? operatorValue2 : [operatorValue2])
            ])
          ];
        } else {
          subjectPropertyResult[operatorKey] = subjectProperty[operatorKey];
        }
      }
      result[key] = {
        ...(otherCredSubject[key] as JsonDocumentObject),
        ...subjectPropertyResult
      };
    }
  }

  // Add remaining keys from obj2
  result = { ...credSubject, ...otherCredSubject, ...result };
  return result;
}
