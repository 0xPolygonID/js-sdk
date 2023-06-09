import { BasicMessage, IPacker, PackerParams } from '../types';
import { MediaType, SUPPORTED_PUBLIC_KEY_TYPES } from '../constants';
import { extractPublicKeyBytes, getDIDComponentById, resolveDIDDocument } from '../utils/did';
import { keyPath, KMS } from '../../kms/';

import { Signer, verifyJWS } from 'did-jwt';
import { DIDDocument, Resolvable, VerificationMethod, parse } from 'did-resolver';
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
  /**
   * Creates an instance of JWSPacker.
   *
   * @param {KMS} _kms
   * @param {Resolvable} [_documentResolver={ resolve: resolveDIDDocument }]
   * @memberof JWSPacker
   */
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
      throw new Error(`No supported verification methods for algorithm ${params.alg}`);
    }
    let didDocument: DIDDocument;

    try {
      // const didResolution = await this._documentResolver.resolve(from);
      // didDocument = didResolution.didDocument;

      didDocument = {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          {
            EcdsaSecp256k1RecoveryMethod2020:
              'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020#EcdsaSecp256k1RecoveryMethod2020',
            blockchainAccountId: 'https://w3id.org/security#blockchainAccountId'
          }
        ],
        id: 'did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65',
        verificationMethod: [
          {
            id: 'did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65#Recovery2020',
            type: 'EcdsaSecp256k1RecoveryMethod2020',
            controller: 'did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65',
            blockchainAccountId: 'eip155:137:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65'
          }
        ],
        authentication: ['did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65#Recovery2020'],
        assertionMethod: ['did:pkh:poly:0x7141E4d20F7644DC8c0AdCA8a520EC83C6cABD65#Recovery2020']
      } as DIDDocument;
      if (!didDocument) {
        throw new Error('No DID document found');
      }
    } catch (error) {
      throw new Error(`Failed to resolve DID document for ${from}: ${error.message}`);
    }

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

    if (!vm) {
      throw new Error(
        `No key found with id ${params.kid} in ${section} section of DID document ${didDocument.id}`
      );
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
      const signerFn = params.signer(vm, signingInputBytes);
      signatureBase64 = (await signerFn(signingInput)).toString();
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

      signatureBase64 = byteDecoder.decode(signatureBytes);
    }

    return byteEncoder.encode(`${signingInput}.${signatureBase64}`);
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
    const sender = header.kid ?? '';
    if (header.kid !== message.from) {
      throw new Error(`Sender does not match DID in message with kid ${header?.kid}`);
    }
    const resolvedDoc = await this._documentResolver.resolve(sender);
    const pubKey = getDIDComponentById(resolvedDoc.didDocument, header.kid, 'authentication');

    const verificationResponse = verifyJWS(jws, pubKey);
    console.log('verificationResponse', verificationResponse);
    if (!verificationResponse) {
      throw new Error('JWS verification failed');
    }
    return message as BasicMessage;
  }

  mediaType(): MediaType {
    return MediaType.SignedMessage;
  }
}
