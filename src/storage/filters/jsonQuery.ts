import { W3CCredential, ProofQuery } from '../../verifiable';

/**
 * search errors
 *
 * @export
 * @enum {number}
 */
export enum SearchError {
  NotDefinedQueryKey = 'not defined query key',
  NotDefinedComparator = 'not defined comparator'
}

/** allowed operators to search */
export type FilterOperatorMethod = '$noop' | '$eq' | '$in' | '$nin' | '$gt' | '$lt' | '$ne';

/** filter function type */
export type FilterOperatorFunction = (a: any, b: any) => boolean;

/**
 * query filter interface that allows to query Verifiable Credential
 *
 * @export
 * @beta
 * @interface   IFilterQuery
 */
export interface IFilterQuery {
  /**
   * applies filter to verifiable credential
   *
   * @param {W3CCredential} credential - credential to query
   * @returns boolean
   */
  execute(credential: W3CCredential): boolean;
}

const truthyValues = [true, 1, 'true'];
const falsyValues = [false, 0, 'false'];

const equalsComparator = (a, b) => {
  if (truthyValues.includes(a) && truthyValues.includes(b)) {
    return true;
  }
  if (falsyValues.includes(a) && falsyValues.includes(b)) {
    return true;
  }

  return a === b;
};

export /** @type {*}  - filter operators and their functions */
const comparatorOptions: { [v in FilterOperatorMethod]: FilterOperatorFunction } = {
  $noop: () => true,
  $eq: (a, b) => equalsComparator(a, b),
  $in: (a: string, b: string[]) => b.includes(a),
  $nin: (a: string, b: string[]) => !b.includes(a),
  $gt: (a: number, b: number) => a > b,
  $lt: (a: number, b: number) => a < b,
  $ne: (a, b) => !equalsComparator(a, b)
};

/**
 * credential search path resolver
 *
 * @param {object} object - object to query
 * @param {string} path - given path
 * @param {*} [defaultValue=null]
 */
export const resolvePath = (object: object, path: string, defaultValue = null) => {
  const pathParts = path.split('.');
  let o = object;
  for (const part of pathParts) {
    if (o === null || o === undefined) {
      return defaultValue;
    }
    o = o[part as keyof typeof o];
  }
  return o;
};

/**
 * Filter for queries of credentialSubject with a json path e.g  birthday.date
 *
 *
 * @export
 * @beta
 * @class FilterQuery
 * @implements implements IFilterQuery interface
 */
export class FilterQuery implements IFilterQuery {
  /**
   * Creates an instance of FilterQuery.
   * @param {string} path
   * @param {FilterOperatorFunction} operatorFunc
   * @param {*} value
   * @param {boolean} [isReverseParams=false]
   */
  constructor(
    public path: string,
    public operatorFunc: FilterOperatorFunction,
    public value: any,
    public isReverseParams = false
  ) {}
  /** {@inheritdoc IFilterQuery} */
  execute(credential: W3CCredential): boolean {
    if (!this.operatorFunc) {
      throw new Error(SearchError.NotDefinedComparator);
    }
    const credentialPathValue = resolvePath(credential, this.path);
    if (credentialPathValue === null || credentialPathValue === undefined) {
      return false;
    }
    if (this.isReverseParams) {
      return this.operatorFunc(this.value, credentialPathValue);
    }
    return this.operatorFunc(credentialPathValue, this.value);
  }
}

/**
 * creates filters based on proof query
 * @param {ProofQuery} query - proof query
 * @returns {*}  {FilterQuery[]} - array of filters to apply
 */
export const StandardJSONCredentialsQueryFilter = (query: ProofQuery): FilterQuery[] => {
  return Object.keys(query).reduce((acc: FilterQuery[], queryKey) => {
    const queryValue: any = query[queryKey as keyof typeof query];
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
      case 'skipClaimRevocationCheck':
        return acc;
      case 'credentialSubject': {
        const reqFilters = Object.keys(queryValue).reduce((acc: FilterQuery[], fieldKey) => {
          const fieldParams = queryValue[fieldKey];
          if (typeof fieldParams === 'object' && Object.keys(fieldParams).length === 0) {
            return acc.concat([
              new FilterQuery(`credentialSubject.${fieldKey}`, comparatorOptions.$noop, null)
            ]);
          }
          const res = Object.keys(fieldParams).map((comparator) => {
            const value = fieldParams[comparator];
            const path = `credentialSubject.${fieldKey}`;
            return new FilterQuery(
              path,
              comparatorOptions[comparator as keyof typeof comparatorOptions],
              value
            );
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
