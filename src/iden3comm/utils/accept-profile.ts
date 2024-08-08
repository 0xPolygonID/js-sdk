import { AcceptAuthMode, AcceptJwzMode, AcceptProtocolVersion } from '../types';
import { AcceptProfile } from '../types/protocol/accept-profile';

function isProtocolVersion(value: string): boolean {
  return Object.values(AcceptProtocolVersion).includes(value as AcceptProtocolVersion);
}

function isAcceptAuthMode(value: string): boolean {
  return Object.values(AcceptAuthMode).includes(value as AcceptAuthMode);
}

function isAcceptJwzMode(value: string): boolean {
  return Object.values(AcceptJwzMode).includes(value as AcceptJwzMode);
}

export const defaultAcceptProfile: AcceptProfile = {
  protocolVersion: [AcceptProtocolVersion.iden3commV1],
  authMode: [AcceptAuthMode.jsw],
  jwzMode: [AcceptJwzMode.authV2]
};

export const buildAcceptProfile = (
  protocolVersion: AcceptProtocolVersion,
  authMode: AcceptAuthMode[],
  jwzMode: AcceptJwzMode[]
): string => {
  let acceptProfile = `${protocolVersion}`;
  if (authMode.length > 0) {
    acceptProfile += `;auth=${authMode.join(',')}`;
  }
  if (jwzMode.length > 0) {
    acceptProfile += `;jwz=${jwzMode.join(',')}`;
  }
  return acceptProfile;
};

export const parseAcceptProfile = (
  profileString: string
): {
  protocolVersion: AcceptProtocolVersion;
  authMode: AcceptAuthMode[];
  jwzMode: AcceptJwzMode[];
} => {
  const params = profileString.split(';');
  const protocolVersion = params[0].trim() as AcceptProtocolVersion;
  if (!isProtocolVersion(protocolVersion)) {
    throw new Error(`Protocol version '${protocolVersion}' not supported`);
  }
  const authIndex = params.findIndex((i: string) => i.includes('auth='));
  let authMode: AcceptAuthMode[] = [];
  if (authIndex > 0) {
    authMode = params[authIndex]
      .split('=')[1]
      .split(',')
      .map((i) => i.trim())
      .map((i) => {
        if (!isAcceptAuthMode(i)) {
          throw new Error(`Auth mode '${i}' not supported`);
        }
        return i as AcceptAuthMode;
      });
  }
  const jwzIndex = params.findIndex((i: string) => i.includes('jwz='));
  let jwzMode: AcceptJwzMode[] = [];
  if (jwzIndex > 0) {
    jwzMode = params[jwzIndex]
      .split('=')[1]
      .split(',')
      .map((i) => i.trim())
      .map((i) => {
        if (!isAcceptJwzMode(i)) {
          throw new Error(`Jwz mode '${i}' not supported`);
        }
        return i as AcceptJwzMode;
      });
  }
  return {
    protocolVersion,
    authMode,
    jwzMode
  };
};

export const isAcceptProfileSupported = (
  accept: string[],
  acceptProfile: AcceptProfile
): boolean => {
  for (const acceptProfileString of accept) {
    const supportedProtocols = acceptProfile.protocolVersion || [AcceptProtocolVersion.iden3commV1];
    const supportedAuthModes = acceptProfile.authMode || [AcceptAuthMode.jsw];
    const supportedJwzModes = acceptProfile.jwzMode || [AcceptJwzMode.authV2];
    const { protocolVersion, authMode, jwzMode } = parseAcceptProfile(acceptProfileString);
    if (
      supportedProtocols.includes(protocolVersion) &&
      supportedAuthModes.some((i) => !authMode?.length || authMode.includes(i)) &&
      supportedJwzModes.some((i) => !jwzMode?.length || jwzMode.includes(i))
    ) {
      return true;
    }
  }

  return false;
};
