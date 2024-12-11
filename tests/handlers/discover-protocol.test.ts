import { expect } from 'chai';
import {
  DiscoverFeatureQueriesMessage,
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

describe('discovery-protocol', () => {
  let discoveryFeatureQueryMessage: DiscoverFeatureQueriesMessage;
  let jwsPacker: JWSPacker;
  let zkpPacker: ZKPPacker;
  let plainPacker: PlainPacker;

  beforeEach(async () => {
    jwsPacker = new JWSPacker(new KMS(), {
      resolve: () => Promise.resolve({ didDocument: {} } as DIDResolutionResult)
    });

    zkpPacker = new ZKPPacker(new Map(), new Map());
    plainPacker = new PlainPacker();
    discoveryFeatureQueryMessage = createDiscoveryFeatureQueryMessage();
  });

  it('plain message accept disclosures', async () => {
    const packageManager: IPackageManager = new PackageManager();
    packageManager.registerPackers([plainPacker]);
    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager
    });

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(discoveryFeatureQueryMessage);
    expect(disclosures.length).to.be.eq(1);
    expect(disclosures[0]['feature-type']).to.be.eq('accept');
    expect(disclosures[0].accept.length).to.be.eq(1);
    expect(disclosures[0].accept[0]).to.be.eq('env=application/iden3comm-plain-json');
  });

  it('jws and plain message accept disclosures', async () => {
    const packageManager: IPackageManager = new PackageManager();
    packageManager.registerPackers([new PlainPacker(), plainPacker, jwsPacker]);

    const discoveryProtocolHandler = new DiscoveryProtocolHandler({
      packageManager
    });

    const {
      body: { disclosures }
    } = await discoveryProtocolHandler.handleDiscoveryQuery(discoveryFeatureQueryMessage);
    expect(disclosures.length).to.be.eq(1);

    expect(disclosures[0].accept.length).to.be.eq(2);
    expect(disclosures[0]['feature-type']).to.be.eq('accept');
    expect(disclosures[0].accept).to.include('env=application/iden3comm-plain-json');
    expect(disclosures[0].accept).to.include(
      'env=application/iden3comm-signed-json&alg=ES256K,ES256K-R'
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
    } = await discoveryProtocolHandler.handleDiscoveryQuery(discoveryFeatureQueryMessage);
    expect(disclosures.length).to.be.eq(1);

    expect(disclosures[0].accept.length).to.be.eq(2);
    expect(disclosures[0]['feature-type']).to.be.eq('accept');
    expect(disclosures[0].accept).to.include('env=application/iden3comm-plain-json');
    expect(disclosures[0].accept).to.include(
      'env=application/iden3-zkp-json&alg=groth16&circuitIds=authV2'
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
    } = await discoveryProtocolHandler.handleDiscoveryQuery(discoveryFeatureQueryMessage);
    expect(disclosures.length).to.be.eq(1);

    expect(disclosures[0].accept.length).to.be.eq(3);
    expect(disclosures[0]['feature-type']).to.be.eq('accept');
    expect(disclosures[0].accept).to.include('env=application/iden3comm-plain-json');
    expect(disclosures[0].accept).to.include(
      'env=application/iden3-zkp-json&alg=groth16&circuitIds=authV2'
    );
    expect(disclosures[0].accept).to.include(
      'env=application/iden3comm-signed-json&alg=ES256K,ES256K-R'
    );
  });
});
