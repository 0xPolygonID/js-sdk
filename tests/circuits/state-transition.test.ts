import { poseidon } from '@iden3/js-crypto';
import { Id } from '@iden3/js-iden3-core';
import { hashElems, Hash, ZERO_HASH } from '@iden3/js-merkletree';
import { getProperties, TreeState } from '../../src/circuits';

import {
  StateTransitionInputs,
  StateTransitionPubSignals
} from '../../src/circuits/state-transition';
import { generate } from './utils';
import { describe, expect, it, beforeEach } from 'vitest';
import { byteDecoder } from '../../src';

describe('state-transition', () => {
  it('TestStateTransitionOutput_GetJSONObj', () => {
    const id =
      Id.fromBigInt(28042998099552461593195291926480304872594404846081442121556507376347845121n);

    const newState = Hash.fromBigInt(1n);
    const oldState = Hash.fromBigInt(2n);

    const sto = new StateTransitionPubSignals();
    sto.newUserState = newState;
    sto.oldUserState = oldState;
    sto.userId = id;
    sto.isOldStateGenesis = true;

    const m: StateTransitionPubSignals = getProperties(sto) as StateTransitionPubSignals;

    expect(id.bigInt().toString()).to.deep.equal(m.userId.bigInt().toString());
    expect(oldState.bigInt().toString()).to.deep.equal(m.oldUserState.bigInt().toString());
    expect(newState.bigInt().toString()).to.deep.equal(m.newUserState.bigInt().toString());
  });

  it('TestStateTransitionInputs_InputsMarshal', async () => {
    const userPK = '21a5e7321d0e2f3ca1cc6504396e6594a2211544b08c206847cdee96f832421a';

    // Issuer
    const { identity, claimsTree, revTree, authClaim, privateKey } = await generate(userPK);

    const genesisState = await hashElems([
      (await claimsTree.root()).bigInt(),
      (await revTree.root()).bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const genesisTreeState: TreeState = {
      state: genesisState,
      claimsRoot: await claimsTree.root(),
      revocationRoot: await revTree.root(),
      rootOfRoots: ZERO_HASH
    };

    const index = authClaim.hIndex();
    const authMTPProof = await claimsTree.generateProof(index, await claimsTree.root());

    const nonce = authClaim.getRevocationNonce();
    const authNonRevMTPProof = await revTree.generateProof(nonce, await revTree.root());

    // update rev tree
    await revTree.add(BigInt(1), BigInt(0));

    const newState = hashElems([
      (await claimsTree.root()).bigInt(),
      (await revTree.root()).bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const newTreeState: TreeState = {
      state: newState,
      claimsRoot: await claimsTree.root(),
      revocationRoot: await revTree.root(),
      rootOfRoots: ZERO_HASH
    };

    const authMTPNewStateIncProof = await claimsTree.generateProof(index, await claimsTree.root());

    // signature
    const hashOldAndNewStates = poseidon.hash([genesisState.bigInt(), newState.bigInt()]);
    const signature = privateKey.signPoseidon(hashOldAndNewStates);

    const sti = new StateTransitionInputs();
    sti.id = identity;
    sti.oldTreeState = genesisTreeState;
    sti.newTreeState = newTreeState;
    sti.isOldStateGenesis = true;
    sti.authClaim = {
      claim: authClaim,
      incProof: { proof: authMTPProof.proof },
      nonRevProof: {
        proof: authNonRevMTPProof.proof
      }
    };
    sti.authClaimNewStateIncProof = authMTPNewStateIncProof.proof;
    sti.signature = signature;

    const inputBytes = sti.inputsMarshal();

    const expectedJSONInputs = `{"authClaim":["80551937543569765027552589160822318028","0","9582165609074695838007712438814613121302719752874385708394134542816240804696","18271435592817415588213874506882839610978320325722319742324814767882756910515","11203087622270641253","0","0","0"],"authClaimMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"authClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"newAuthClaimMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"userID":"28049899845899252156982726682342581898046855955053612508111669900571644673","newUserState":"8717994378109424649893756016288492635910918769904280638970270379188098989082","claimsTreeRoot":"10304430946970870697981400054531724100803206948489006715521525892274350097449","oldUserState":"20177832565449474772630743317224985532862797657496372535616634430055981993180","revTreeRoot":"0","rootsTreeRoot":"0","signatureR8x":"586684641065293574681175944568309007486914963323113557570969829920744971136","signatureR8y":"19584916991773525781729014480657258633764115167499561241730396722769308232705","signatureS":"1490756235916606497547608218550374490509259398504600808524183003820201544678","newClaimsTreeRoot":"10304430946970870697981400054531724100803206948489006715521525892274350097449","newRootsTreeRoot":"0","newRevTreeRoot":"19374975721259875597650302716689543547647001662517455822229477759190533109280","isOldStateGenesis":"1","authClaimNonRevMtpAuxHi":"0","authClaimNonRevMtpAuxHv":"0","authClaimNonRevMtpNoAux":"1"}`;

    expect(JSON.parse(expectedJSONInputs)).to.deep.equal(
      JSON.parse(byteDecoder.decode(inputBytes))
    );
  });
});
