/**
 * List of available operators.
 *
 * @export
 * @enum {number}
 */
export enum Operators {
  NOOP = 0, // No operation, skip query verification in circuit
  EQ = 1,
  LT = 2,
  GT = 3,
  IN = 4,
  NIN = 5
}

// QueryOperators represents operators for atomic circuits

 /** @type {*} */
 export const QueryOperators = {
  $noop: Operators.NOOP,
  $eq: Operators.EQ,
  $lt: Operators.LT,
  $gt: Operators.GT,
  $in: Operators.IN,
  $nin: Operators.NIN
};

// Comparer value.
export interface IComparer {
  compare(int: number): boolean;
}

/**
 * Scalar is used to compare two scalar value.
 * 
 * @export
 * @class Scalar
 * @implements {IComparer}
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
   * @returns {*}  {boolean}
   */
  compare(operator: Operators): boolean {
    switch (operator) {
      case Operators.EQ:
        return this.x === this.y;
      case Operators.LT:
        return this.x < this.y;
      case Operators.GT:
        return this.x > this.y;
      default:
        throw new Error('unknown compare type for scalar');
    }
  }
}

/**
 * Vector uses for find/not find x scalar type in y vector type.
 *
 * @export
 * @class Vector
 * @implements {IComparer}
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
   * @returns {*}  {boolean}
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
 * @returns {*}  {IComparer}
 */
 export const factoryComparer = (x: bigint, y: bigint[], operator: Operators): IComparer => {
  switch (operator) {
    case Operators.EQ:
    case Operators.LT:
    case Operators.GT:
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
