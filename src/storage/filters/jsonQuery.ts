import { W3CCredential, ProofQuery } from '../../verifiable';

export enum SearchError {
  NotDefinedQueryKey = 'not defined query key',
  NotDefinedComparator = 'not defined comparator'
}

export type FilterOperatorMethod = '$noop' | '$eq' | '$in' | '$nin' | '$gt' | '$lt';

export type FilterOperatorFunction = (a, b) => boolean;

export interface IFilterQuery {
  execute(credential: W3CCredential): boolean;
}

export const comparatorOptions: { [v in FilterOperatorMethod]: FilterOperatorFunction } = {
  $noop: () => true,
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

export class FilterQuery implements IFilterQuery {
  constructor(
    public path: string,
    public operatorFunc: FilterOperatorFunction,
    public value,
    public isReverseParams = false
  ) {}
  execute(credential: W3CCredential): boolean {
    if (!this.operatorFunc) {
      throw new Error(SearchError.NotDefinedComparator);
    }
    const credentialPathValue = resolvePath(credential, this.path);
    if (!credentialPathValue) {
      return false;
    }
    if (this.isReverseParams) {
      return this.operatorFunc(this.value, credentialPathValue);
    }
    return this.operatorFunc(credentialPathValue, this.value);
  }
}

export const StandardJSONCredentialsQueryFilter = (query: ProofQuery): FilterQuery[] => {
  return Object.keys(query).reduce((acc: FilterQuery[], queryKey) => {
    const queryValue = query[queryKey];
    switch (queryKey) {
      case 'claimId':
        return acc.concat(new FilterQuery('id', comparatorOptions.$eq, queryValue));
      case 'allowedIssuers': {
        const [first] = queryValue || [];
        if (first && first === '*') {
          return acc;
        }
        return acc.concat(new FilterQuery('issuer', comparatorOptions.$in, queryValue));
      }
      case 'type':
        return acc.concat(new FilterQuery('type', comparatorOptions.$in, queryValue, true));
      case 'context':
        return acc.concat(new FilterQuery('@context', comparatorOptions.$in, queryValue, true));
      case 'credentialSubjectId':
        return acc.concat(
          new FilterQuery('credentialSubject.id', comparatorOptions.$eq, queryValue)
        );
      case 'schema':
        return acc.concat(
          new FilterQuery('credentialSchema.id', comparatorOptions.$eq, queryValue)
        );
      case 'req': {
        const reqFilters = Object.keys(queryValue).reduce((acc: FilterQuery[], fieldKey) => {
          const fieldParams = queryValue[fieldKey];
          const res = Object.keys(fieldParams).map((comparator) => {
            const value = fieldParams[comparator];
            const path = `credentialSubject.${fieldKey}`;
            return new FilterQuery(path, comparatorOptions[comparator], value);
          });
          return acc.concat(res);
        }, []);

        return acc.concat(reqFilters);
      }
      default:
        throw new Error(SearchError.NotDefinedQueryKey);
    }
  }, []);
};
