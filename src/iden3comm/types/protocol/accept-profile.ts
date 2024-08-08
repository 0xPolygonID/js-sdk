export enum AcceptProtocolVersion {
  iden3commV1 = 'iden3comm/v1'
}

export enum AcceptAuthMode {
  jsw = 'jws'
}

export enum AcceptJwzMode {
  authV2 = 'authV2',
  authV3 = 'authV3'
}

export type AcceptProfile = {
  protocolVersion?: AcceptProtocolVersion[];
  authMode?: AcceptAuthMode[];
  jwzMode?: AcceptJwzMode[];
};
