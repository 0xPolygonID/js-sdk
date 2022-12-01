import { TreeState } from '../../src/circuits';
import { AuthInputs, AuthPubSignals } from '../../src/circuits/auth';
import { authClaimFullInfo } from './utils';

describe('auth', () => {
  it('TestCircuitMarshal', async () => {
    const privKeyHex = '28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
    const challenge = BigInt(1);
    const {
      id,
      claim,
      state,
      claimsTree,
      revTree,
      rootsTree,
      claimEntryMTP,
      claimNonRevMTP,
      challengeSignature
    } = await authClaimFullInfo(privKeyHex, challenge);

    const treeState: TreeState = {
      state,
      claimsRoot: claimsTree.root,
      revocationRoot: revTree.root,
      rootOfRoots: rootsTree.root
    };

    const inputs = new AuthInputs();
    inputs.id = id;
    inputs.authClaim = {
      claim,
      incProof: {
        proof: claimEntryMTP,
        treeState
      },
      nonRevProof: {
        proof: claimNonRevMTP,
        treeState
      }
    };
    inputs.challenge = challenge;
    inputs.signature = challengeSignature;

    const circuitInputJSON = inputs.inputsMarshal();
    const expectedJSONInputs = `{"userAuthClaim":["304427537360709784173770334266246861770","0","17640206035128972995519606214765283372613874593503528180869261482403155458945","20634138280259599560273310290025659992320584624461316485434108770067472477956","15930428023331155902","0","0","0"],"userAuthClaimMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"userAuthClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"userAuthClaimNonRevMtpAuxHi":"0","userAuthClaimNonRevMtpAuxHv":"0","userAuthClaimNonRevMtpNoAux":"1","challenge":"1","challengeSignatureR8x":"8553678144208642175027223770335048072652078621216414881653012537434846327449","challengeSignatureR8y":"5507837342589329113352496188906367161790372084365285966741761856353367255709","challengeSignatureS":"2093461910575977345603199789919760192811763972089699387324401771367839603655","userClaimsTreeRoot":"9763429684850732628215303952870004997159843236039795272605841029866455670219","userID":"20920305170169595198233610955511031459141100274346276665183631177096036352","userRevTreeRoot":"0","userRootsTreeRoot":"0","userState":"18656147546666944484453899241916469544090258810192803949522794490493271005313"}
`;

    const actualInputs = JSON.parse(new TextDecoder().decode(circuitInputJSON));

    const expectedInputs = JSON.parse(expectedJSONInputs);

    expect(actualInputs).toEqual(expectedInputs);
  });

  it('TestAuthCircuit_CircuitUnmarshal', async () => {
    // generate mock Data.
    const privKeyHex = '28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
    const challenge = BigInt(1);
    const { id, state } = await authClaimFullInfo(privKeyHex, challenge);

    const out = [challenge.toString(), state.bigInt().toString(), id.bigInt().toString()];
    const bytesOut = new TextEncoder().encode(JSON.stringify(out));

    const ao = new AuthPubSignals();
    ao.pubSignalsUnmarshal(bytesOut);
    expect(challenge).toEqual(ao.challenge);
    expect(state).toEqual(ao.userState);
    expect(id).toEqual(ao.userID);
  });

  it('TestAuthCircuit_DefaultValues', () => {
    const inp = new AuthInputs();
    inp.mtLevel = 4;
    inp.valueArraySize = 2;

    expect(4).toEqual(inp.getMTLevel());
    expect(2).toEqual(inp.getValueArrSize());
  });
});
