import { IKeyProvider } from '../../kms';
import { DIDDocument, VerificationMethod } from '../types';
import { toPublicKeyJwk } from './did';

export const DEFAULT_DID_CONTEXT = 'https://www.w3.org/ns/did/v1';
export const JWK2020_CONTEXT_V1 = 'https://w3id.org/security/suites/jws-2020/v1';
/**
 * DID Document builder
 */
export class DIDDocumentBuilder {
  private did: string;
  private verificationMethods: VerificationMethod[] = [];
  private keyAgreements: string[] = [];
  private context: string | string[];

  constructor(did: string, context: string | string[] = DEFAULT_DID_CONTEXT) {
    this.did = did;
    this.context = context.includes(DEFAULT_DID_CONTEXT)
      ? context
      : [DEFAULT_DID_CONTEXT, ...context];
  }

  async addVerificationMethod(vm: IVerificationMethodBuilder): Promise<this> {
    const method = await vm.build(this.did);
    this.verificationMethods.push(method);
    this.keyAgreements.push(method.id);
    return this;
  }

  build(): DIDDocument {
    return {
      '@context': this.context,
      id: this.did,
      keyAgreement: this.keyAgreements,
      verificationMethod: this.verificationMethods
    };
  }
}

/**
 * Interface for Verification Method builder
 */
export interface IVerificationMethodBuilder {
  build(did: string): Promise<VerificationMethod>;
}

/**
 * Verification Method builder
 */
export class Jwk2020VerificationMethodBuilder implements IVerificationMethodBuilder {
  private keyProvider: IKeyProvider;
  private alias?: string;

  constructor(keyProvider: IKeyProvider, opts?: { alias?: string }) {
    this.keyProvider = keyProvider;
    this.alias = opts?.alias;
  }

  async build(did: string): Promise<VerificationMethod> {
    const keyId = this.alias
      ? { type: this.keyProvider.keyType, id: this.alias }
      : await this.keyProvider.newPrivateKey();

    const pubKey = await this.keyProvider.publicKey(keyId);
    const alias = (this.alias ?? keyId.id).split(':').pop();
    const kid = `${did}#${alias}`;

    return {
      id: kid,
      type: 'JsonWebKey2020',
      controller: did,
      publicKeyJwk: toPublicKeyJwk(pubKey, keyId.type)
    };
  }
}
