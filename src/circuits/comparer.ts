/**
 * Represents the XSD namespace and its corresponding data types.
 */

export enum XSDNS {
  Boolean = 'http://www.w3.org/2001/XMLSchema#boolean',
  Integer = 'http://www.w3.org/2001/XMLSchema#integer',
  NonNegativeInteger = 'http://www.w3.org/2001/XMLSchema#nonNegativeInteger',
  NonPositiveInteger = 'http://www.w3.org/2001/XMLSchema#nonPositiveInteger',
  NegativeInteger = 'http://www.w3.org/2001/XMLSchema#negativeInteger',
  PositiveInteger = 'http://www.w3.org/2001/XMLSchema#positiveInteger',
  DateTime = 'http://www.w3.org/2001/XMLSchema#dateTime',
  Double = 'http://www.w3.org/2001/XMLSchema#double',
  String = 'http://www.w3.org/2001/XMLSchema#string'
}

/**
 * List of available operators.
 *
 * @enum {number}
 */
export enum Operators {
  NOOP = 0, // No operation, skip query verification in circuit
  EQ = 1,
  LT = 2,
  GT = 3,
  IN = 4,
  NIN = 5,
  NE = 6,
  LTE = 7,
  GTE = 8,
  BETWEEN = 9,
  SD = 16,
  NULLIFY = 17
}

/** QueryOperators represents operators for atomic circuits */
export const QueryOperators = {
  $noop: Operators.NOOP,
  $eq: Operators.EQ,
  $lt: Operators.LT,
  $gt: Operators.GT,
  $in: Operators.IN,
  $nin: Operators.NIN,
  $ne: Operators.NE,
  $lte: Operators.LTE,
  $gte: Operators.GTE,
  $between: Operators.BETWEEN,
  $sd: Operators.SD,
  $nullify: Operators.NULLIFY
};

const allOperations = Object.values(QueryOperators);

export const availableTypesOperators: Map<string, Operators[]> = new Map([
  [XSDNS.Boolean, [QueryOperators.$eq, QueryOperators.$ne, QueryOperators.$sd]],
  [XSDNS.Integer, allOperations],
  [XSDNS.NonNegativeInteger, allOperations],
  [XSDNS.PositiveInteger, allOperations],
  [
    XSDNS.Double,
    [
      QueryOperators.$eq,
      QueryOperators.$ne,
      QueryOperators.$in,
      QueryOperators.$nin,
      QueryOperators.$sd
    ]
  ],
  [
    XSDNS.String,
    [
      QueryOperators.$eq,
      QueryOperators.$ne,
      QueryOperators.$in,
      QueryOperators.$nin,
      QueryOperators.$sd
    ]
  ],
  [XSDNS.DateTime, allOperations]
]);

/**
 * Checks if the given operation is valid for the specified datatype.
 * @param datatype - The datatype to check the operation for.
 * @param op - The operation to check.
 * @returns True if the operation is valid, false otherwise.
 */
export const isValidOperation = (datatype: string, op: number): boolean => {
  if (op === Operators.NOOP) {
    return true;
  }

  if (!availableTypesOperators.has(datatype)) {
    return false;
  }
  const ops = availableTypesOperators.get(datatype);
  if (!ops) {
    return false;
  }
  return ops.includes(op);
};

// Comparer value.
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
export class Scalar implements IComparer {
  /**
   * Creates an instance of Scalar.
   * @param {bigint} x - val x
   * @param {bigint} y - val y
   */
  constructor(private x: bigint, private y: bigint) {}
  /**
   * compares two  scalar values
   *
   * @param {Operators} operator - EQ / LT / GT
   * @returns boolean
   */
  compare(operator: Operators): boolean {
    switch (operator) {
      case Operators.EQ:
        return this.x === this.y;
      case Operators.LT:
        return this.x < this.y;
      case Operators.GT:
        return this.x > this.y;
      case Operators.NE:
        return this.x !== this.y;
      default:
        throw new Error('unknown compare type for scalar');
    }
  }
}

/**
 * Vector uses for find/not find x scalar type in y vector type.
 *
 * @public
 * @class Vector
 * @implements implements IComparer interface
 */
export class Vector implements IComparer {
  /**
   * Creates an instance of Vector.
   * @param {bigint} x - val x
   * @param {bigint[]} y - array values y
   */
  constructor(private x: bigint, private y: bigint[]) {}
  /**
   *
   *
   * @param {Operators} operator - IN / NIN
   * @returns boolean
   */
  compare(operator: Operators): boolean {
    switch (operator) {
      case Operators.IN:
        return this.y.includes(this.x);
      case Operators.NIN:
        return !this.y.includes(this.x);
      default:
        throw new Error('unknown compare type for vector');
    }
  }
}

/**
 * FactoryComparer depends on input data will return right comparer.
 *
 * @param {bigint} x - val x
 * @param {bigint[]} y - array of values y
 * @param {Operators} operator - EQ / LT / GT / IN / NIN
 * @returns IComparer
 */
export const factoryComparer = (x: bigint, y: bigint[], operator: Operators): IComparer => {
  switch (operator) {
    case Operators.EQ:
    case Operators.LT:
    case Operators.GT:
    case Operators.NE:
      if (y.length !== 1) {
        throw new Error('currently we support only one value for scalar comparison');
      }
      return new Scalar(x, y[0]);
    case Operators.IN:
    case Operators.NIN:
      return new Vector(x, y);
    default:
      throw new Error('unknown compare type');
  }
};
