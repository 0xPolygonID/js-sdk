/**
 * Represents the XSD namespace and its corresponding data types.
 */
export declare enum XSDNS {
    Boolean = "http://www.w3.org/2001/XMLSchema#boolean",
    Integer = "http://www.w3.org/2001/XMLSchema#integer",
    NonNegativeInteger = "http://www.w3.org/2001/XMLSchema#nonNegativeInteger",
    NonPositiveInteger = "http://www.w3.org/2001/XMLSchema#nonPositiveInteger",
    NegativeInteger = "http://www.w3.org/2001/XMLSchema#negativeInteger",
    PositiveInteger = "http://www.w3.org/2001/XMLSchema#positiveInteger",
    DateTime = "http://www.w3.org/2001/XMLSchema#dateTime",
    Double = "http://www.w3.org/2001/XMLSchema#double",
    String = "http://www.w3.org/2001/XMLSchema#string"
}
/**
 * List of available operators.
 *
 * @enum {number}
 */
export declare enum Operators {
    NOOP = 0,// No operation, skip query verification in circuit
    EQ = 1,
    LT = 2,
    GT = 3,
    IN = 4,
    NIN = 5,
    NE = 6,
    LTE = 7,
    GTE = 8,
    BETWEEN = 9,
    NONBETWEEN = 10,
    EXISTS = 11,
    SD = 16,
    NULLIFY = 17
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
    $lte: Operators;
    $gte: Operators;
    $between: Operators;
    $nonbetween: Operators;
    $exists: Operators;
    $sd: Operators;
    $nullify: Operators;
};
export declare const getOperatorNameByValue: (operator: number) => string;
export declare const availableTypesOperators: Map<string, Operators[]>;
/**
 * Checks if the given operation is valid for the specified datatype.
 * @param datatype - The datatype to check the operation for.
 * @param op - The operation to check.
 * @returns True if the operation is valid, false otherwise.
 */
export declare const isValidOperation: (datatype: string, op: number) => boolean;
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
//# sourceMappingURL=comparer.d.ts.map