import { AuthV2PubSignals } from './../../src/circuits/auth-v2';
import { Id } from '@iden3/js-iden3-core';
import { newHashFromBigInt } from '@iden3/js-merkletree';
import { AuthV2Inputs } from '../../src/circuits';
import { IdentityTest, userPK, issuerPK, globalTree } from './utils';
import expectedJson from './data/auth-v2-inputs.json';
import { expect } from 'chai';

describe('auth-v2', () => {
  it('TestAuthV2Inputs_InputsMarshal', async () => {
    const challenge = BigInt(10);
    const user = await IdentityTest.newIdentity(userPK);

    const nonce = BigInt(0);
    const user2 = await IdentityTest.newIdentity(issuerPK);

    const gTree = globalTree();

    await gTree.add(user2.id.bigInt(), user2.state().bigInt());
    const globalProof = await gTree.generateProof(user.id.bigInt());

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

    expect(actualJson).to.deep.equal(expectedJson);
  });

  it('authV2Outputs_CircuitUnmarshal', () => {
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

    const out = new TextEncoder().encode(
      JSON.stringify([
        identifier.bigInt().toString(),
        challenge.toString(),
        state.bigInt().toString()
      ])
    );

    const ao = new AuthV2PubSignals();
    ao.pubSignalsUnmarshal(out);
    expect(challenge.toString()).to.deep.equal(ao.challenge.toString());
    expect(state.bigInt().toString()).to.deep.equal(ao.GISTRoot.bigInt().toString());
    expect(identifier.string()).to.deep.equal(ao.userID.string());
  });
});
