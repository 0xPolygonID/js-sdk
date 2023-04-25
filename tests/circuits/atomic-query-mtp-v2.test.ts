import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { newHashFromString } from '@iden3/js-merkletree';
import {
  AtomicQueryMTPV2Inputs,
  AtomicQueryMTPV2PubSignals,
  Operators,
  prepareCircuitArrayValues,
  Query
} from '../../src/circuits';
import { IdentityTest, userPK, issuerPK, defaultUserClaim, timestamp } from './utils';

import expectedJson from './data/mtp-v2-inputs.json';
import { expect } from 'chai';
import { byteDecoder, byteEncoder } from '../../src';

describe('atomic-query-mtp-v2', () => {
  it('TestAttrQueryMTPV2_PrepareInputs', async () => {
    const user = await IdentityTest.newIdentity(userPK);
    const issuer = await IdentityTest.newIdentity(issuerPK);

    const nonce = BigInt(0);

    const subjectID = user.id;
    const nonceSubject = BigInt(0);

    const claim = defaultUserClaim(subjectID);

    await issuer.addClaim(claim);

    const issuerClaimMtp = await issuer.claimMTPRaw(claim);

    const issuerClaimNonRevMtp = await issuer.claimRevMTPRaw(claim);

    const inputs = new AtomicQueryMTPV2Inputs();

    inputs.requestID = BigInt(23);
    inputs.id = user.id;
    inputs.profileNonce = nonce;
    inputs.claimSubjectProfileNonce = nonceSubject;
    inputs.claim = {
      issuerID: issuer.id,
      claim: claim,
      nonRevProof: {
        treeState: {
          state: await issuer.state(),
          claimsRoot: await issuer.clt.root(),
          revocationRoot: await issuer.ret.root(),
          rootOfRoots: await issuer.rot.root()
        },
        proof: issuerClaimNonRevMtp.proof
      },
      incProof: {
        proof: issuerClaimMtp.proof,
        treeState: {
          state: await issuer.state(),
          claimsRoot: await issuer.clt.root(),
          revocationRoot: await issuer.ret.root(),
          rootOfRoots: await issuer.rot.root()
        }
      }
    };

    const query = new Query();
    query.operator = Operators.EQ;
    query.slotIndex = 2;
    query.values = prepareCircuitArrayValues(Operators.EQ, [BigInt(10)], 64);
    inputs.query = query;
    inputs.currentTimeStamp = timestamp;

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));

    expect(actualJson).to.deep.equal(expectedJson);
  });

  it('TestAttrQueryMTPV2_PrepareInputs NIN operator', async () => {
    const user = await IdentityTest.newIdentity(userPK);
    const issuer = await IdentityTest.newIdentity(issuerPK);

    const nonce = BigInt(0);

    const subjectID = user.id;
    const nonceSubject = BigInt(0);

    const claim = defaultUserClaim(subjectID);

    await issuer.addClaim(claim);

    const issuerClaimMtp = await issuer.claimMTPRaw(claim);

    const issuerClaimNonRevMtp = await issuer.claimRevMTPRaw(claim);

    const inputs = new AtomicQueryMTPV2Inputs();

    inputs.requestID = BigInt(23);
    inputs.id = user.id;
    inputs.profileNonce = nonce;
    inputs.claimSubjectProfileNonce = nonceSubject;
    inputs.claim = {
      issuerID: issuer.id,
      claim: claim,
      nonRevProof: {
        treeState: {
          state: await issuer.state(),
          claimsRoot: await issuer.clt.root(),
          revocationRoot: await issuer.ret.root(),
          rootOfRoots: await issuer.rot.root()
        },
        proof: issuerClaimNonRevMtp.proof
      },
      incProof: {
        proof: issuerClaimMtp.proof,
        treeState: {
          state: await issuer.state(),
          claimsRoot: await issuer.clt.root(),
          revocationRoot: await issuer.ret.root(),
          rootOfRoots: await issuer.rot.root()
        }
      }
    };

    const query = new Query();
    query.operator = Operators.EQ;
    query.slotIndex = 2;
    query.values = prepareCircuitArrayValues(Operators.EQ, [BigInt(10)], 64);
    inputs.query = query;
    inputs.currentTimeStamp = timestamp;

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));

    expect(actualJson).to.deep.equal(expectedJson);
  });

  it('TestAtomicQueryMTPV2Outputs_CircuitUnmarshal', () => {
    const out = new AtomicQueryMTPV2PubSignals();
    out.pubSignalsUnmarshal(
      byteEncoder.encode(
        `[
          "0",
          "19104853439462320209059061537253618984153217267677512271018416655565783041",
          "23",
          "23528770672049181535970744460798517976688641688582489375761566420828291073",
          "5687720250943511874245715094520098014548846873346473635855112185560372332782",
          "1",
          "5687720250943511874245715094520098014548846873346473635855112185560372332782",
          "1642074362",
          "180410020913331409885634153623124536270",
          "0",
          "0",
          "2",
          "1",
          "10",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0"
         ]`
      )
    );

    const expValue = prepareCircuitArrayValues(Operators.EQ, [BigInt(10)], 64);

    const exp = new AtomicQueryMTPV2PubSignals();
    exp.requestID = BigInt(23);
    exp.userID = Id.fromBigInt(
      BigInt('19104853439462320209059061537253618984153217267677512271018416655565783041')
    );
    exp.issuerID = Id.fromBigInt(
      BigInt('23528770672049181535970744460798517976688641688582489375761566420828291073')
    );
    exp.issuerClaimIdenState = newHashFromString(
      '5687720250943511874245715094520098014548846873346473635855112185560372332782'
    );
    exp.issuerClaimNonRevState = newHashFromString(
      '5687720250943511874245715094520098014548846873346473635855112185560372332782'
    );
    exp.claimSchema = SchemaHash.newSchemaHashFromInt(
      BigInt('180410020913331409885634153623124536270')
    );

    exp.slotIndex = 2;
    exp.operator = 1;
    exp.value = expValue;
    exp.timestamp = timestamp;
    exp.merklized = 0;
    exp.claimPathKey = BigInt(0);
    exp.claimPathNotExists = 0;
    exp.isRevocationChecked = 1;
    expect(exp).to.deep.equal(out);
  });
});
