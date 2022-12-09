import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { newHashFromString } from '@iden3/js-merkletree';
import {
  AtomicQuerySigV2Inputs,
  AtomicQuerySigV2PubSignals,
  Operators,
  prepareCircuitArrayValues,
  Query
} from '../../src/circuits';
import {
  IdentityTest,
  userPK,
  issuerPK,
  defaultUserClaim,
  timestamp,
  prepareIntArray
} from './utils';

import expectedJson from './data/sig-v2-inputs.json';

describe('atomic-query-sig-v2', () => {
  it('TestAttrQuerySigV2_PrepareInputs', async () => {
    const user = await IdentityTest.newIdentity(userPK);
    const issuer = await IdentityTest.newIdentity(issuerPK);

    const nonce = BigInt(0);

    const subjectID = user.id;
    const nonceSubject = BigInt(0);

    const claim = defaultUserClaim(subjectID);

    const claimSig = await issuer.signClaim(claim);

    const issuerClaimNonRevMtp = await issuer.claimRevMTPRaw(claim);

    const issuerAuthClaimNonRevMtp = await issuer.claimRevMTPRaw(issuer.authClaim);
    const issuerAuthClaimMtp = await issuer.claimMTPRaw(issuer.authClaim);

    const inputs = new AtomicQuerySigV2Inputs();

    inputs.requestID = BigInt(23);
    inputs.id = user.id;
    inputs.profileNonce = nonce;
    inputs.claimSubjectProfileNonce = nonceSubject;
    inputs.claim = {
      issuerID: issuer.id,
      claim: claim,
      nonRevProof: {
        treeState: {
          state: issuer.state(),
          claimsRoot: issuer.clt.root,
          revocationRoot: issuer.ret.root,
          rootOfRoots: issuer.rot.root
        },
        proof: issuerClaimNonRevMtp.proof
      },
      signatureProof: {
        signature: claimSig,
        issuerAuthClaim: issuer.authClaim,
        issuerAuthIncProof: {
          treeState: {
            state: issuer.state(),
            claimsRoot: issuer.clt.root,
            revocationRoot: issuer.ret.root,
            rootOfRoots: issuer.rot.root
          },
          proof: issuerAuthClaimMtp.proof
        },
        issuerAuthNonRevProof: {
          treeState: {
            state: issuer.state(),
            claimsRoot: issuer.clt.root,
            revocationRoot: issuer.ret.root,
            rootOfRoots: issuer.rot.root
          },
          proof: issuerAuthClaimNonRevMtp.proof
        }
      }
    };

    const query = new Query();
    query.operator = Operators.EQ;
    query.slotIndex = 2;
    query.values = prepareIntArray([BigInt(10)], 64);
    inputs.query = query;
    inputs.currentTimeStamp = timestamp;

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(new TextDecoder().decode(bytesInputs));

    expect(actualJson).toEqual(expectedJson);
  });

  it('TestAtomicQuerySigOutputs_CircuitUnmarshal', () => {
    const out = new AtomicQuerySigV2PubSignals();
    out.pubSignalsUnmarshal(
      new TextEncoder().encode(
        `[
            "0",
            "19104853439462320209059061537253618984153217267677512271018416655565783041",
            "12035569423371053239461605003190702990928630784475264346060457607843543656590",
            "23",
            "23528770672049181535970744460798517976688641688582489375761566420828291073",
            "12035569423371053239461605003190702990928630784475264346060457607843543656590",
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

    const expValue = prepareCircuitArrayValues([BigInt(10)], 64);

    const exp = new AtomicQuerySigV2PubSignals();
    exp.requestID = BigInt(23);
    exp.userID = Id.fromBigInt(
      BigInt('19104853439462320209059061537253618984153217267677512271018416655565783041')
    );
    exp.issuerID = Id.fromBigInt(
      BigInt('23528770672049181535970744460798517976688641688582489375761566420828291073')
    );
    exp.issuerAuthState = newHashFromString(
      '12035569423371053239461605003190702990928630784475264346060457607843543656590'
    );
    exp.issuerClaimNonRevState = newHashFromString(
      '12035569423371053239461605003190702990928630784475264346060457607843543656590'
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
    expect(exp).toEqual(out);
  });
});
