import { W3CCredential, ProofQuery } from '../../verifiable';
/**
 * search errors
 *
 * @enum {number}
 */
export declare enum SearchError {
    NotDefinedQueryKey = "not defined query key",
    NotDefinedComparator = "not defined comparator"
}
/** allowed operators to search */
export type FilterOperatorMethod = '$noop' | '$eq' | '$in' | '$nin' | '$gt' | '$lt' | '$ne';
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
export declare const comparatorOptions: {
    [v in FilterOperatorMethod]: FilterOperatorFunction;
};
/**
 * credential search path resolver
 *
 * @param {object} object - object to query
 * @param {string} path - given path
 * @param {*} [defaultValue=null]
 */
export declare const resolvePath: (object: object, path: string, defaultValue?: null) => object | null;
/**
 * Filter for queries of credentialSubject with a json path e.g  birthday.date
 *
 *
 * @public
 * @class FilterQuery
 * @implements implements IFilterQuery interface
 */
export declare class FilterQuery implements IFilterQuery {
    path: string;
    operatorFunc: FilterOperatorFunction;
    value: any;
    isReverseParams: boolean;
    /**
     * Creates an instance of FilterQuery.
     * @param {string} path
     * @param {FilterOperatorFunction} operatorFunc
     * @param {*} value
     * @param {boolean} [isReverseParams=false]
     */
    constructor(path: string, operatorFunc: FilterOperatorFunction, value: any, isReverseParams?: boolean);
    /** {@inheritdoc IFilterQuery} */
    execute(credential: W3CCredential): boolean;
}
/**
 * creates filters based on proof query
 * @param {ProofQuery} query - proof query
 * @returns {*}  {FilterQuery[]} - array of filters to apply
 */
export declare const StandardJSONCredentialsQueryFilter: (query: ProofQuery) => FilterQuery[];
