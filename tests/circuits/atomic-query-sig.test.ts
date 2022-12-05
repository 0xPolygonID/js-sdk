import { Hex } from '@iden3/js-crypto';
import {
  ElemBytes,
  SchemaHash,
  Claim,
  ClaimOptions,
  Id,
  getDateFromUnixTimestamp
} from '@iden3/js-iden3-core';
import {
  hashElems,
  InMemoryDB,
  Merkletree,
  newHashFromBigInt,
  str2Bytes,
  ZERO_HASH
} from '@iden3/js-merkletree';
import {
  AtomicQuerySigInputs,
  AtomicQuerySigPubSignals,
  BJJSignatureProof,
  ClaimWithMTPProof,
  ClaimWithSigProof,
  Operators,
  Query,
  TreeState
} from '../../src/circuits';
import { claimsIndexValueHashes, generate } from './utils';

describe('atomic-query-sig', () => {
  it('TestAttrQuerySig_PrepareInputs', async () => {
    const userPrivKHex = '28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
    const issuerPrivKHex = '21a5e7321d0e2f3ca1cc6504396e6594a2211544b08c206847cdee96f832421a';
    const challenge = BigInt(1);
    const {
      identity: userIdentity,
      claimsTree: uClaimsTree,
      authClaim: userAuthCoreClaim,
      privateKey: userPrivateKey
    } = await generate(userPrivKHex);

    const state = await hashElems([
      uClaimsTree.root.bigInt(),
      ZERO_HASH.bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const userAuthTreeState: TreeState = {
      state: state,
      claimsRoot: uClaimsTree.root,
      revocationRoot: ZERO_HASH,
      rootOfRoots: ZERO_HASH
    };

    const hIndexAuthEntryUser = claimsIndexValueHashes(userAuthCoreClaim).indexHash;

    const mtpProofUser = await uClaimsTree.generateProof(hIndexAuthEntryUser, uClaimsTree.root);

    const message = challenge;

    const challengeSignature = userPrivateKey.signPoseidon(message);

    // Issuer
    const {
      identity: issuerIdentity,
      claimsTree: iClaimsTree,
      revTree: iRevTree,
      authClaim: issuerAuthClaim,
      privateKey: issuerKey
    } = await generate(issuerPrivKHex);

    // issuer state
    const issuerGenesisState = await hashElems([
      iClaimsTree.root.bigInt(),
      ZERO_HASH.bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const issuerAuthTreeState: TreeState = {
      state: issuerGenesisState,
      claimsRoot: iClaimsTree.root,
      revocationRoot: ZERO_HASH,
      rootOfRoots: ZERO_HASH
    };

    const hIndexAuthEntryIssuer = claimsIndexValueHashes(issuerAuthClaim).indexHash;

    const mtpProofIssuer = await iClaimsTree.generateProof(hIndexAuthEntryIssuer, iClaimsTree.root);

    const issuerAuthClaimRevNonce = issuerAuthClaim.getRevocationNonce();
    const issuerAuthNonRevProof = await iRevTree.generateProof(
      issuerAuthClaimRevNonce,
      iRevTree.root
    );

    // issue issuerClaim for user
    const dataSlotA = ElemBytes.fromInt(BigInt(10));

    const nonce = BigInt(1);
    const schemaHash = new SchemaHash(Hex.decodeString('ce6bb12c96bfd1544c02c289c6b4b987'));

    const issuerCoreClaim = Claim.newClaim(
      schemaHash,
      ClaimOptions.withIndexId(userIdentity),
      ClaimOptions.withIndexData(dataSlotA, new ElemBytes()),
      ClaimOptions.withExpirationDate(getDateFromUnixTimestamp(1669884010)), //Thu Dec 01 2022 08:40:10 GMT+0000
      ClaimOptions.withRevocationNonce(nonce)
    );

    const { indexHash: hashIndex, valueHash: hashValue } = claimsIndexValueHashes(issuerCoreClaim);

    const commonHash = await hashElems([hashIndex, hashValue]);

    const claimSignature = issuerKey.signPoseidon(commonHash.bigInt());

    await iClaimsTree.add(hashIndex, hashValue);

    const stateAfterClaimAdd = await hashElems([
      iClaimsTree.root.bigInt(),
      ZERO_HASH.bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const issuerStateAfterClaimAdd: TreeState = {
      state: stateAfterClaimAdd,
      claimsRoot: iClaimsTree.root,
      revocationRoot: ZERO_HASH,
      rootOfRoots: ZERO_HASH
    };

    const issuerRevTree = new Merkletree(new InMemoryDB(str2Bytes('')), true, 40);

    const proofNotRevoke = await issuerRevTree.generateProof(nonce, issuerRevTree.root);

    const inputsAuthClaim: ClaimWithMTPProof = {
      //Schema:    authClaim.Schema,
      claim: userAuthCoreClaim,
      incProof: {
        proof: mtpProofUser.proof,
        treeState: userAuthTreeState
      },
      nonRevProof: {
        treeState: userAuthTreeState,
        proof: mtpProofUser.proof
      }
    };

    const claimIssuerSignature: BJJSignatureProof = {
      signature: claimSignature,
      issuerAuthClaim: issuerAuthClaim,
      issuerAuthIncProof: {
        treeState: issuerAuthTreeState,
        proof: mtpProofIssuer.proof
      },
      issuerAuthNonRevProof: {
        treeState: issuerAuthTreeState,
        proof: issuerAuthNonRevProof.proof
      }
    };

    const inputsUserClaim: ClaimWithSigProof = {
      claim: issuerCoreClaim,
      //TreeState: issuerStateAfterClaimAdd,
      nonRevProof: {
        treeState: issuerStateAfterClaimAdd,
        proof: proofNotRevoke.proof
      },
      issuerID: issuerIdentity,
      signatureProof: claimIssuerSignature
    };

    const query = new Query();
    query.slotIndex = 2;
    query.values = [BigInt(10)];
    query.operator = Operators.EQ;

    const atomicInputs = new AtomicQuerySigInputs();
    atomicInputs.id = userIdentity;
    atomicInputs.authClaim = inputsAuthClaim;
    atomicInputs.challenge = challenge;
    atomicInputs.signature = challengeSignature;
    atomicInputs.currentTimeStamp = 1642074362;
    atomicInputs.claim = inputsUserClaim;
    atomicInputs.query = query;

    const bytesInputs = atomicInputs.inputsMarshal();

    const expectedJSONInputs = `{"userAuthClaim":["304427537360709784173770334266246861770","0","17640206035128972995519606214765283372613874593503528180869261482403155458945","20634138280259599560273310290025659992320584624461316485434108770067472477956","15930428023331155902","0","0","0"],"userAuthClaimMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"userAuthClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"userAuthClaimNonRevMtpAuxHi":"0","userAuthClaimNonRevMtpAuxHv":"0","userAuthClaimNonRevMtpNoAux":"0","userClaimsTreeRoot":"9763429684850732628215303952870004997159843236039795272605841029866455670219","userState":"18656147546666944484453899241916469544090258810192803949522794490493271005313","userRevTreeRoot":"0","userRootsTreeRoot":"0","userID":"20920305170169595198233610955511031459141100274346276665183631177096036352","challenge":"1","challengeSignatureR8x":"8553678144208642175027223770335048072652078621216414881653012537434846327449","challengeSignatureR8y":"5507837342589329113352496188906367161790372084365285966741761856353367255709","challengeSignatureS":"2093461910575977345603199789919760192811763972089699387324401771367839603655","issuerClaim":["3583233690122716044519380227940806650830","20920305170169595198233610955511031459141100274346276665183631177096036352","10","0","30803922965249841627828060161","0","0","0"],"issuerClaimNonRevClaimsTreeRoot":"9039420820783947225129721782217789545748472394427426963935402963755305583703","issuerClaimNonRevRevTreeRoot":"0","issuerClaimNonRevRootsTreeRoot":"0","issuerClaimNonRevState":"13502509003951168747865850207840147567848114437663919718666503371668245440139","issuerClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"issuerClaimNonRevMtpAuxHi":"0","issuerClaimNonRevMtpAuxHv":"0","issuerClaimNonRevMtpNoAux":"1","claimSchema":"180410020913331409885634153623124536270","issuerID":"24839761684028550613296892625503994006188774664975540620786183594699522048","operator":1,"slotIndex":2,"timestamp":"1642074362","value":["10","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"issuerClaimSignatureR8x":"19151655656571068723188718866820691386512454028254006139907638885547326917694","issuerClaimSignatureR8y":"17463616698941210521990412259215791048145070157919873499989757246656774123070","issuerClaimSignatureS":"1268035173625987886471230795279546403676700496822588311134000495794122363162","issuerAuthClaim":["304427537360709784173770334266246861770","0","9582165609074695838007712438814613121302719752874385708394134542816240804696","18271435592817415588213874506882839610978320325722319742324814767882756910515","11203087622270641253","0","0","0"],"issuerAuthClaimMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"issuerAuthClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"issuerAuthClaimNonRevMtpAuxHi":"0","issuerAuthClaimNonRevMtpAuxHv":"0","issuerAuthClaimNonRevMtpNoAux":"1","issuerAuthClaimsTreeRoot":"18337129644116656308842422695567930755039142442806278977230099338026575870840","issuerAuthRevTreeRoot":"0","issuerAuthRootsTreeRoot":"0"}`;

    expect(JSON.parse(expectedJSONInputs)).toEqual(
      JSON.parse(new TextDecoder().decode(bytesInputs))
    );
  });

  it('TestAtomicQuerySigV2Outputs_CircuitUnmarshal', async () => {
    const userID = Id.fromBigInt(
      BigInt('19224224881555258540966250468059781351205177043309252290095510834143232000')
    );

    const userStateInt = BigInt(
      '7608718875990494885422326673876913565155307854054144181362485232187902102852'
    );
    const userState = newHashFromBigInt(userStateInt);

    const schemaInt = BigInt('210459579859058135404770043788028292398');
    const schema = SchemaHash.newSchemaHashFromInt(schemaInt);

    const issuerClaimNonRevStateInt = BigInt(
      '19221836623970007220538457599669851375427558847917606787084815224761802529201'
    );
    const issuerClaimNonRevState = newHashFromBigInt(issuerClaimNonRevStateInt);

    const issuerAuthStateInt = BigInt(
      '11672667429383627660992648216772306271234451162443612055001584519010749218959'
    );
    const issuerAuthState = newHashFromBigInt(issuerAuthStateInt);

    const issuerID = Id.fromBigInt(
      BigInt('24839761684028550613296892625503994006188774664975540620786183594699522048')
    );

    const values = new Array<bigint>(64).fill(BigInt(0));

    values[0] = BigInt(20000101);
    values[63] = BigInt(9999);

    const timestamp = 1651850376;

    const expectedOut = new AtomicQuerySigPubSignals();
    expectedOut.userID = userID;
    expectedOut.userState = userState;
    expectedOut.challenge = BigInt(84239);
    expectedOut.claimSchema = schema;
    expectedOut.issuerID = issuerID;
    expectedOut.issuerAuthState = issuerAuthState;
    expectedOut.issuerClaimNonRevState = issuerClaimNonRevState;
    expectedOut.slotIndex = 2;
    expectedOut.values = values;
    expectedOut.operator = Operators.EQ;
    expectedOut.timestamp = timestamp;

    const out = new AtomicQuerySigPubSignals().pubSignalsUnmarshal(
      new TextEncoder().encode(
        `["11672667429383627660992648216772306271234451162443612055001584519010749218959", "19224224881555258540966250468059781351205177043309252290095510834143232000", "7608718875990494885422326673876913565155307854054144181362485232187902102852", "84239", "24839761684028550613296892625503994006188774664975540620786183594699522048", "19221836623970007220538457599669851375427558847917606787084815224761802529201", "1651850376", "210459579859058135404770043788028292398", "2", "1", "20000101", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "9999"]`
      )
    );
    expect(expectedOut).toEqual(out);
  });
});
