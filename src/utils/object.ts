/**
 * Merges two objects together, prioritizing the properties of the second object.
 * If a property exists in both objects, the value from the second object will be used.
 * @param credSubject - The first object to merge.
 * @param otherCredSubject - The second object to merge.
 * @returns A new object with the merged properties.
 */
type obj = { [k: string]: unknown };

export function mergeObjects(credSubject: obj, otherCredSubject: obj) {
  let result = {} as obj;
  const credSubjectKeys = Object.keys(credSubject);

  for (const key of credSubjectKeys) {
    if (typeof otherCredSubject[key] !== 'undefined') {
      if (typeof credSubject[key] !== 'object' && typeof otherCredSubject[key] !== 'object') {
        throw new Error('Invalid query');
      }
      const subjectProperty = credSubject[key] as obj;
      const otherSubjectProperty = otherCredSubject[key] as obj;
      const propertyOperators = Object.keys(subjectProperty);
      const subjectPropertyResult: obj = {};
      for (const operatorKey of propertyOperators) {
        if (typeof otherSubjectProperty[operatorKey] !== 'undefined') {
          const operatorValue1 = subjectProperty[operatorKey] as obj;
          const operatorValue2 = otherSubjectProperty[operatorKey];
          subjectPropertyResult[operatorKey] = [
            ...new Set([
              ...((subjectPropertyResult[operatorKey] as Array<obj>) ?? []),
              operatorValue1,
              ...(Array.isArray(operatorValue2) ? operatorValue2 : [operatorValue2])
            ])
          ];
        } else {
          subjectPropertyResult[operatorKey] = subjectProperty[operatorKey];
        }
      }
      result[key] = {
        ...(otherCredSubject[key] as obj),
        ...subjectPropertyResult
      };
    }
  }

  // Add remaining keys from obj2
  result = { ...credSubject, ...otherCredSubject, ...result };
  return result;
}
