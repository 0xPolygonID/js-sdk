import { DIDDocument, Resolvable } from 'did-resolver';
import { AcceptJweKEKAlgorithms, VerificationMethodType } from '../constants';
import { RecipientInfo } from '../packers';
import { resolveVerificationMethods } from './did';
import { VerificationMethod } from '../types';
import { base58ToBytes, base64UrlToBytes, hexToBytes } from '../../utils';

export const getRecipientsJWKs = (
  recipients: RecipientInfo[],
  documentResolver: Resolvable
): Promise<
  {
    alg: string;
    did: string;
    keyType: VerificationMethodType;
    kid: string;
    recipientJWK: JsonWebKey;
  }[]
> => {
  return Promise.all(
    recipients.map(async (recipient) => {
      if (!recipient.did) {
        throw new Error('Missing recipient DID');
      }
      const recipientDidDoc: DIDDocument | null =
        recipient.didDocument ??
        (await documentResolver.resolve(recipient.did.string()))?.didDocument;

      if (!recipientDidDoc) {
        throw new Error('Recipient DID document not found');
      }

      const vms = resolveVerificationMethods(recipientDidDoc);

      if (!vms.length) {
        throw new Error(
          `No verification methods defined in the DID document of ${recipientDidDoc.id}`
        );
      }

      const keyType = recipient.keyType ?? 'JsonWebKey2020';
      const alg = recipient.alg ?? AcceptJweKEKAlgorithms.RSA_OAEP_256;

      // !!! TODO: could be more than one key with the same controller and type, taking the first one for now
      const vm = vms.find(
        (vm) =>
          vm.controller === recipient.did.string() &&
          vm.type === keyType &&
          vm.publicKeyJwk?.alg === alg
      );

      if (!vm) {
        throw new Error(
          `No key found with id ${recipient.did.string()} and type ${keyType} in DID document of ${
            recipientDidDoc.id
          }`
        );
      }

      const recipientJWK = extractPublicKeyBytes(vm);

      if (!recipientJWK) {
        throw new Error('No public key found');
      }

      if (recipientJWK instanceof Uint8Array) {
        throw new Error('Public key is not a JWK');
      }

      return {
        did: recipient.did.string(),
        keyType,
        kid: vm.id,
        alg,
        recipientJWK
      };
    })
  );
};

const extractPublicKeyBytes = (vm: VerificationMethod): JsonWebKey | Uint8Array | null => {
  if (vm.publicKeyBase58) {
    return base58ToBytes(vm.publicKeyBase58);
  }
  if (vm.publicKeyBase64) {
    return base64UrlToBytes(vm.publicKeyBase64);
  }
  if (vm.publicKeyHex) {
    return hexToBytes(vm.publicKeyHex);
  }
  if (vm.publicKeyJwk) {
    return vm.publicKeyJwk;
  }

  return null;
};
