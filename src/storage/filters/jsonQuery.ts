import { W3CCredential, ProofQuery } from '../../verifiable';

export enum SearchError {
  NotDefinedQueryKey = 'not defined query key',
  NotDefinedComparator = 'not defined comparator'
}

export const comparatorOptions = {
  // todo check $noop operator
  $noop: (a, b) => true,
  $eq: (a, b) => a === b,
  $in: (a: string, b: string[]) => b.includes(a),
  $nin: (a: string, b: string[]) => !b.includes(a),
  $gt: (a: number, b: number) => a > b,
  $lt: (a: number, b: number) => a < b
};

export const resolvePath = (object: object, path: string, defaultValue = null) =>
  path.split('.').reduce((o, p) => (o ? o[p] : defaultValue), object);

export const createFilter = (path: string, operatorFunc, value, isReverseParams = false) => {
  if (!operatorFunc) {
    throw new Error(SearchError.NotDefinedComparator);
  }
  return (credential: W3CCredential): boolean => {
    const credentialPathValue = resolvePath(credential, path);
    if (!credentialPathValue) {
      return false;
      // throw new Error(`Not found path - ${path} to credential`);
    }
    if (isReverseParams) {
      return operatorFunc(value, credentialPathValue);
    }
    return operatorFunc(credentialPathValue, value);
  };
};

export const StandardJSONCredentielsQueryFilter = (query: ProofQuery) => {
  return Object.keys(query).reduce((acc, queryKey) => {
    const queryValue = query[queryKey];
    switch (queryKey) {
      case 'claimId':
        return acc.concat(createFilter('id', comparatorOptions.$eq, queryValue));
      case 'allowedIssuers':
        const [first] = queryValue || [];
        if (first && first === '*') {
          return acc;
        }
        return acc.concat(createFilter('issuer', comparatorOptions.$in, queryValue));
      case 'type':
        return acc.concat(createFilter('type', comparatorOptions.$in, queryValue, true));
      case 'context':
        return acc.concat(createFilter('@context', comparatorOptions.$in, queryValue, true));
      case 'credentialSubjectId':
          return acc.concat(createFilter('credentialSubject.id', comparatorOptions.$eq, queryValue));
      case 'schema':
        return acc.concat(createFilter('credentialSchema.id', comparatorOptions.$eq, queryValue));
      case 'req':
        const reqFilters = Object.keys(queryValue).reduce((acc, fieldKey) => {
          const fieldParams = queryValue[fieldKey];
          const res = Object.keys(fieldParams).map((comparator) => {
            const value = fieldParams[comparator];
            return createFilter(
              `credentialSubject.${fieldKey}`,
              comparatorOptions[comparator],
              value
            );
          });
          return acc.concat(res);
        }, []);

        return acc.concat(reqFilters);
      default:
        throw new Error(SearchError.NotDefinedQueryKey);
    }
  }, []);
};
