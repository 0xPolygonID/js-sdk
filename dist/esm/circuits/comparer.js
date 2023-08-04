/**
 * List of available operators.
 *
 * @enum {number}
 */
export var Operators;
(function (Operators) {
    Operators[Operators["NOOP"] = 0] = "NOOP";
    Operators[Operators["EQ"] = 1] = "EQ";
    Operators[Operators["LT"] = 2] = "LT";
    Operators[Operators["GT"] = 3] = "GT";
    Operators[Operators["IN"] = 4] = "IN";
    Operators[Operators["NIN"] = 5] = "NIN";
    Operators[Operators["NE"] = 6] = "NE";
})(Operators || (Operators = {}));
/** QueryOperators represents operators for atomic circuits */
export const QueryOperators = {
    $noop: Operators.NOOP,
    $eq: Operators.EQ,
    $lt: Operators.LT,
    $gt: Operators.GT,
    $in: Operators.IN,
    $nin: Operators.NIN,
    $ne: Operators.NE
};
/**
 * Scalar is used to compare two scalar value.
 *
 * @public
 * @class Scalar
 * @implements implements IComparer interface
 */
export class Scalar {
    /**
     * Creates an instance of Scalar.
     * @param {bigint} x - val x
     * @param {bigint} y - val y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * compares two  scalar values
     *
     * @param {Operators} operator - EQ / LT / GT
     * @returns boolean
     */
    compare(operator) {
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
export class Vector {
    /**
     * Creates an instance of Vector.
     * @param {bigint} x - val x
     * @param {bigint[]} y - array values y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     *
     *
     * @param {Operators} operator - IN / NIN
     * @returns boolean
     */
    compare(operator) {
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
export const factoryComparer = (x, y, operator) => {
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
//# sourceMappingURL=comparer.js.map