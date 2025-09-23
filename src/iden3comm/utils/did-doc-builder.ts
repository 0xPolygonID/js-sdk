import { IKeyProvider } from '../../kms';
import { DIDDocument, VerificationMethod } from '../types';
import { toPublicKeyJwk } from './did';

export const DEFAULT_DID_CONTEXT = 'https://www.w3.org/ns/did/v1';
export const JWK2020_CONTEXT_V1 = 'https://w3id.org/security/suites/jws-2020/v1';
/**
 * DID Document builder
 */
export class DIDDocumentBuilder {
  private _verificationMethods: VerificationMethod[] = [];
  private _keyAgreements: string[] = [];
  private _context: string[];

  constructor(private readonly _did: string, context: string | string[] = DEFAULT_DID_CONTEXT) {
    const contextArr = [context].flat();
    this._context = contextArr.includes(DEFAULT_DID_CONTEXT)
      ? contextArr
      : [DEFAULT_DID_CONTEXT, ...contextArr];
  }

  async addVerificationMethod(
    vm: IVerificationMethodBuilder,
    context?: string | string[]
  ): Promise<this> {
    const method = await vm.build(this._did);
    this._verificationMethods.push(method);
    this._keyAgreements.push(method.id);
    if (context) {
      this._context = [
        ...new Set([...this._context, ...(Array.isArray(context) ? context : [context])])
      ];
    }
    return this;
  }

  build(): DIDDocument {
    return {
      '@context': this._context,
      id: this._did,
      keyAgreement: this._keyAgreements,
      verificationMethod: this._verificationMethods
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
  private _alias?: string;

  constructor(private readonly _keyProvider: IKeyProvider, opts?: { alias?: string }) {
    this._alias = opts?.alias;
  }

  async build(did: string): Promise<VerificationMethod> {
    const keyId = this._alias
      ? { type: this._keyProvider.keyType, id: this._alias }
      : await this._keyProvider.newPrivateKey();

    const pubKey = await this._keyProvider.publicKey(keyId);
    const alias = (this._alias ?? keyId.id).split(':').pop();
    const kid = `${did}#${alias}`;

    return {
      id: kid,
      type: 'JsonWebKey2020',
      controller: did,
      publicKeyJwk: toPublicKeyJwk(pubKey, keyId.type)
    };
  }
}
