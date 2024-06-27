export enum AcceptProtocolVersion {
  iden3commV1 = 'iden3comm/v1',
  iden3commV1_1 = 'iden3comm/v1.1'
}

export enum AcceptAuthMode {
  jsw = 'jws'
}

export enum AcceptJwzMode {
  authV2 = 'authV2',
  authV3 = 'authV3'
}

export const defaultAcceptProfile = `${AcceptProtocolVersion.iden3commV1};auth=${AcceptAuthMode.jsw};jwz=${AcceptJwzMode.authV2}`;

export const buildAcceptProfile = (
  protocolVersion: AcceptProtocolVersion,
  authMode: AcceptAuthMode[],
  jwzMode: AcceptJwzMode[]
): string => {
  return `${protocolVersion};auth=${authMode.join(',')},jwz=${jwzMode.join(',')}`;
};

export const parseAcceptProfile = (
  profileString: string
): {
  protocolVersion: AcceptProtocolVersion;
  authMode: AcceptAuthMode[];
  jwzMode: AcceptJwzMode[];
} => {
  const params = profileString.split(';');
  const protocolVersion = params[0] as AcceptProtocolVersion;
  const authIndex = params.findIndex((i: string) => i.includes('auth'));
  const authMode = params[authIndex]
    .split('=')[1]
    .split(',')
    .map((i) => i as AcceptAuthMode);
  const jwzIndex = params.findIndex((i: string) => i.includes('jwz'));
  const jwzMode = params[jwzIndex]
    .split('=')[1]
    .split(',')
    .map((i) => i as AcceptJwzMode);
  return {
    protocolVersion,
    authMode,
    jwzMode
  };
};
