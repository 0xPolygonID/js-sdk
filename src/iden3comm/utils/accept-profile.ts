import {
  MediaType,
  ProtocolVersion,
  AcceptAuthCircuits,
  AcceptJwzAlgorithms,
  AcceptJwsAlgorithms
} from '../constants';
import { AcceptProfile } from '../types';

function isProtocolVersion(value: string): boolean {
  return Object.values(ProtocolVersion).includes(value as ProtocolVersion);
}

function isMediaType(value: string): boolean {
  return Object.values(MediaType).includes(value as MediaType);
}

function isAcceptAuthCircuits(value: string): boolean {
  return Object.values(AcceptAuthCircuits).includes(value as AcceptAuthCircuits);
}

function isAcceptJwsAlgorithms(value: string): boolean {
  return Object.values(AcceptJwsAlgorithms).includes(value as AcceptJwsAlgorithms);
}

function isAcceptJwzAlgorithms(value: string): boolean {
  return Object.values(AcceptJwzAlgorithms).includes(value as AcceptJwzAlgorithms);
}

export const buildAccept = (profiles: AcceptProfile[]): string[] => {
  const result = [];
  for (const profile of profiles) {
    let accept = `${profile.protocolVersion};env=${profile.env}`;
    if (profile.circuits?.length) {
      accept += `;circuitId=${profile.circuits.join(',')}`;
    }
    if (profile.alg?.length) {
      accept += `;alg=${profile.alg.join(',')}`;
    }
    result.push(accept);
  }

  return result;
};

export const parseAcceptProfile = (profile: string): AcceptProfile => {
  const params = profile.split(';');

  if (params.length < 2) {
    throw new Error('Invalid accept profile');
  }
  const protocolVersion = params[0].trim() as ProtocolVersion;
  if (!isProtocolVersion(protocolVersion)) {
    throw new Error(`Protocol version '${protocolVersion}' not supported`);
  }

  const envParam = params[1].split('=');
  if (envParam.length !== 2) {
    throw new Error(`Invalid accept profile 'env' parameter`);
  }
  const env = params[1].split('=')[1].trim() as MediaType;
  if (!isMediaType(env)) {
    throw new Error(`Envelop '${env}' not supported`);
  }

  const circuitsIndex = params.findIndex((i: string) => i.includes('circuitId='));
  if (env !== MediaType.ZKPMessage && circuitsIndex > 0) {
    throw new Error(`Circuits not supported for env '${env}'`);
  }

  let circuits: AcceptAuthCircuits[] | undefined = undefined;
  if (circuitsIndex > 0) {
    circuits = params[circuitsIndex]
      .split('=')[1]
      .split(',')
      .map((i) => i.trim())
      .map((i) => {
        if (!isAcceptAuthCircuits(i)) {
          throw new Error(`Circuit '${i}' not supported`);
        }
        return i as AcceptAuthCircuits;
      });
  }

  const algIndex = params.findIndex((i: string) => i.includes('alg='));
  let alg: AcceptJwsAlgorithms[] | AcceptJwzAlgorithms[] | undefined = undefined;
  if (algIndex > 0) {
    if (env === MediaType.ZKPMessage) {
      alg = params[algIndex]
        .split('=')[1]
        .split(',')
        .map((i) => {
          i = i.trim();
          if (!isAcceptJwzAlgorithms(i)) {
            throw new Error(`Algorithm '${i}' not supported for '${env}'`);
          }
          return i as AcceptJwzAlgorithms;
        });
    } else if (env === MediaType.SignedMessage) {
      alg = params[algIndex]
        .split('=')[1]
        .split(',')
        .map((i) => {
          i = i.trim();
          if (!isAcceptJwsAlgorithms(i)) {
            throw new Error(`Algorithm '${i}' not supported for '${env}'`);
          }
          return i as AcceptJwsAlgorithms;
        });
    } else {
      throw new Error(`Algorithm not supported for '${env}'`);
    }
  }

  return {
    protocolVersion,
    env,
    circuits,
    alg
  };
};
