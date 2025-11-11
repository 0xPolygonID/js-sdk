import { VerifiableConstants } from './constants';
import { Options, Path } from '@iden3/js-jsonld-merklization';
import { W3CCredential } from './credential';
import { QueryMetadata } from '../proof';
import { VerifiablePresentation, JsonDocumentObject } from '../iden3comm';

export const stringByPath = (obj: { [key: string]: unknown }, path: string): string => {
  const parts = path.split('.');

  let value = obj;
  for (let index = 0; index < parts.length; index++) {
    const key = parts[index];
    if (!key) {
      throw new Error('path is empty');
    }
    value = value[key] as { [key: string]: unknown };
    if (value === undefined) {
      throw new Error('path not found');
    }
  }
  return value.toString();
};

export const buildFieldPath = async (
  ldSchema: string,
  contextType: string,
  field: string,
  opts?: Options
): Promise<Path> => {
  let path = new Path();

  if (field) {
    path = await Path.getContextPathKey(ldSchema, contextType, field, opts);
  }

  switch (ldSchema) {
    case VerifiableConstants.JSONLD_SCHEMA.IDEN3_PROOFS_DEFINITION_DOCUMENT:
      path.prepend([VerifiableConstants.CREDENTIAL_STATUS_PATH]);
      break;
    case VerifiableConstants.JSONLD_SCHEMA.W3C_VC_DOCUMENT_2018:
      break;
    default:
      path.prepend([VerifiableConstants.CREDENTIAL_SUBJECT_PATH]);
  }
  return path;
};

export const findValue = (fieldName: string, credential: W3CCredential): JsonDocumentObject => {
  const [first, ...rest] = fieldName.split('.');
  let v: unknown = credential[first as keyof W3CCredential];

  for (const part of rest) {
    v = (v as JsonDocumentObject)[part];
  }
  return v as JsonDocumentObject;
};

export const createVerifiablePresentation = (
  context: string,
  tp: string,
  credential: W3CCredential,
  queries: QueryMetadata[]
): VerifiablePresentation => {
  const vc = VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_CREDENTIAL;
  const vcTypes = [vc];
  if (tp !== vc) {
    vcTypes.push(tp);
  }

  const skeleton = {
    '@context': [VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018],
    type: VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_PRESENTATION,
    verifiableCredential: {
      '@context': credential['@context'],
      type: vcTypes,
      credentialSubject: {
        // id: credential.credentialSubject.id, // Should we include id in credentialSubject?
        type: tp
      },
      credentialStatus: {
        id: credential.credentialStatus?.id,
        type: credential.credentialStatus?.type
      }
    }
  };

  let w3cResult: JsonDocumentObject = {};
  for (const query of queries) {
    const parts = query.fieldName.split('.');
    const current: JsonDocumentObject = parts.reduceRight(
      (acc: JsonDocumentObject, part: string) => {
        if (w3cResult[part]) {
          return { [part]: { ...(w3cResult[part] as JsonDocumentObject), ...acc } };
        }
        return { [part]: acc };
      },
      findValue(query.fieldName, credential) as JsonDocumentObject
    );

    w3cResult = { ...w3cResult, ...current };
  }

  if (w3cResult.credentialStatus) {
    w3cResult.credentialStatus = {
      ...skeleton.verifiableCredential.credentialStatus,
      ...(w3cResult.credentialStatus as JsonDocumentObject)
    };
  }

  if (w3cResult.credentialSubject) {
    w3cResult.credentialSubject = {
      ...skeleton.verifiableCredential.credentialSubject,
      ...(w3cResult.credentialSubject as JsonDocumentObject)
    };
  }

  skeleton.verifiableCredential = {
    ...skeleton.verifiableCredential,
    ...w3cResult
  };

  return skeleton;
};
