// List of available operators.
export enum Operators {
  NOOP = 0, // No operation, skip query verification in circuit
  EQ = 1,
  LT = 2,
  GT = 3,
  IN = 4,
  NIN = 5,
  NE = 6
}

// QueryOperators represents operators for atomic circuits
export const QueryOperators = {
  $noop: Operators.NOOP,
  $eq: Operators.EQ,
  $lt: Operators.LT,
  $gt: Operators.GT,
  $in: Operators.IN,
  $nin: Operators.NIN,
  $ne: Operators.NE
};

// Comparer value.
export interface IComparer {
  compare(int: number): boolean;
}

// Scalar uses for compare two scalar value.
export class Scalar implements IComparer {
  constructor(private x: bigint, private y: bigint) {}
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

// Vector uses for find/not find x scalar type in y vector type.
export class Vector implements IComparer {
  constructor(private x: bigint, private y: bigint[]) {}
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

// FactoryComparer depends on input data will return right comparer.
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
