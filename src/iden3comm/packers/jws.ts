import { BasicMessage, IPacker, PackerParams } from '../types';
import { MediaType, SUPPORTED_PUBLIC_KEY_TYPES } from '../constants';
import { extractPublicKeyBytes, getDIDComponentById, resolveDIDDocument } from '../utils/did';
import { keyPath, KMS } from '../../kms/';

import { Signer, verifyJWS } from 'did-jwt';
import { Resolvable, VerificationMethod, parse } from 'did-resolver';
import {
  byteDecoder,
  byteEncoder,
  bytesToHex,
  decodeBase64url,
  encodeBase64url
} from '../../utils';
export type SignerFn = (vm: VerificationMethod, data: Uint8Array) => Signer;

/**
 * Packer that can pack message to JWZ token,
 * and unpack and validate JWZ envelope
 * @exports
 * @beta
 * @class ZKPPacker
 * @implements implements IPacker interface
 */
export class JWSPacker implements IPacker {
  // readonly vmPubkeyExtractorHandlerMap = {
  //   ES256K: getPubKeyHexFromVm,
  //   'ES256K-R': getPubKeyHexFromVm
  // };

  // readonly verifySignatureHandlerMap = {
  //   ES256K: verifySignatureSecp256K1,
  //   'ES256K-R': getPubKeyHexFromVm
  // };

  constructor(
    private readonly _kms: KMS,
    private readonly _documentResolver: Resolvable = { resolve: resolveDIDDocument }
  ) {}
  /**
   * creates JSON Web Signature token
   *
   * @param {Uint8Array} payload - serialized message
   * @param {PackerParams} params - sender id and proving alg are required
   * @returns `Promise<Uint8Array>`
   */
  async pack(
    payload: Uint8Array,
    params: PackerParams & {
      alg: string;
      did: string;
      kid?: string;
      signer?: SignerFn;
    }
  ): Promise<Uint8Array> {
    if (!params.alg) {
      throw new Error('Missing algorithm');
    }
    const message = JSON.parse(byteDecoder.decode(payload));

    const from = message.from ?? '';
    if (params.did !== message.from) {
      throw new Error('DID in params does not match DID in message');
    }

    if (!from) {
      throw new Error('Missing DID');
    }

    const vmTypes: string[] = SUPPORTED_PUBLIC_KEY_TYPES[params.alg];
    if (!vmTypes?.length) {
      throw new Error(`No supported signature types for algorithm ${params.alg}`);
    }

    const { didDocument } = await this._documentResolver.resolve(from);

    const section = 'authentication';
    const authSection = didDocument[section] ?? [];

    const vms = authSection
      .map((key) =>
        typeof key === 'string'
          ? getDIDComponentById(didDocument, key ?? didDocument.id, section)
          : key
      )
      .filter(Boolean);

    if (!vms.length) {
      throw new Error(`No keys found in ${section} section of DID document ${didDocument.id}`);
    }

    // try to find a managed signing key that matches keyRef
    const vm = params.kid ? vms.find((vm) => vm.id === params.kid) : vms[0];

    // || vm.blockchainAccountId === params.kid

    if (!vm) {
      throw new Error(
        `No key found with id ${params.kid} in ${section} section of DID document ${didDocument.id}`
      );
    }

    if (vm.blockchainAccountId && !params.signer) {
      throw new Error(`No signer provided for ${vm.blockchainAccountId}`);
    }

    const kid = vm.id;

    const headerObj = { alg: params.alg, kid, typ: MediaType.SignedMessage };
    const header = encodeBase64url(JSON.stringify(headerObj));
    const msg = encodeBase64url(JSON.stringify(message));
    // construct signing input and obtain signature
    const signingInput = header + '.' + msg;
    const signingInputBytes = byteEncoder.encode(signingInput);
    let signatureHex: string;
    if (params.signer) {
      const signerFn = params.signer(vm, signingInputBytes);
      signatureHex = (await signerFn(signingInput)).toString();
    } else {
      const { publicKeyBytes, kmsKeyType } = extractPublicKeyBytes(vm);

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

      signatureHex = byteDecoder.decode(signatureBytes);
    }

    // const signature = encodeBase64url(signatureHex);

    return byteEncoder.encode(signingInput + '.' + signatureHex);
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
    const sender = parse(header.kid)?.did;
    if (sender !== message.from) {
      throw new Error(`Sender does not match DID in message with kid ${header?.kid}`);
    }
    const resolvedDoc = await this._documentResolver.resolve(sender);
    const pubKey = getDIDComponentById(resolvedDoc.didDocument, header.kid, 'authentication');

    const verificationResponse = verifyJWS(jws, pubKey);

    if (!verificationResponse) {
      throw new Error('JWS verification failed');
    }
    return message as BasicMessage;
  }

  mediaType(): MediaType {
    return MediaType.SignedMessage;
  }
}
