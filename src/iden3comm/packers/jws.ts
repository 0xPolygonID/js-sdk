import { BasicMessage, IPacker, PackerParams } from '../types';
import { byteDecoder, byteEncoder } from '../utils';
import { MediaType, SUPPORTED_PUBLIC_KEY_TYPES } from '../constants';
import {
  bytesToHex,
  encodeBase64url,
  extractPublicKeyBytes,
  getDIDComponentById,
  hexToBytes,
  resolveDIDDocument
} from '../utils/did';
import { AbstractPrivateKeyStore, keyPath, KmsKeyType } from '../../kms/';

import {
  ES256KSigner,
  ES256Signer,
  EdDSASigner,
  JWTHeader,
  Signer,
  createJWT,
  decodeJWT,
  verifyJWT
} from 'did-jwt';
import { Resolvable, VerificationMethod } from 'did-resolver';
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
  readonly signerAlgs: { [k: string]: (sk: Uint8Array) => Signer } = {
    ES256: (sk: Uint8Array) => ES256Signer(sk),
    ES256K: (sk: Uint8Array) => ES256KSigner(sk),
    'ES256K-R': (sk: Uint8Array) => ES256KSigner(sk, true),
    Ed25519: (sk: Uint8Array) => EdDSASigner(sk),
    EdDSA: (sk: Uint8Array) => EdDSASigner(sk)
  };
  readonly algToProviderKeyType = {
    ES256K: KmsKeyType.Secp256k1,
    'ES256-R': KmsKeyType.Secp256k1
  };

  // readonly vmPubkeyExtractorHandlerMap = {
  //   ES256K: getPubKeyHexFromVm,
  //   'ES256K-R': getPubKeyHexFromVm
  // };

  // readonly verifySignatureHandlerMap = {
  //   ES256K: verifySignatureSecp256K1,
  //   'ES256K-R': getPubKeyHexFromVm
  // };

  constructor(
    private readonly _keyStore: AbstractPrivateKeyStore,
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

    let signer: Signer;
    if (params.signer) {
      const headerObj = { alg: params.alg, kid, typ: MediaType.SignedMessage };
      const header = encodeBase64url(JSON.stringify(headerObj));
      const msg = encodeBase64url(JSON.stringify(message));
      // construct signing input and obtain signature
      const signingInput = byteEncoder.encode(`${header}.${msg}`);
      signer = params.signer(vm, signingInput);
    } else {
      const keyType = this.algToProviderKeyType[params.alg];
      if (!keyType) {
        throw new Error(`Unsupported algorithm ${params.alg}`);
      }
      // console.log('pk', bytesToHex(extractPublicKeyBytes(vm)));

      const sk = await this._keyStore.get({
        alias: keyPath(keyType, bytesToHex(extractPublicKeyBytes(vm)))
      });

      const signerAlg = this.signerAlgs[params.alg];

      if (!signerAlg) {
        throw new Error(`Unsupported algorithm ${params.alg}`);
      }

      signer = signerAlg(hexToBytes(sk));

      // const type = this.algToProviderKeyType[params.alg];
      // if (!type) {
      //   throw new Error(`Unsupported algorithm ${params.alg}`);
      // }
      // const pkFn = this.vmPubkeyExtractorHandlerMap[params.alg];
      // if (!pkFn) {
      //   throw new Error(`Unsupported detect public key fetcher ${params.alg}`);
      // }
      // signature = await this._kms.sign({ type, id: keyPath(type, pkFn(vm)) }, signingInput);
    }
    // const signatureBase64 = toBase64(BytesHelper.bytesToHex(signature));
    // const tokenStr = `${header}.${msg}.${signatureBase64}`;
    // console.log('tokenStr', tokenStr);
    const jwt = await createJWT(message, { issuer: params.issuer, signer }, {
      alg: params.alg,
      kid,
      typ: MediaType.SignedMessage
    } as unknown as JWTHeader);

    return byteEncoder.encode(jwt);
  }

  /**
   * validate envelope which is jwz token
   *
   * @param {Uint8Array} envelope
   * @returns `Promise<BasicMessage>`
   */
  async unpack(envelope: Uint8Array): Promise<BasicMessage> {
    const jwt = byteDecoder.decode(envelope);
    const decoded = decodeJWT(jwt);
    console.log('decoded', decoded);

    const verificationResponse = await verifyJWT(jwt, {
      resolver: this._documentResolver
    });

    if (!verificationResponse.verified) {
      throw new Error('JWS verification failed');
    }
    // const tokenStr = byteDecoder.decode(envelope);
    // const [headerStr, msgStr, signature64] = tokenStr.split('.');
    // const header = JSON.parse(fromBase64(headerStr));
    // console.log('header', header);
    // const didDocument = await this.documentResolverFn(header.kid);
    // const vm = getDIDComponentById(didDocument, header.kid, 'authentication');
    // if (!vm) {
    //   throw new Error(
    //     `No key found with id ${header.kid} in authentication section of DID document`
    //   );
    // }

    // const type = this.algToProviderKeyType[header.alg];
    // if (!type) {
    //   throw new Error(`Unsupported algorithm ${header.alg}`);
    // }
    // const signatureCheckFn = this.verifySignatureHandlerMap[header.alg];
    // if (!signatureCheckFn) {
    //   throw new Error(`Unsupported detect public key fetcher ${header.alg}`);
    // }

    // const isVerified = await signatureCheckFn(
    //   vm,
    //   byteEncoder.encode(`${headerStr}.${msgStr}`),
    //   fromBase64(signature64)
    // );
    console.log(verificationResponse);
    return {
      id: decoded.payload.id,
      typ: MediaType.SignedMessage
    } as BasicMessage;
  }

  mediaType(): MediaType {
    return MediaType.SignedMessage;
  }
}
