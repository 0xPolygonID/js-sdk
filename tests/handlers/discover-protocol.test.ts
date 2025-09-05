import { describe, expect, it, beforeEach } from 'vitest';
import {
  DiscoverFeatureQueriesMessage,
  DiscoverFeatureQueryType,
  DiscoveryProtocolFeatureType,
  IPackageManager,
  JWSPacker,
  KMS,
  PackageManager,
  PlainPacker,
  ZKPPacker
} from '../../src';
import {
  DiscoveryProtocolHandler,
  createDiscoveryFeatureQueryMessage
} from '../../src/iden3comm/handlers/discovery-protocol';
import { DIDResolutionResult } from 'did-resolver';
import { PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { initZKPPacker } from '../iden3comm/mock/proving';

describe('discovery-protocol', () => {
  let acceptQueryMessage: DiscoverFeatureQueriesMessage;
  let jwsPacker: JWSPacker;
  let zkpPacker: ZKPPacker;
  let plainPacker: PlainPacker;

  beforeEach(async () => {
    jwsPacker = new JWSPacker(new KMS(), {
      resolve: () => Promise.resolve({ didDocument: {} } as DIDResolutionResult)
    });

    zkpPacker = await initZKPPacker({ alg: 'groth16' });
    plainPacker = new PlainPacker();
    acceptQueryMessage = createDiscoveryFeatureQueryMessage([
      { [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Accept }
    ]);
  });

  it('plain message accept disclosures', async () => {
    const packageManager: IPackageManager = new PackageManager();
    packageManager.registerPackers([plainPacker]);
    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager
    });

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(acceptQueryMessage);
    expect(disclosures.length).to.be.eq(1);
    expect(disclosures[0][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Accept
    );
    expect(disclosures[0].id).to.be.eq('iden3comm/v1;env=application/iden3comm-plain-json');
  });

  it('jws and plain message accept disclosures', async () => {
    const packageManager: IPackageManager = new PackageManager();
    packageManager.registerPackers([new PlainPacker(), plainPacker, jwsPacker]);

    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager
    });

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(acceptQueryMessage);
    expect(disclosures.length).to.be.eq(2);

    expect(disclosures[0][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Accept
    );
    expect(disclosures[1][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Accept
    );
    const disclosureIds = disclosures.map((d) => d.id);
    expect(disclosureIds).to.include('iden3comm/v1;env=application/iden3comm-plain-json');
    expect(disclosureIds).to.include(
      'iden3comm/v1;env=application/iden3comm-signed-json;alg=ES256K,ES256K-R'
    );
  });

  it('zkp and plain message accept disclosures', async () => {
    const packageManager: IPackageManager = new PackageManager();
    packageManager.registerPackers([new PlainPacker(), plainPacker, zkpPacker]);
    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager
    });

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(acceptQueryMessage);
    expect(disclosures.length).to.be.eq(2);

    expect(disclosures[0][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Accept
    );
    expect(disclosures[1][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Accept
    );
    const disclosureIds = disclosures.map((d) => d.id);
    expect(disclosureIds).to.include('iden3comm/v1;env=application/iden3comm-plain-json');
    expect(disclosureIds).to.include(
      'iden3comm/v1;env=application/iden3-zkp-json;alg=groth16;circuitIds=authV2'
    );
  });

  it('zkp, jws and plain message accept disclosures', async () => {
    const packageManager: IPackageManager = new PackageManager();
    packageManager.registerPackers([new PlainPacker(), plainPacker, zkpPacker, jwsPacker]);
    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager
    });

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(acceptQueryMessage);
    expect(disclosures.length).to.be.eq(3);

    expect(disclosures[0][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Accept
    );
    expect(disclosures[1][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Accept
    );
    expect(disclosures[2][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Accept
    );
    const disclosureIds = disclosures.map((d) => d.id);
    expect(disclosureIds).to.include('iden3comm/v1;env=application/iden3comm-plain-json');
    expect(disclosureIds).to.include(
      'iden3comm/v1;env=application/iden3-zkp-json;alg=groth16;circuitIds=authV2'
    );
    expect(disclosureIds).to.include(
      'iden3comm/v1;env=application/iden3comm-signed-json;alg=ES256K,ES256K-R'
    );
  });

  it('zkp, jws and plain message accept disclosures with exact match', async () => {
    const packageManager: IPackageManager = new PackageManager();
    packageManager.registerPackers([new PlainPacker(), plainPacker, zkpPacker, jwsPacker]);
    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager
    });

    const acceptQueryMessageWithMatch = createDiscoveryFeatureQueryMessage([
      {
        [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Accept,
        match: 'iden3comm/v1;env=application/iden3-zkp-json;alg=groth16;circuitIds=authV2'
      }
    ]);

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(acceptQueryMessageWithMatch);
    expect(disclosures.length).to.be.eq(1);

    expect(disclosures[0][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Accept
    );
    expect(disclosures[0].id).to.include(
      'iden3comm/v1;env=application/iden3-zkp-json;alg=groth16;circuitIds=authV2'
    );
  });

  it('feature-type: protocol with protocol version match', async () => {
    const packageManager: IPackageManager = new PackageManager();
    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager,
      protocols: [
        PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
        PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE
      ]
    });

    const protocolQueryMessage = createDiscoveryFeatureQueryMessage([
      {
        [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Protocol,
        match: 'https://iden3-communication.io/authorization/1.*'
      }
    ]);

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(protocolQueryMessage);
    expect(disclosures.length).to.be.eq(2);
    expect(disclosures[0][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Protocol
    );
    expect(disclosures[1][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Protocol
    );
    const disclosureIds = disclosures.map((d) => d.id);
    expect(disclosureIds).to.include(PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE);
    expect(disclosureIds).to.include(PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE);
  });

  it('feature-type: protocol and goal-code with protocol version match', async () => {
    const packageManager: IPackageManager = new PackageManager();
    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager,
      protocols: [
        PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
        PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE
      ],
      goalCodes: ['unit.testing.some.goal-code']
    });

    const protocolQueryMessage = createDiscoveryFeatureQueryMessage([
      {
        [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Protocol,
        match: 'https://iden3-communication.io/authorization/1.*'
      },
      {
        [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.GoalCode,
        match: 'unit.testing.*'
      }
    ]);

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(protocolQueryMessage);
    expect(disclosures.length).to.be.eq(3);
    expect(disclosures[0][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Protocol
    );
    expect(disclosures[1][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Protocol
    );
    expect(disclosures[2][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.GoalCode
    );
    const disclosureIds = disclosures.map((d) => d.id);
    expect(disclosureIds).to.include(PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE);
    expect(disclosureIds).to.include(PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE);
    expect(disclosureIds).to.include('unit.testing.some.goal-code');
  });

  it('feature-type: header', async () => {
    const packageManager: IPackageManager = new PackageManager();
    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager
    });

    const protocolQueryMessage = createDiscoveryFeatureQueryMessage([
      {
        [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Header,
        match: 'expires_time'
      }
    ]);

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(protocolQueryMessage);
    expect(disclosures.length).to.be.eq(1);
    expect(disclosures[0][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Header
    );
    expect(disclosures[0].id).to.be.eq('expires_time');
  });

  it('feature-type: protocol with protocol version mismatch', async () => {
    const packageManager: IPackageManager = new PackageManager();
    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager,
      protocols: [
        PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
        PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE
      ]
    });

    const protocolQueryMessage = createDiscoveryFeatureQueryMessage([
      {
        [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Protocol,
        match: 'https://iden3-communication.io/authorization/44.*'
      }
    ]);

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(protocolQueryMessage);
    expect(disclosures.length).to.be.eq(0);
  });

  it('feature-type: protocol and accept', async () => {
    const packageManager: IPackageManager = new PackageManager();
    packageManager.registerPackers([plainPacker]);
    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager,
      protocols: [
        PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE,
        PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE
      ]
    });

    const protocolQueryMessage = createDiscoveryFeatureQueryMessage([
      { [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Accept },
      { [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Protocol }
    ]);

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(protocolQueryMessage);
    expect(disclosures.length).to.be.eq(3);
    expect(disclosures[0][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Accept
    );
    expect(disclosures[1][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Protocol
    );
    expect(disclosures[2][DiscoverFeatureQueryType.FeatureType]).to.be.eq(
      DiscoveryProtocolFeatureType.Protocol
    );
    const disclosureIds = disclosures.map((d) => d.id);
    expect(disclosureIds).to.include('iden3comm/v1;env=application/iden3comm-plain-json');
    expect(disclosureIds).to.include(PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE);
    expect(disclosureIds).to.include(PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE);
  });

  it('feature-type: empty headers', async () => {
    const packageManager: IPackageManager = new PackageManager();
    packageManager.registerPackers([plainPacker]);
    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager,
      headers: []
    });

    const protocolQueryMessage = createDiscoveryFeatureQueryMessage([
      { [DiscoverFeatureQueryType.FeatureType]: DiscoveryProtocolFeatureType.Header }
    ]);

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(protocolQueryMessage);
    expect(disclosures.length).to.be.eq(0);
  });
});
