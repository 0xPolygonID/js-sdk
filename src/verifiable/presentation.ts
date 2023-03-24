import { Hasher, MtValue, Path } from '@iden3/js-jsonld-merklization';
import axios, { AxiosResponse } from 'axios';
import { W3CCredential } from './credential';
import { ProofQuery } from './proof';

export const stringByPath = (obj: object, path: string): string => {
  const parts = path.split('.');

  let value = obj;
  for (let index = 0; index < parts.length; index++) {
    const key = parts[index];
    if (!key) {
      throw new Error('path is empty');
    }
    value = value[key];
    if (value === undefined) {
      throw new Error('path not found');
    }
  }
  return value.toString();
};

export const buildQueryPath = async (
  contextURL: string,
  contextType: string,
  field: string
): Promise<Path> => {
  let resp: AxiosResponse;
  try {
    resp = await axios.get(contextURL);
  } catch (error) {
    throw new Error(`context not found: ${error.message}`);
  }

  const path = await Path.getContextPathKey(JSON.stringify(resp.data), contextType, field);
  path.prepend(['https://www.w3.org/2018/credentials#credentialSubject']);
  return path;
};

export const fmtVerifiablePresentation = (
  context: string,
  tp: string,
  field: string,
  value: unknown
): object => {
  const baseContext = ['https://www.w3.org/2018/credentials/v1'];
  const ldContext = baseContext[0] === context ? baseContext : [...baseContext, context];

  const vc = 'VerifiableCredential';
  const vcTypes = [vc];
  if (tp !== vc) {
    vcTypes.push(tp);
  }

  return {
    '@context': baseContext,
    '@type': 'VerifiablePresentation',
    verifiableCredential: {
      '@context': ldContext,
      '@type': vcTypes,
      credentialSubject: {
        '@type': tp,
        [field]: value
      }
    }
  };
};

export const verifiablePresentationFromCred = async (
  w3cCred: W3CCredential,
  requestObj: ProofQuery,
  field: string
): Promise<{
  vp: object;
  mzValue: MtValue;
  dataType: string;
  hasher: Hasher;
}> => {
  const mz = await w3cCred.merklize();

  const contextType = stringByPath(requestObj, 'type');

  const hasher = mz.hasher;

  const contextURL = stringByPath(requestObj, 'context');

  const path = await buildQueryPath(contextURL, contextType, field);

  const dataType = await mz.jsonLDType(path);

  const rawValue = mz.rawValue(path);

  const { value } = await mz.proof(path);

  const vp = fmtVerifiablePresentation(contextURL, contextType, field, rawValue);

  return { vp, mzValue: value, dataType, hasher };
};