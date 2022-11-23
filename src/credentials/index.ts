import { Hex } from '@iden3/js-iden3-core';
import { Signature } from '../identity/bjj/eddsa-babyjub';
export * from './credential-wallet';

// BJJSignatureFromHexString converts hex to  babyjub.Signature
export const bJJSignatureFromHexString = async (sigHex: string): Promise<Signature> => {
  const signatureBytes = Hex.decodeString(sigHex);
  const sig = Uint8Array.from(signatureBytes).slice(0, 64);
  // TODO: call decompress
  const bjjSig = await (Signature as any).decompress(sig);
  return bjjSig as Signature;
};
