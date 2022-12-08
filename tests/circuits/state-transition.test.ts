import { poseidon } from '@iden3/js-crypto';
import { Id } from '@iden3/js-iden3-core';
import { hashElems, newHashFromBigInt, ZERO_HASH } from '@iden3/js-merkletree';
import { getProperties, TreeState } from '../../src/circuits';

import {
  StateTransitionInputs,
  StateTransitionPubSignals
} from '../../src/circuits/state-transition';
import { generate } from './utils';

describe('state-transition', () => {
  it('TestStateTransitionOutput_GetJSONObj', () => {
    const id = Id.fromString('1124NoAu14diR5EM1kgUha2uHFkvUrPrTXMtf4tncZ');

    const newState = newHashFromBigInt(BigInt(1));
    const oldState = newHashFromBigInt(BigInt(2));

    const sto = new StateTransitionPubSignals(id, oldState, newState);

    const m: StateTransitionPubSignals = getProperties(sto) as StateTransitionPubSignals;

    expect(id.bigInt().toString()).toEqual(m.userId.bigInt().toString());
    expect(oldState.bigInt().toString()).toEqual(m.oldUserState.bigInt().toString());
    expect(newState.bigInt().toString()).toEqual(m.newUserState.bigInt().toString());
  });

  it('TestStateTransitionInputs_InputsMarshal', async () => {
    const userPK = '21a5e7321d0e2f3ca1cc6504396e6594a2211544b08c206847cdee96f832421a';

    // Issuer
    const { identity, claimsTree, revTree, authClaim, privateKey } = await generate(userPK);

    const genesisState = await hashElems([
      claimsTree.root.bigInt(),
      revTree.root.bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const genesisTreeState: TreeState = {
      state: genesisState,
      claimsRoot: claimsTree.root,
      revocationRoot: revTree.root,
      rootOfRoots: ZERO_HASH
    };

    const index = authClaim.hIndex();
    const authMTPProof = await claimsTree.generateProof(index, claimsTree.root);

    const nonce = authClaim.getRevocationNonce();
    const authNonRevMTPProof = await revTree.generateProof(nonce, revTree.root);

    // update rev tree
    await revTree.add(BigInt(1), BigInt(0));

    const newState = await hashElems([
      claimsTree.root.bigInt(),
      revTree.root.bigInt(),
      ZERO_HASH.bigInt()
    ]);

    // signature
    const hashOldAndNewStates = poseidon.hash([genesisState.bigInt(), newState.bigInt()]);
    const signature = privateKey.signPoseidon(hashOldAndNewStates);

    const sti = new StateTransitionInputs();
    sti.id = identity;
    sti.oldTreeState = genesisTreeState;
    sti.newState = newState;
    sti.isOldStateGenesis = true;
    sti.authClaim = {
      claim: authClaim,
      incProof: { proof: authMTPProof.proof },
      nonRevProof: {
        proof: authNonRevMTPProof.proof
      }
    };
    sti.signature = signature;

    const inputBytes = sti.inputsMarshal();

    const expectedJSONInputs = `{"authClaim":["304427537360709784173770334266246861770","0","9582165609074695838007712438814613121302719752874385708394134542816240804696","18271435592817415588213874506882839610978320325722319742324814767882756910515","11203087622270641253","0","0","0"],"authClaimMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"authClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"authClaimNonRevMtpAuxHi":"0","authClaimNonRevMtpAuxHv":"0","authClaimNonRevMtpNoAux":"1","userID":"24839761684028550613296892625503994006188774664975540620786183594699522048","newUserState":"7569111473237253646417788189126468973900432716598921661470118514516731079797","oldUserState":"6317996369756476782464660619835940615734517981889733696047139451453239145426","isOldStateGenesis":"1","claimsTreeRoot":"18337129644116656308842422695567930755039142442806278977230099338026575870840","revTreeRoot":"0","rootsTreeRoot":"0","signatureR8x":"9484102035827996121666608170002743002783492772260590322761477321381254509037","signatureR8y":"19295134567339498210855406074518612682643335122341225376941332925036431891102","signatureS":"282291664505682519059669624505331509305429004374837545959385601323093440910"}`;

    expect(JSON.parse(expectedJSONInputs)).toEqual(
      JSON.parse(new TextDecoder().decode(inputBytes))
    );
  });
});
