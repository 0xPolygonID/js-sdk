import { expect } from 'chai';
import {
  CoreClaimOptions,
  MerklizedRootPosition,
  Parser,
  SubjectPosition,
  W3CCredential
} from '../../src';
import nonMerklized1 from './data/jsonld/non-merklized-1.json';
import credentialsV1 from './data/jsonld/credentials-v1.json';
import schemaDeliveryAddress from './data/jsonld/schema-delivery-address.json';
import credentialMerklized from './data/credential-merklized.json';
import { DocumentLoader, Path, getDocumentLoader } from '@iden3/js-jsonld-merklization';
import { RemoteDocument, Url } from 'jsonld/jsonld-spec';
import { DID } from '@iden3/js-iden3-core';

describe.only('schema-processor/parser', () => {
  const documentLoader: DocumentLoader = async (url: Url) => {
    if (url === 'https://www.w3.org/2018/credentials/v1') {
      return { document: credentialsV1 } as unknown as RemoteDocument;
    }
    if (url === 'https://example.com/schema-delivery-address.json-ld') {
      return { document: schemaDeliveryAddress } as unknown as RemoteDocument;
    }
    return getDocumentLoader()(url);
  };

  it('TestParser_parseSlots', async () => {
    const credential: W3CCredential = Object.assign(new W3CCredential(), nonMerklized1);

    const nullSlot = new Uint8Array(32);

    const mz = await credential.merklize({ documentLoader });

    const credentialType = Parser.findCredentialType(mz);

    const { slots, nonMerklized } = await Parser.parseSlots(mz, credential, credentialType);
    expect(nonMerklized).to.be.true;
    expect(nullSlot).not.to.deep.eq(slots.indexA);
    expect(nullSlot).to.deep.eq(slots.indexB);
    expect(nullSlot).to.deep.eq(slots.valueA);
    expect(nullSlot).not.to.deep.eq(slots.valueB);
  });

  describe('TestGetSerializationAttr', () => {
    const vc = Object.assign(new W3CCredential(), {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://example.com/schema-delivery-address.json-ld'
      ]
    });

    it('by type name', async () => {
      const serAttr = await Parser.getSerializationAttr(
        vc,
        { documentLoader },
        'DeliverAddressMultiTestForked'
      );

      expect(serAttr).to.equal(
        'iden3:v1:slotIndexA=price&slotValueB=postalProviderInformation.insured'
      );
    });

    it('by type id', async () => {
      const serAttr = await Parser.getSerializationAttr(
        vc,
        { documentLoader },
        'urn:uuid:ac2ede19-b3b9-454d-b1a9-a7b3d5763100'
      );
      expect(serAttr).to.equal(
        'iden3:v1:slotIndexA=price&slotValueB=postalProviderInformation.insured'
      );
    });

    it('unknown type', async () => {
      const serAttr = await Parser.getSerializationAttr(vc, { documentLoader }, 'bla-bla');
      expect(serAttr).to.equal('');
    });
  });

  it('TestParser_ParseClaimWithDataSlots', async () => {
    const credential: W3CCredential = Object.assign(new W3CCredential(), nonMerklized1);

    const opts: CoreClaimOptions = {
      revNonce: 127366661,
      version: 0,
      subjectPosition: SubjectPosition.Index,
      merklizedRootPosition: MerklizedRootPosition.None,
      updatable: true,
      merklizeOpts: { documentLoader }
    };

    const claim = await Parser.parseClaim(credential, opts);

    const { index, value } = claim.rawSlots();

    expect(index[2].bytes).not.to.deep.eq(new Uint8Array(32));
    expect(index[3].bytes).to.deep.eq(new Uint8Array(32));

    expect(value[2].bytes).to.deep.eq(new Uint8Array(32));
    expect(value[3].bytes).not.to.deep.eq(new Uint8Array(32));

    expect(() => claim.getId()).to.throw('ID is not set');
    expect(claim.getFlagUpdatable()).to.be.true;

    expect(claim.getExpirationDate()).to.be.null;
  });

  it('TestParser_ParseClaimWithMerklizedRoot', async () => {
    const credential: W3CCredential = Object.assign(new W3CCredential(), credentialMerklized);

    const opts: CoreClaimOptions = {
      revNonce: 127366661,
      version: 0,
      subjectPosition: SubjectPosition.Index,
      merklizedRootPosition: MerklizedRootPosition.Index,
      updatable: true,
      merklizeOpts: { documentLoader }
    };
    const claim = await Parser.parseClaim(credential, opts);

    const { index, value } = claim.rawSlots();

    expect(index[2].bytes).not.to.deep.eq(new Uint8Array(32));
    expect(index[3].bytes).to.deep.eq(new Uint8Array(32));

    expect(value[2].bytes).to.deep.eq(new Uint8Array(32));
    expect(value[3].bytes).to.deep.eq(new Uint8Array(32));

    const did = credential.credentialSubject['id'];
    const idFromClaim = claim.getId();
    const didFromClaim = DID.parseFromId(idFromClaim);

    expect(did).to.eq(didFromClaim.string());
    expect(opts.updatable).to.eq(claim.getFlagUpdatable());

    const exp = claim.getExpirationDate();
    expect(exp?.toISOString()).to.eq(credential.expirationDate);

    // get root
    const root = index[2];
    root.toBigInt();

    const path = new Path([
      'https://www.w3.org/2018/credentials#credentialSubject',
      'https://github.com/iden3/claim-schema-vocab/blob/main/credentials/kyc.md#birthday'
    ]);

    const mk = await credential.merklize();

    const { proof, value: v } = await mk.proof(path);
    expect(v).not.to.be.undefined;
    expect(v).not.to.be.null;
    expect(proof.existence).to.be.true;
  });
});
