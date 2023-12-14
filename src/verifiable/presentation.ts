import { VerifiableConstants } from './constants';
import { Options, Path } from '@iden3/js-jsonld-merklization';
import { W3CCredential } from './credential';
import { QueryMetadata } from '../proof';
import { JSONObject } from '../iden3comm';

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
  path.prepend([VerifiableConstants.CREDENTIAL_SUBJECT_PATH]);
  return path;
};

export const findValue = (fieldName: string, credential: W3CCredential): JSONObject => {
  const [first, ...rest] = fieldName.split('.');
  let v = credential.credentialSubject[first];
  for (const part of rest) {
    v = (v as JSONObject)[part];
  }
  return v as JSONObject;
};

export const createVerifiablePresentation = (
  context: string,
  tp: string,
  credential: W3CCredential,
  queries: QueryMetadata[]
): object => {
  const baseContext = [VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018];
  const ldContext = baseContext[0] === context ? baseContext : [...baseContext, context];

  const vc = VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_CREDENTIAL;
  const vcTypes = [vc];
  if (tp !== vc) {
    vcTypes.push(tp);
  }

  const skeleton = {
    '@context': baseContext,
    '@type': VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_PRESENTATION,
    verifiableCredential: {
      '@context': ldContext,
      '@type': vcTypes,
      credentialSubject: {
        '@type': tp
      }
    }
  };

  let result: JSONObject = {};
  for (const query of queries) {
    const parts = query.fieldName.split('.');
    const current: JSONObject = parts.reduceRight((acc: JSONObject, part: string) => {
      if (result[part]) {
        return { [part]: { ...(result[part] as JSONObject), ...acc } };
      }
      return { [part]: acc };
    }, findValue(query.fieldName, credential) as JSONObject);

    result = { ...result, ...current };
  }

  skeleton.verifiableCredential.credentialSubject = {
    ...skeleton.verifiableCredential.credentialSubject,
    ...result
  };

  return skeleton;
};
