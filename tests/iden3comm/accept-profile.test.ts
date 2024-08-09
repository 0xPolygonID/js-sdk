import { expect } from 'chai';
import { parseAcceptProfile, buildAccept } from '../../src/iden3comm/utils/accept-profile';
import {
  ProtocolVersion,
  MediaType,
  AcceptAuthCircuits,
  AcceptJwzAlgorithms,
  AcceptJwsAlgorithms
} from '../../src/iden3comm/constants';

describe('accept profile utils test', () => {
  it('parse accept profile', async () => {
    const accept = [
      'iden3comm/v1;env=application/iden3-zkp-json;circuits=authV2,authV3;alg=groth16',
      'iden3comm/v1;env=application/iden3comm-signed-json;alg=ES256K-R'
    ];

    const { protocolVersion, env, circuits, alg } = parseAcceptProfile(accept[0]);
    expect(protocolVersion).to.be.eq('iden3comm/v1');
    expect(env).to.be.eq('application/iden3-zkp-json');
    expect(circuits).to.be.deep.eq(['authV2', 'authV3']);
    expect(alg).to.be.deep.eq(['groth16']);
  });

  it('build accept profile', async () => {
    const expectedAccept = [
      'iden3comm/v1;env=application/iden3-zkp-json;circuits=authV2,authV3;alg=groth16',
      'iden3comm/v1;env=application/iden3comm-signed-json;alg=ES256K-R'
    ];

    const accept = buildAccept([
      {
        protocolVersion: ProtocolVersion.v1,
        env: MediaType.ZKPMessage,
        circuits: [AcceptAuthCircuits.authV2, AcceptAuthCircuits.authV3],
        alg: [AcceptJwzAlgorithms.groth16]
      },
      {
        protocolVersion: ProtocolVersion.v1,
        env: MediaType.SignedMessage,
        alg: [AcceptJwsAlgorithms.ES256KR]
      }
    ]);
    expect(expectedAccept).to.be.deep.eq(accept);
  });

  it('not supported protocol version', async () => {
    const expectedAcceptProfile =
      'iden3comm/v0.1;env=application/iden3-zkp-json;circuits=authV2,authV3;alg=groth16';
    expect(() => parseAcceptProfile(expectedAcceptProfile)).to.throw(
      `Protocol version 'iden3comm/v0.1' not supported`
    );
  });

  it('not supported envelop', async () => {
    const acceptProfile = 'iden3comm/v1;env=application/iden3-zkt-json';
    expect(() => parseAcceptProfile(acceptProfile)).to.throw(
      `Envelop 'application/iden3-zkt-json' not supported`
    );
  });

  it('invalid alg for jwz', async () => {
    const acceptProfile = 'iden3comm/v1;env=application/iden3-zkp-json;alg=ES256K-R';
    expect(() => parseAcceptProfile(acceptProfile)).to.throw(
      `Algorithm 'ES256K-R' not supported for 'application/iden3-zkp-json`
    );
  });

  it('circuits for jws', async () => {
    const acceptProfile = 'iden3comm/v1;env=application/iden3comm-signed-json;circuits=authV2';
    expect(() => parseAcceptProfile(acceptProfile)).to.throw(
      `Circuits not supported for env 'application/iden3comm-signed-json'`
    );
  });
});
