import { poseidon } from '@iden3/js-crypto';
import { SchemaHash } from '@iden3/js-iden3-core';
import { defaultValueArraySize, prepareCircuitArrayValues } from '../../circuits';

export function calculateQueryHashV2(
  values: bigint[],
  schema: SchemaHash,
  slotIndex: string | number,
  operator: string | number,
  claimPathKey: string | number,
  claimPathNotExists: string | number
): bigint {
  const expValue = prepareCircuitArrayValues(values, 64);
  const valueHash = poseidon.spongeHashX(expValue, 6);
  return poseidon.hash([
    schema.bigInt(),
    BigInt(slotIndex),
    BigInt(operator),
    BigInt(claimPathKey),
    BigInt(claimPathNotExists),
    valueHash
  ]);
}

export function calculateQueryHashV3(
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
  const expValue = prepareCircuitArrayValues(values, defaultValueArraySize);
  const valueHash = poseidon.spongeHashX(expValue, 6);
  const firstPartQueryHash = poseidon.hash([
    schema.bigInt(),
    BigInt(slotIndex),
    BigInt(operator),
    BigInt(claimPathKey),
    BigInt(merklized),
    valueHash
  ]);

  const queryHash = poseidon.hash([
    firstPartQueryHash,
    BigInt(valueArraySize),
    BigInt(isRevocationChecked),
    BigInt(verifierID),
    BigInt(nullifierSessionID),
    0n
  ]);
  return queryHash;
}
