import { Id } from '@iden3/js-iden3-core';
import { newHashFromBigInt, ZERO_HASH } from '@iden3/js-merkletree';
import { StateTransitionPubSignals } from '../../src/circuits/state-transition';

describe.skip('state-transition', () => {
  it('TestStateTransitionOutput_GetJSONObj', () => {
    const id = Id.fromString('1124NoAu14diR5EM1kgUha2uHFkvUrPrTXMtf4tncZ');

    const newState = newHashFromBigInt(BigInt(1));
    const oldState = newHashFromBigInt(BigInt(2));

    const sto = new StateTransitionPubSignals(id, newState, oldState);

    const m = JSON.parse(JSON.stringify(sto));
    expect(id).toEqual(m['userId']);
    expect(oldState).toEqual(m['oldUserState']);
    expect(newState).toEqual(m['newUserState']);
  });

  // it("TestStateTransitionInputs_InputsMarshal", () => {
  // 	const userPK = "21a5e7321d0e2f3ca1cc6504396e6594a2211544b08c206847cdee96f832421a"

  // 	// Issuer
  // 	const id, claimsTree, revTree, _, err, authClaim, userPrivKey = it.Generate(ctx,
  // 		userPK)

  // 	const genesisState = new HashElems(
  // 		claimsTree.Root().BigInt(),
  // 		revTree.Root().BigInt(),
  // 		ZERO_HASH.BigInt())

  // 	const genesisTreeState: TreeState = {
  // 		state:          genesisState,
  // 		claimsRoot:     claimsTree.Root(),
  // 		revocationRoot: revTree.Root(),
  // 		rootOfRoots:    ZERO_HASH,
  // 	}

  // 	const index = authClaim.HIndex()
  // 	const authMTPProof, _ = claimsTree.GenerateProof(ctx, index,
  // 		claimsTree.Root())

  // 	const nonce = new(big.Int).SetUint64(authClaim.GetRevocationNonce())
  // 	const authNonRevMTPProof, _ = revTree.GenerateProof(ctx, nonce,
  // 		revTree.Root())

  // 	// update rev tree
  // 	err = revTree.Add(ctx, BigInt(1), BigInt(0))

  // 	const newState = merkletree.HashElems(
  // 		claimsTree.Root().BigInt(),
  // 		revTree.Root().BigInt(),
  // 		merkletree.HashZero.BigInt())

  // 	// signature
  // 	const hashOldAndNewStates = poseidon.Hash(
  // 		[]*big.Int{genesisState.BigInt(), newState.BigInt()})
  // 	const signature = userPrivKey.SignPoseidon(hashOldAndNewStates)

  // 	const sti = StateTransitionInputs{
  // 		ID:                id,
  // 		OldTreeState:      genesisTreeState,
  // 		NewState:          newState,
  // 		IsOldStateGenesis: true,
  // 		AuthClaim: ClaimWithMTPProof{
  // 			Claim:    authClaim,
  // 			IncProof: MTProof{Proof: authMTPProof},
  // 			NonRevProof: MTProof{
  // 				Proof: authNonRevMTPProof,
  // 			},
  // 		},
  // 		Signature: signature,
  // 	}

  // 	const inputBytes = sti.InputsMarshal()

  // 	const expectedJSONInputs = `{"authClaim":["304427537360709784173770334266246861770","0","9582165609074695838007712438814613121302719752874385708394134542816240804696","18271435592817415588213874506882839610978320325722319742324814767882756910515","11203087622270641253","0","0","0"],"authClaimMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"authClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"authClaimNonRevMtpAuxHi":"0","authClaimNonRevMtpAuxHv":"0","authClaimNonRevMtpNoAux":"1","userID":"24839761684028550613296892625503994006188774664975540620786183594699522048","newUserState":"7569111473237253646417788189126468973900432716598921661470118514516731079797","oldUserState":"6317996369756476782464660619835940615734517981889733696047139451453239145426","isOldStateGenesis":"1","claimsTreeRoot":"18337129644116656308842422695567930755039142442806278977230099338026575870840","revTreeRoot":"0","rootsTreeRoot":"0","signatureR8x":"9484102035827996121666608170002743002783492772260590322761477321381254509037","signatureR8y":"19295134567339498210855406074518612682643335122341225376941332925036431891102","signatureS":"282291664505682519059669624505331509305429004374837545959385601323093440910"}`

  // 	assert.JSONEq(t, expectedJSONInputs, string(inputBytes))
  // })
});
