import { Iden3Credential } from './verifiable/credential';
import { Claim } from '@iden3/js-iden3-core';

export abstract class Parser {
  abstract parseClaim(credential: Iden3Credential, schemaBytes: Uint8Array): Claim;
}
