import { CredentialStatusType, VerifiableConstants } from './constants';
import { Options, Path } from '@iden3/js-jsonld-merklization';
import { W3CCredential } from './credential';
import { PropertyQueryKind, QueryMetadata } from '../proof';
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
  kind: PropertyQueryKind = 'credentialSubject',
  opts?: Options
): Promise<Path> => {
  let path = new Path();

  if (field) {
    path = await Path.getContextPathKey(ldSchema, contextType, field, opts);
  }
  if (kind === 'credentialSubject') {
    path.prepend([VerifiableConstants.CREDENTIAL_SUBJECT_PATH]);
  }

  if (Object.values(CredentialStatusType).includes(contextType as CredentialStatusType)) {
    path.prepend([VerifiableConstants.CREDENTIAL_STATUS_PATH]);
  }
  return path;
};

export const findValue = (
  fieldName: string,
  credential: W3CCredential,
  kind: PropertyQueryKind = 'credentialSubject'
): JsonDocumentObject => {
  const [first, ...rest] = fieldName.split('.');
  let v;
  if (kind === 'credentialSubject') {
    v = credential.credentialSubject[first];
  } else {
    v = credential[first as keyof W3CCredential];
  }

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
        type: tp
      }
    }
  };

  let result: JsonDocumentObject = {};
  let w3cResult: JsonDocumentObject = {};
  for (const query of queries) {
    const parts = query.fieldName.split('.');
    const current: JsonDocumentObject = parts.reduceRight(
      (acc: JsonDocumentObject, part: string) => {
        if (result[part]) {
          return { [part]: { ...(result[part] as JsonDocumentObject), ...acc } };
        }
        return { [part]: acc };
      },
      findValue(query.fieldName, credential, query.kind) as JsonDocumentObject
    );

    if (query.kind === 'credentialSubject') {
      result = { ...result, ...current };
    } else {
      w3cResult = { ...w3cResult, ...current };
    }
  }

  skeleton.verifiableCredential.credentialSubject = {
    ...skeleton.verifiableCredential.credentialSubject,
    ...result
  };

  if (w3cResult.credentialStatus) {
    (w3cResult.credentialStatus as JsonDocumentObject).type = credential.credentialStatus.type;
    (w3cResult.credentialStatus as JsonDocumentObject).id = credential.credentialStatus.id;
  }

  skeleton.verifiableCredential = {
    ...skeleton.verifiableCredential,
    ...w3cResult
  };

  return skeleton;
};
