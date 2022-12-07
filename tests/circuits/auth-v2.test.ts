import { AuthV2PubSignals } from './../../src/circuits/auth-v2';
import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { ZERO_HASH, newHashFromString, newHashFromBigInt } from '@iden3/js-merkletree';
import {
  AuthV2Inputs,
  AtomicQueryMTPV2PubSignals,
  prepareCircuitArrayValues
} from '../../src/circuits';
import { IdentityTest, userPK, issuerPK, timestamp, globalTree } from './utils';

import expectedJson from './data/auth-v2-inputs.json';

describe('auth-v2', () => {
  it('TestAuthV2Inputs_InputsMarshal', async () => {
    const challenge = BigInt(10);
    const user = await IdentityTest.newIdentity(userPK);

    const nonce = BigInt(0);
    const user2 = await IdentityTest.newIdentity(issuerPK);

    const gTree = globalTree();

    await gTree.add(user2.id.bigInt(), user2.state().bigInt());
    const globalProof = await gTree.generateProof(user.id.bigInt(), ZERO_HASH);

    const authClaimIncMTP = await user.claimMTPRaw(user.authClaim);
    const authClaimNonRevMTP = await user.claimRevMTPRaw(user.authClaim);

    const signature = user.signBJJ(challenge);
    const inputs = new AuthV2Inputs();

    inputs.genesisID = user.id;
    inputs.profileNonce = nonce;
    inputs.authClaim = user.authClaim;
    inputs.authClaimIncMtp = authClaimIncMTP.proof;
    inputs.authClaimNonRevMtp = authClaimNonRevMTP.proof;
    inputs.treeState = {
      state: user.state(),
      claimsRoot: user.clt.root,
      revocationRoot: user.ret.root,
      rootOfRoots: user.rot.root
    };
    inputs.signature = signature;
    inputs.challenge = challenge;
    inputs.gistProof = {
      root: gTree.root,
      proof: globalProof.proof
    };

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(new TextDecoder().decode(bytesInputs));

    expect(actualJson).toEqual(expectedJson);
  });

  it('TestAtomicQueryMTPV2Outputs_CircuitUnmarshal', () => {
    const out = new AtomicQueryMTPV2PubSignals();
    out.pubSignalsUnmarshal(
      new TextEncoder().encode(
        `[
   "0",
   "19104853439462320209059061537253618984153217267677512271018416655565783041",
   "23",
   "23528770672049181535970744460798517976688641688582489375761566420828291073",
   "5687720250943511874245715094520098014548846873346473635855112185560372332782",
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

    const expValue = prepareCircuitArrayValues([BigInt(10)], 64);

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
    expect(exp).toEqual(out);
  });

  it(' TestAuthV2Circuit_CircuitUnmarshal', () => {
    // generate mock Data.
    const intID = BigInt(
      '19224224881555258540966250468059781351205177043309252290095510834143232000'
    );
    const identifier = Id.fromBigInt(intID);

    const challenge = BigInt(1);

    const stateInt = BigInt(
      '18656147546666944484453899241916469544090258810192803949522794490493271005313'
    );
    const state = newHashFromBigInt(stateInt);

    const out = [identifier.bigInt().toString(), challenge.toString(), state.bigInt().toString()];
    const bytesOut = new TextEncoder().encode(JSON.stringify(out));

    const ao = new AuthV2PubSignals().pubSignalsUnmarshal(bytesOut);
    expect(challenge).toEqual(ao.challenge);
    expect(state.bigInt().toString()).toEqual(ao.GISTRoot.bigInt().toString());
    expect(identifier).toEqual(ao.userID);
  });
});
