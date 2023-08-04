"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardJSONCredentialsQueryFilter = exports.FilterQuery = exports.resolvePath = exports.comparatorOptions = exports.SearchError = void 0;
/**
 * search errors
 *
 * @enum {number}
 */
var SearchError;
(function (SearchError) {
    SearchError["NotDefinedQueryKey"] = "not defined query key";
    SearchError["NotDefinedComparator"] = "not defined comparator";
})(SearchError = exports.SearchError || (exports.SearchError = {}));
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
exports.comparatorOptions = {
    $noop: () => true,
    $eq: (a, b) => equalsComparator(a, b),
    $in: (a, b) => b.includes(a),
    $nin: (a, b) => !b.includes(a),
    $gt: (a, b) => a > b,
    $lt: (a, b) => a < b,
    $ne: (a, b) => !equalsComparator(a, b)
};
/**
 * credential search path resolver
 *
 * @param {object} object - object to query
 * @param {string} path - given path
 * @param {*} [defaultValue=null]
 */
const resolvePath = (object, path, defaultValue = null) => {
    const pathParts = path.split('.');
    let o = object;
    for (const part of pathParts) {
        if (o === null || o === undefined) {
            return defaultValue;
        }
        o = o[part];
    }
    return o;
};
exports.resolvePath = resolvePath;
/**
 * Filter for queries of credentialSubject with a json path e.g  birthday.date
 *
 *
 * @public
 * @class FilterQuery
 * @implements implements IFilterQuery interface
 */
class FilterQuery {
    /**
     * Creates an instance of FilterQuery.
     * @param {string} path
     * @param {FilterOperatorFunction} operatorFunc
     * @param {*} value
     * @param {boolean} [isReverseParams=false]
     */
    constructor(path, operatorFunc, value, isReverseParams = false) {
        this.path = path;
        this.operatorFunc = operatorFunc;
        this.value = value;
        this.isReverseParams = isReverseParams;
    }
    /** {@inheritdoc IFilterQuery} */
    execute(credential) {
        if (!this.operatorFunc) {
            throw new Error(SearchError.NotDefinedComparator);
        }
        const credentialPathValue = (0, exports.resolvePath)(credential, this.path);
        if (credentialPathValue === null || credentialPathValue === undefined) {
            return false;
        }
        if (this.isReverseParams) {
            return this.operatorFunc(this.value, credentialPathValue);
        }
        return this.operatorFunc(credentialPathValue, this.value);
    }
}
exports.FilterQuery = FilterQuery;
/**
 * creates filters based on proof query
 * @param {ProofQuery} query - proof query
 * @returns {*}  {FilterQuery[]} - array of filters to apply
 */
const StandardJSONCredentialsQueryFilter = (query) => {
    return Object.keys(query).reduce((acc, queryKey) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryValue = query[queryKey];
        switch (queryKey) {
            case 'claimId':
                return acc.concat(new FilterQuery('id', exports.comparatorOptions.$eq, queryValue));
            case 'allowedIssuers': {
                const [first] = queryValue || [];
                if (first && first === '*') {
                    return acc;
                }
                return acc.concat(new FilterQuery('issuer', exports.comparatorOptions.$in, queryValue));
            }
            case 'type':
                return acc.concat(new FilterQuery('type', exports.comparatorOptions.$in, queryValue, true));
            case 'context':
                return acc.concat(new FilterQuery('@context', exports.comparatorOptions.$in, queryValue, true));
            case 'credentialSubjectId':
                return acc.concat(new FilterQuery('credentialSubject.id', exports.comparatorOptions.$eq, queryValue));
            case 'schema':
                return acc.concat(new FilterQuery('credentialSchema.id', exports.comparatorOptions.$eq, queryValue));
            case 'skipClaimRevocationCheck':
                return acc;
            case 'credentialSubject': {
                const reqFilters = Object.keys(queryValue).reduce((acc, fieldKey) => {
                    const fieldParams = queryValue[fieldKey];
                    if (typeof fieldParams === 'object' && Object.keys(fieldParams).length === 0) {
                        return acc.concat([
                            new FilterQuery(`credentialSubject.${fieldKey}`, exports.comparatorOptions.$noop, null)
                        ]);
                    }
                    const res = Object.keys(fieldParams).map((comparator) => {
                        const value = fieldParams[comparator];
                        const path = `credentialSubject.${fieldKey}`;
                        return new FilterQuery(path, exports.comparatorOptions[comparator], value);
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
exports.StandardJSONCredentialsQueryFilter = StandardJSONCredentialsQueryFilter;
//# sourceMappingURL=jsonQuery.js.map