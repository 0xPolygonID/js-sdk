import { Id } from '@iden3/js-iden3-core';
import { LinkedNullifierInputs, LinkedNullifierPubSignals } from '../../src/circuits';
import { IdentityTest, defaultUserClaim, userPK } from './utils';
import expectedJson from './data/linked-nullifier-inputs.json';
import { expect } from 'chai';
import { byteDecoder, byteEncoder } from '../../src';

describe('linked-nullifier', () => {
  it('TestLinkedNullifierInputs_InputsMarshal', async () => {
    const user = await IdentityTest.newIdentity(userPK);
    const id = user.id;
    const claim = defaultUserClaim(id);

    const inputs = new LinkedNullifierInputs();
    inputs.linkNonce = BigInt('35346346369657418');
    inputs.issuerClaim = claim;
    inputs.id = user.id;
    inputs.claimSubjectProfileNonce = BigInt('21313111');
    inputs.verifierID = Id.fromBigInt(
      BigInt('21929109382993718606847853573861987353620810345503358891473103689157378049')
    );
    inputs.verifierSessionID = BigInt(322215);

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));
    expect(actualJson).to.deep.equal(expectedJson);
  });

  it('LinkedNullifierPubSignals_CircuitUnmarshal', () => {
    // generate mock Data.
    const nullifier = BigInt(1233342);
    const linkID = BigInt(565429123812);
    const verifierID = Id.fromBigInt(
      BigInt('21929109382993718606847853573861987353620810345503358891473103689157378049')
    );
    const verifierSessionID = BigInt(2033444042);

    const out = byteEncoder.encode(
      JSON.stringify([
        nullifier.toString(),
        linkID.toString(),
        verifierID.bigInt().toString(),
        verifierSessionID.toString()
      ])
    );

    const ao = new LinkedNullifierPubSignals();
    ao.pubSignalsUnmarshal(out);
    expect(nullifier.toString()).to.deep.equal(ao.nullifier.toString());
    expect(linkID.toString()).to.deep.equal(ao.linkID.toString());
    expect(verifierID.string()).to.deep.equal(ao.verifierID.string());
    expect(verifierSessionID.toString()).to.deep.equal(ao.verifierSessionID.toString());
  });
});
