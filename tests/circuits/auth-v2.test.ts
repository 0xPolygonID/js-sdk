import { IdentityTest } from './utils';
describe('auth-v2', () => {
  it('TestAuthV2Inputs_InputsMarshal', async () => {
    // const challenge = BigInt(10)
    // // generate identity
    // const user = await IdentityTest.newIdentity(userPK)
    // const nonce = BigInt(0)
    // const user2 = await IdentityTest.newIdentity(issuerPK)
    // // generate global tree
    // const gTree = it.GlobalTree(ctx)
    // const err = gTree.Add(ctx, user2.ID.BigInt(), user2.State(t).BigInt())
    // require.NoError(t, err)
    // // prepare inputs
    // const globalProof, _, err = gTree.GenerateProof(ctx, user.ID.BigInt(), nil)
    // require.NoError(t, err)
    // const authClaimIncMTP, _ = user.ClaimMTPRaw(t, user.AuthClaim)
    // const authClaimNonRevMTP, _ = user.ClaimRevMTPRaw(t, user.AuthClaim)
    // require.NoError(t, err)
    // const signature, err = user.SignBBJJ(challenge.Bytes())
    // require.NoError(t, err)
    // const inputs = AuthV2Inputs{
    //     GenesisID:          &user.ID,
    //     ProfileNonce:       nonce,
    //     AuthClaim:          user.AuthClaim,
    //     AuthClaimIncMtp:    authClaimIncMTP,
    //     AuthClaimNonRevMtp: authClaimNonRevMTP,
    //     TreeState:          GetTreeState(t, user),
    //     GISTProof: GISTProof{
    //         Root:  gTree.Root(),
    //         Proof: globalProof,
    //     },
    //     Signature: signature,
    //     Challenge: challenge,
    // }
    // const circuitInputJSON, err = inputs.InputsMarshal()
    // assert.Nil(t, err)
    // //t.Log(string(circuitInputJSON))
    // const exp = it.TestData(t, "authV2_inputs", string(circuitInputJSON), *generate)
    // require.JSONEq(t, exp, string(circuitInputJSON))
  });

  it('TestAuthV2Circuit_CircuitUnmarshal', () => {
    // generate mock Data.
    // const intID, b = new(big.Int).SetString("19224224881555258540966250468059781351205177043309252290095510834143232000",
    //     10)
    // assert.True(t, b)
    // const identifier, err = core.IDFromInt(intID)
    // assert.Nil(t, err)
    // const challenge = BigInt(1)
    // const stateInt, b = new(big.Int).SetString(
    //     "18656147546666944484453899241916469544090258810192803949522794490493271005313",
    //     10)
    // assert.True(t, b)
    // const state, err = merkletree.NewHashFromBigInt(stateInt)
    // assert.NoError(t, err)
    // const out = []string{identifier.BigInt().String(), challenge.String(), state.BigInt().String()}
    // const bytesOut, err = json.Marshal(out)
    // assert.NoError(t, err)
    // const ao = AuthV2PubSignals{}
    // err = ao.PubSignalsUnmarshal(bytesOut)
    // assert.NoError(t, err)
    // assert.Equal(t, challenge, ao.Challenge)
    // assert.Equal(t, state, ao.GlobalRoot)
    // assert.Equal(t, &identifier, ao.UserID)
  });
});
