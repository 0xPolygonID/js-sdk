import { VerifiableConstants } from './constants';
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
  kind: PropertyQueryKind = PropertyQueryKind.CREDENTIAL_SUBJECT,
  opts?: Options
): Promise<Path> => {
  let path = new Path();

  if (field) {
    path = await Path.getContextPathKey(ldSchema, contextType, field, opts);
  }
  if (kind === PropertyQueryKind.CREDENTIAL_SUBJECT) {
    path.prepend([VerifiableConstants.CREDENTIAL_SUBJECT_PATH]);
  }
  return path;
};

export const findValue = (fieldName: string, credential: W3CCredential): JsonDocumentObject => {
  const [first, ...rest] = fieldName.split('.');
  let v = credential.credentialSubject[first];
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
  const baseContext = [VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018];
  const ldContext = baseContext[0] === context ? baseContext : [...baseContext, context];

  const vc = VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_CREDENTIAL;
  const vcTypes = [vc];
  if (tp !== vc) {
    vcTypes.push(tp);
  }

  const skeleton = {
    '@context': baseContext,
    type: VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_PRESENTATION,
    verifiableCredential: {
      '@context': ldContext,
      type: vcTypes,
      credentialSubject: {
        type: tp
      }
    }
  };

  let result: JsonDocumentObject = {};
  const w3cResult: JsonDocumentObject = {};
  for (const query of queries) {
    if (query?.kind === PropertyQueryKind.W3C_V1) {
      const fieldName = query.fieldName;
      const value = credential?.[fieldName as keyof W3CCredential];
      w3cResult[fieldName] = value as JsonDocumentObject;
    } else {
      const parts = query.fieldName.split('.');
      const current: JsonDocumentObject = parts.reduceRight(
        (acc: JsonDocumentObject, part: string) => {
          if (result[part]) {
            return { [part]: { ...(result[part] as JsonDocumentObject), ...acc } };
          }
          return { [part]: acc };
        },
        findValue(query.fieldName, credential) as JsonDocumentObject
      );

      result = { ...result, ...current };
    }
  }

  skeleton.verifiableCredential.credentialSubject = {
    ...skeleton.verifiableCredential.credentialSubject,
    ...result
  };

  skeleton.verifiableCredential = {
    ...skeleton.verifiableCredential,
    ...w3cResult
  };

  return skeleton;
};
