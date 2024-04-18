import { BasicMessage, IPacker, JWSPackerParams } from '../types';
import { MediaType, SUPPORTED_PUBLIC_KEY_TYPES } from '../constants';
import { extractPublicKeyBytes, resolveVerificationMethods } from '../utils/did';
import { keyPath, KMS } from '../../kms/';

import { verifyJWS } from 'did-jwt';
import { DIDDocument, Resolvable, parse } from 'did-resolver';
import { bytesToBase64url } from '../../utils/encoding';
import {
  byteDecoder,
  byteEncoder,
  bytesToHex,
  decodeBase64url,
  encodeBase64url
} from '../../utils';

/**
 * Packer that can pack message to JWZ token,
 * and unpack and validate JWZ envelope
 * @public
 * @class ZKPPacker
 * @implements implements IPacker interface
 */
export class JWSPacker implements IPacker {
  /**
   * Creates an instance of JWSPacker.
   *
   * @param {KMS} _kms
   * @param {Resolvable} _documentResolver
   * @memberof JWSPacker
   */
  constructor(private readonly _kms: KMS, private readonly _documentResolver: Resolvable) {}

  /**
   * Packs the given payload and returns a promise that resolves to the packed data.
   *
   * @param {Uint8Array} payload - The payload to be packed.
   * @param {PackerParams} param - The packing parameters.
   * @returns `Promise<Uint8Array>`
   */
  packMessage(msg: BasicMessage, param: JWSPackerParams): Promise<Uint8Array> {
    return this.packInternal(msg, param);
  }
  /**
   * creates JSON Web Signature token
   *
   * @param {Uint8Array} payload - serialized message
   * @param {PackerParams} params - sender id and proving alg are required
   * @returns `Promise<Uint8Array>`
   */
  async pack(payload: Uint8Array, params: JWSPackerParams): Promise<Uint8Array> {
    const message = JSON.parse(byteDecoder.decode(payload));
    return this.packInternal(message, params);
  }

  /**
   * validate envelope which is jwz token
   *
   * @param {Uint8Array} envelope
   * @returns `Promise<BasicMessage>`
   */
  async unpack(envelope: Uint8Array): Promise<BasicMessage> {
    const jws = byteDecoder.decode(envelope);

    const [headerStr, msgStr] = jws.split('.');

    const header = JSON.parse(decodeBase64url(headerStr));
    const message = JSON.parse(decodeBase64url(msgStr));
    const explicitSender = parse(header.kid)?.did;
    if (explicitSender && explicitSender !== message.from) {
      throw new Error(`Sender does not match DID in message with kid ${header?.kid}`);
    }

    const didDocument: DIDDocument = await this.resolveDidDoc(message.from);

    let vms = resolveVerificationMethods(didDocument);

    if (!vms?.length) {
      throw new Error(`No verification methods defined in the DID document of ${didDocument.id}`);
    }
    if (header.kid) {
      const vm = vms.find((v) => {
        return v.id === header.kid;
      });
      if (!vm) {
        throw new Error(
          `verification method with specified kid ${header.kid} is not found in the DID Document`
        );
      }
      vms = [vm];
    }

    const verificationResponse = verifyJWS(jws, vms);

    if (!verificationResponse) {
      throw new Error('JWS verification failed');
    }
    return message as BasicMessage;
  }

  mediaType(): MediaType {
    return MediaType.SignedMessage;
  }

  private async resolveDidDoc(from: string) {
    let didDocument: DIDDocument;
    try {
      const didResolutionResult = await this._documentResolver.resolve(from);
      if (!didResolutionResult?.didDocument?.id) {
        throw new Error(`did document for ${from} is not found in resolution result`);
      }
      didDocument = didResolutionResult.didDocument;
    } catch (err: unknown) {
      throw new Error(`did document for ${from} is not resolved: ${(err as Error).message}`);
    }
    return didDocument;
  }

  private async packInternal(message: BasicMessage, params: JWSPackerParams): Promise<Uint8Array> {
    if (!params.alg) {
      throw new Error('Missing algorithm');
    }

    const from = message.from ?? '';
    if (!from) {
      throw new Error('Missing sender DID');
    }

    const vmTypes: string[] =
      SUPPORTED_PUBLIC_KEY_TYPES[params.alg as keyof typeof SUPPORTED_PUBLIC_KEY_TYPES];
    if (!vmTypes?.length) {
      throw new Error(`No supported verification methods for algorithm ${params.alg}`);
    }

    const didDocument: DIDDocument = params.didDocument ?? (await this.resolveDidDoc(from));

    const vms = resolveVerificationMethods(didDocument);

    if (!vms.length) {
      throw new Error(`No verification methods defined in the DID document of ${didDocument.id}`);
    }

    // try to find a managed signing key that matches keyRef
    const vm = params.kid ? vms.find((vm) => vm.id === params.kid) : vms[0];

    if (!vm) {
      throw new Error(`No key found with id ${params.kid} in DID document of ${didDocument.id}`);
    }

    const { publicKeyBytes, kmsKeyType } = extractPublicKeyBytes(vm);

    if (!publicKeyBytes && !kmsKeyType) {
      if ((vm.blockchainAccountId || vm.ethereumAddress) && !params.signer) {
        throw new Error(`No signer provided for ${vm.blockchainAccountId || vm.ethereumAddress}`);
      }
    }

    const kid = vm.id;

    const headerObj = { alg: params.alg, kid, typ: MediaType.SignedMessage };
    const header = encodeBase64url(JSON.stringify(headerObj));
    const msg = encodeBase64url(JSON.stringify(message));
    const signingInput = `${header}.${msg}`;
    const signingInputBytes = byteEncoder.encode(signingInput);
    let signatureBase64: string;
    if (params.signer) {
      const signature = await params.signer(vm, signingInputBytes);
      signatureBase64 = bytesToBase64url(signature);
    } else {
      if (!publicKeyBytes) {
        throw new Error('No public key found');
      }

      if (!kmsKeyType) {
        throw new Error('No KMS key type found');
      }

      const signatureBytes = await this._kms.sign(
        { type: kmsKeyType, id: keyPath(kmsKeyType, bytesToHex(publicKeyBytes)) },
        signingInputBytes
      );

      signatureBase64 = bytesToBase64url(signatureBytes);
    }

    return byteEncoder.encode(`${signingInput}.${signatureBase64}`);
  }
}
