import { Id } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';
import { AuthV3Inputs, AuthV3PubSignals } from '../../src/circuits';
import { IdentityTest, userPK, issuerPK, globalTree } from './utils';
import expectedJsonAuthV3 from './data/auth-v3-inputs.json';
import expectedJsonAuthV3_8_32 from './data/auth-v3-8-32-inputs.json';
import { describe, expect, it } from 'vitest';
import { byteDecoder, byteEncoder } from '../../src';

describe('auth-v3', () => {
  it('TestAuthV3Inputs_InputsMarshal', async () => {
    const challenge = BigInt(10);
    const user = await IdentityTest.newIdentity(userPK);

    const nonce = BigInt(0);
    const user2 = await IdentityTest.newIdentity(issuerPK);

    const gTree = globalTree();

    await gTree.add(user2.id.bigInt(), (await user2.state()).bigInt());
    const globalProof = await gTree.generateProof(user.id.bigInt());

    const authClaimIncMTP = await user.claimMTPRaw(user.authClaim);
    const authClaimNonRevMTP = await user.claimRevMTPRaw(user.authClaim);

    const signature = user.signBJJ(challenge);
    const inputs = new AuthV3Inputs();

    inputs.genesisID = user.id;
    inputs.profileNonce = nonce;
    inputs.authClaim = user.authClaim;
    inputs.authClaimIncMtp = authClaimIncMTP.proof;
    inputs.authClaimNonRevMtp = authClaimNonRevMTP.proof;
    inputs.treeState = {
      state: await user.state(),
      claimsRoot: await user.clt.root(),
      revocationRoot: await user.ret.root(),
      rootOfRoots: await user.rot.root()
    };
    inputs.signature = signature;
    inputs.challenge = challenge;
    inputs.gistProof = {
      root: await gTree.root(),
      proof: globalProof.proof
    };

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));

    expect(actualJson).to.deep.equal(expectedJsonAuthV3);
  });

  it('authV3Outputs_CircuitUnmarshal', () => {
    // generate mock Data.
    const intID = BigInt(
      '19224224881555258540966250468059781351205177043309252290095510834143232000'
    );
    const identifier = Id.fromBigInt(intID);

    const challenge = BigInt(1);

    const stateInt = BigInt(
      '18656147546666944484453899241916469544090258810192803949522794490493271005313'
    );
    const state = Hash.fromBigInt(stateInt);

    const out = byteEncoder.encode(
      JSON.stringify([
        identifier.bigInt().toString(),
        challenge.toString(),
        state.bigInt().toString()
      ])
    );

    const ao = new AuthV3PubSignals();
    ao.pubSignalsUnmarshal(out);
    expect(challenge.toString()).to.deep.equal(ao.challenge.toString());
    expect(state.bigInt().toString()).to.deep.equal(ao.GISTRoot.bigInt().toString());
    expect(identifier.string()).to.deep.equal(ao.userID.string());
  });
});

describe('auth-v3-8-32', () => {
  it('TestAuthV3Inputs_InputsMarshal', async () => {
    const challenge = BigInt(10);
    const user = await IdentityTest.newIdentity(userPK);

    const nonce = BigInt(0);
    const user2 = await IdentityTest.newIdentity(issuerPK);

    const gTree = globalTree();

    await gTree.add(user2.id.bigInt(), (await user2.state()).bigInt());
    const globalProof = await gTree.generateProof(user.id.bigInt());

    const authClaimIncMTP = await user.claimMTPRaw(user.authClaim);
    const authClaimNonRevMTP = await user.claimRevMTPRaw(user.authClaim);

    const signature = user.signBJJ(challenge);
    const inputs = new AuthV3Inputs();
    // set the mtLevel and maxValueArraySize to 8 and 32 respectively for auth-v3-8-32.circuit
    inputs.mtLevel = 8;
    inputs.mtLevelOnChain = 32;

    inputs.genesisID = user.id;
    inputs.profileNonce = nonce;
    inputs.authClaim = user.authClaim;
    inputs.authClaimIncMtp = authClaimIncMTP.proof;
    inputs.authClaimNonRevMtp = authClaimNonRevMTP.proof;
    inputs.treeState = {
      state: await user.state(),
      claimsRoot: await user.clt.root(),
      revocationRoot: await user.ret.root(),
      rootOfRoots: await user.rot.root()
    };
    inputs.signature = signature;
    inputs.challenge = challenge;
    inputs.gistProof = {
      root: await gTree.root(),
      proof: globalProof.proof
    };

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));

    expect(actualJson).to.deep.equal(expectedJsonAuthV3_8_32);
  });

  it('authV3Outputs_CircuitUnmarshal', () => {
    // generate mock Data.
    const intID = BigInt(
      '19224224881555258540966250468059781351205177043309252290095510834143232000'
    );
    const identifier = Id.fromBigInt(intID);

    const challenge = BigInt(1);

    const stateInt = BigInt(
      '18656147546666944484453899241916469544090258810192803949522794490493271005313'
    );
    const state = Hash.fromBigInt(stateInt);

    const out = byteEncoder.encode(
      JSON.stringify([
        identifier.bigInt().toString(),
        challenge.toString(),
        state.bigInt().toString()
      ])
    );

    const ao = new AuthV3PubSignals();
    ao.pubSignalsUnmarshal(out);
    expect(challenge.toString()).to.deep.equal(ao.challenge.toString());
    expect(state.bigInt().toString()).to.deep.equal(ao.GISTRoot.bigInt().toString());
    expect(identifier.string()).to.deep.equal(ao.userID.string());
  });
});
