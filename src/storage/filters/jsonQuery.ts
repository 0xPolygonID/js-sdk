/* eslint-disable @typescript-eslint/no-explicit-any */
import { W3CCredential, ProofQuery } from '../../verifiable';

/**
 * search errors
 *
 * @enum {number}
 */
export enum SearchError {
  NotDefinedQueryKey = 'not defined query key',
  NotDefinedComparator = 'not defined comparator'
}

/** allowed operators to search */
export type FilterOperatorMethod =
  | '$noop'
  | '$eq'
  | '$in'
  | '$nin'
  | '$gt'
  | '$lt'
  | '$ne'
  | '$gte'
  | '$lte'
  | '$sd';

/** filter function type */
export type FilterOperatorFunction = (a: any, b: any) => boolean;

/**
 * query filter interface that allows to query Verifiable Credential
 *
 * @public
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
type ComparableType = number | string | boolean;
const equalsComparator = (
  a: ComparableType | Array<ComparableType>,
  b: ComparableType | Array<ComparableType>
) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      a.length === b.length && a.every((val, index) => val === (b as Array<ComparableType>)[index])
    );
  }

  if (!Array.isArray(a) && Array.isArray(b)) {
    return b.includes(a);
  }

  if (Array.isArray(a) && !Array.isArray(b)) {
    return a.includes(b);
  }

  a = a as ComparableType;
  b = b as ComparableType;
  if (truthyValues.includes(a) && truthyValues.includes(b)) {
    return true;
  }

  if (falsyValues.includes(a) && falsyValues.includes(b)) {
    return true;
  }

  return a === b;
};

const greaterThan = (
  a: ComparableType | ComparableType[],
  b: ComparableType | ComparableType[]
) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((val, index) => val > (b as ComparableType[])[index]);
  }
  if (!Array.isArray(a) && Array.isArray(b)) {
    return b.every((val) => a > val);
  }
  if (Array.isArray(a) && !Array.isArray(b)) {
    return a.every((val) => val > b);
  }
  return a > b;
};

const greaterThanOrEqual = (
  a: ComparableType | ComparableType[],
  b: ComparableType | ComparableType[]
) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((val, index) => val >= (b as ComparableType[])[index]);
  }
  if (!Array.isArray(a) && Array.isArray(b)) {
    return b.every((val) => a >= val);
  }
  if (Array.isArray(a) && !Array.isArray(b)) {
    return a.every((val) => val >= b);
  }
  return a >= b;
};

const lessThanOrEqual = (
  a: ComparableType | ComparableType[],
  b: ComparableType | ComparableType[]
) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((val, index) => val <= (b as ComparableType[])[index]);
  }
  if (!Array.isArray(a) && Array.isArray(b)) {
    return b.every((val) => a <= val);
  }
  if (Array.isArray(a) && !Array.isArray(b)) {
    return a.every((val) => val <= b);
  }
  return a <= b;
};

const inOperator = (a: ComparableType | ComparableType[], b: ComparableType | ComparableType[]) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((val) => b.includes(val));
  }
  if (!Array.isArray(a) && Array.isArray(b)) {
    return b.includes(a);
  }
  if (Array.isArray(a) && !Array.isArray(b)) {
    return a.includes(b);
  }
  return false;
};

export const comparatorOptions: { [v in FilterOperatorMethod]: FilterOperatorFunction } = {
  $noop: () => true,
  $sd: () => true,
  $eq: (a, b) => equalsComparator(a, b),
  $in: (a: ComparableType | ComparableType[], b: ComparableType | ComparableType[]) =>
    inOperator(a, b),
  $nin: (a: ComparableType | ComparableType[], b: ComparableType | ComparableType[]) =>
    !inOperator(a, b),
  $gt: (a: ComparableType | ComparableType[], b: ComparableType | ComparableType[]) =>
    greaterThan(a, b),
  $lt: (a: ComparableType | ComparableType[], b: ComparableType | ComparableType[]) =>
    !greaterThan(a, b),
  $ne: (a, b) => !equalsComparator(a, b),
  $gte: (a: ComparableType | ComparableType[], b: ComparableType | ComparableType[]) =>
    greaterThanOrEqual(a, b),
  $lte: (a: ComparableType | ComparableType[], b: ComparableType | ComparableType[]) =>
    lessThanOrEqual(a, b)
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
 * @public
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryValue: any = query[queryKey as keyof typeof query];
    switch (queryKey) {
      case 'claimId':
        return acc.concat(new FilterQuery('id', comparatorOptions.$eq, queryValue));
      case 'allowedIssuers': {
        const queryValueParam = queryValue || ['*'];
        if (queryValueParam.includes('*')) {
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
      case 'proofType':
      case 'groupId':
      case 'skipClaimRevocationCheck': {
        return acc;
      }
      default:
        throw new Error(`${queryKey} : ${SearchError.NotDefinedQueryKey}`);
    }
  }, []);
};
