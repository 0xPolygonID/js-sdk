import { expect } from 'chai';
import {
  AcceptAuthMode,
  AcceptJwzMode,
  AcceptProfile,
  AcceptProtocolVersion,
  buildAcceptProfile,
  isAcceptProfileSupported,
  parseAcceptProfile
} from '../../src';
describe.only('accept profile utils test', () => {
  it('test build/parse', async () => {
    const acceptProfileParams = {
      protocolVersion: AcceptProtocolVersion.iden3commV1,
      authMode: [AcceptAuthMode.jsw],
      jwzMode: [AcceptJwzMode.authV2, AcceptJwzMode.authV3]
    };

    const expectedAcceptProfile = 'iden3comm/v1;auth=jws;jwz=authV2,authV3';

    const acceptProfile = buildAcceptProfile(
      acceptProfileParams.protocolVersion,
      acceptProfileParams.authMode,
      acceptProfileParams.jwzMode
    );

    expect(acceptProfile).to.be.eq(expectedAcceptProfile);
    const { protocolVersion, authMode, jwzMode } = parseAcceptProfile(acceptProfile);
    expect(protocolVersion).to.be.deep.eq(acceptProfileParams.protocolVersion);
    expect(authMode).to.be.deep.eq(acceptProfileParams.authMode);
    expect(jwzMode).to.be.deep.eq(acceptProfileParams.jwzMode);
  });

  it('not supported protocol version', async () => {
    const expectedAcceptProfile = 'iden3commm/v1;auth=jws;jwz=authV2,authV3';
    expect(() => parseAcceptProfile(expectedAcceptProfile)).to.throw(
      `Protocol version 'iden3commm/v1' not supported`
    );
  });

  it('not supported auth mode', async () => {
    const acceptProfile = 'iden3comm/v1;auth=jwt';
    expect(() => parseAcceptProfile(acceptProfile)).to.throw(`Auth mode 'jwt' not supported`);
  });

  it('not supported jwz mode', async () => {
    const acceptProfile = 'iden3comm/v1;jwz=authV2,authV3,authV3.5';
    expect(() => parseAcceptProfile(acceptProfile)).to.throw(`Jwz mode 'authV3.5' not supported`);
  });

  it('build with empty auth mode', async () => {
    const acceptProfile = buildAcceptProfile(
      AcceptProtocolVersion.iden3commV1,
      [],
      [AcceptJwzMode.authV2]
    );
    expect(acceptProfile).to.be.eq('iden3comm/v1;jwz=authV2');
  });

  it('build with empty jwz mode', async () => {
    const acceptProfile = buildAcceptProfile(
      AcceptProtocolVersion.iden3commV1,
      [AcceptAuthMode.jsw],
      []
    );
    expect(acceptProfile).to.be.eq('iden3comm/v1;auth=jws');
  });

  it('build with empty jwz mode and auth', async () => {
    const acceptProfile = buildAcceptProfile(AcceptProtocolVersion.iden3commV1, [], []);
    expect(acceptProfile).to.be.eq('iden3comm/v1');
  });

  it('parse with only protocol version', async () => {
    const acceptProfile = 'iden3comm/v1';
    const { protocolVersion, authMode, jwzMode } = parseAcceptProfile(acceptProfile);
    expect(protocolVersion).to.be.eq(AcceptProtocolVersion.iden3commV1);
    expect(authMode).to.be.deep.eq([]);
    expect(jwzMode).to.be.deep.eq([]);
  });

  it('parse with auth mode', async () => {
    const acceptProfile = 'iden3comm/v1;auth=jws';
    const { protocolVersion, authMode, jwzMode } = parseAcceptProfile(acceptProfile);
    expect(protocolVersion).to.be.eq(AcceptProtocolVersion.iden3commV1);
    expect(authMode).to.be.deep.eq([AcceptAuthMode.jsw]);
    expect(jwzMode).to.be.deep.eq([]);
  });

  it('parse with jwz mode', async () => {
    const acceptProfile = 'iden3comm/v1;jwz=authV2, authV3';
    const { protocolVersion, authMode, jwzMode } = parseAcceptProfile(acceptProfile);
    expect(protocolVersion).to.be.eq(AcceptProtocolVersion.iden3commV1);
    expect(authMode).to.be.deep.eq([]);
    expect(jwzMode).to.be.deep.eq([AcceptJwzMode.authV2, AcceptJwzMode.authV3]);
  });

  it('supported profile', async () => {
    const accept = ['iden3comm/v1;jwz=authV3'];
    const acceptProfile: AcceptProfile = {
      jwzMode: [AcceptJwzMode.authV3]
    };
    expect(isAcceptProfileSupported(accept, acceptProfile)).to.be.true;
  });
});
