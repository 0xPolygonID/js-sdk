import { poseidon } from '@iden3/js-crypto';
import { SchemaHash } from '@iden3/js-iden3-core';
import { defaultValueArraySize, Operators, prepareCircuitArrayValues } from '../../circuits';

export function calculateQueryHash(
  values: bigint[],
  schema: SchemaHash,
  slotIndex: string | number,
  operator: string | number,
  claimPathKey: string | number,
  valueArraySize: string | number,
  merklized: string | number,
  isRevocationChecked: string | number,
  verifierID: string | number,
  nullifierSessionID: string | number
): bigint {
  const claimPathNotExists = operator === Operators.EXISTS && values[0] === BigInt(0);
  const expValue = prepareCircuitArrayValues(values, defaultValueArraySize);
  const valueHash = poseidon.spongeHashX(expValue, 6);
  const firstPartQueryHash = poseidon.hash([
    schema.bigInt(),
    BigInt(slotIndex),
    BigInt(operator),
    BigInt(claimPathKey),
    BigInt(claimPathNotExists),
    valueHash
  ]);

  const queryHash = poseidon.hash([
    firstPartQueryHash,
    BigInt(valueArraySize),
    BigInt(merklized),
    BigInt(isRevocationChecked),
    BigInt(verifierID),
    BigInt(nullifierSessionID)
  ]);
  return queryHash;
}
