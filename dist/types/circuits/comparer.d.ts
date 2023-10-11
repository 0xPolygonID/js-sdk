/**
 * List of available operators.
 *
 * @enum {number}
 */
export declare enum Operators {
    NOOP = 0,
    EQ = 1,
    LT = 2,
    GT = 3,
    IN = 4,
    NIN = 5,
    NE = 6
}
/** QueryOperators represents operators for atomic circuits */
export declare const QueryOperators: {
    $noop: Operators;
    $eq: Operators;
    $lt: Operators;
    $gt: Operators;
    $in: Operators;
    $nin: Operators;
    $ne: Operators;
};
export interface IComparer {
    compare(int: number): boolean;
}
/**
 * Scalar is used to compare two scalar value.
 *
 * @public
 * @class Scalar
 * @implements implements IComparer interface
 */
export declare class Scalar implements IComparer {
    private x;
    private y;
    /**
     * Creates an instance of Scalar.
     * @param {bigint} x - val x
     * @param {bigint} y - val y
     */
    constructor(x: bigint, y: bigint);
    /**
     * compares two  scalar values
     *
     * @param {Operators} operator - EQ / LT / GT
     * @returns boolean
     */
    compare(operator: Operators): boolean;
}
/**
 * Vector uses for find/not find x scalar type in y vector type.
 *
 * @public
 * @class Vector
 * @implements implements IComparer interface
 */
export declare class Vector implements IComparer {
    private x;
    private y;
    /**
     * Creates an instance of Vector.
     * @param {bigint} x - val x
     * @param {bigint[]} y - array values y
     */
    constructor(x: bigint, y: bigint[]);
    /**
     *
     *
     * @param {Operators} operator - IN / NIN
     * @returns boolean
     */
    compare(operator: Operators): boolean;
}
/**
 * FactoryComparer depends on input data will return right comparer.
 *
 * @param {bigint} x - val x
 * @param {bigint[]} y - array of values y
 * @param {Operators} operator - EQ / LT / GT / IN / NIN
 * @returns IComparer
 */
export declare const factoryComparer: (x: bigint, y: bigint[], operator: Operators) => IComparer;
