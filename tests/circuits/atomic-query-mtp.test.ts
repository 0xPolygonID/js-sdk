import { Operators } from './../../src/circuits/comparer';
import { Hex } from '@iden3/js-crypto';
import {
  SchemaHash,
  Claim,
  ClaimOptions,
  ElemBytes,
  getDateFromUnixTimestamp,
  Id
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
  AtomicQueryMTPInputs,
  AtomicQueryMTPPubSignals,
  ClaimWithMTPProof,
  Query,
  TreeState
} from '../../src/circuits';
import { claimsIndexValueHashes, generate } from './utils';

describe.only('atomic-query-mtp', () => {
  it('TestAtomicQuery_PrepareInputs', async () => {
    const userPrivKHex = '28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
    const issuerPrivKHex = '21a5e7321d0e2f3ca1cc6504396e6594a2211544b08c206847cdee96f832421a';
    const challenge = BigInt(1);

    const { identity, claimsTree, revTree, authClaim, privateKey } = await generate(userPrivKHex);

    const state = await hashElems([
      claimsTree.root.bigInt(),
      ZERO_HASH.bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const userAuthTreeState: TreeState = {
      state: state,
      claimsRoot: claimsTree.root,
      revocationRoot: ZERO_HASH,
      rootOfRoots: ZERO_HASH
    };

    const hIndexAuthEntryUser = claimsIndexValueHashes(authClaim);

    const mtpProofUser = await claimsTree.generateProof(
      hIndexAuthEntryUser.indexHash,
      claimsTree.root
    );

    // TODO why not swapped?
    const message = challenge;

    const challengeSignature = privateKey.signPoseidon(message);

    // Issuer
    const issuerData = await generate(issuerPrivKHex);

    // issue issuerClaim for user
    const dataSlotA = ElemBytes.fromInt(BigInt(10));

    const nonce = BigInt(1);

    const schemaBytes = Hex.decodeString('ce6bb12c96bfd1544c02c289c6b4b987');

    const schemaHash = new SchemaHash(schemaBytes);

    const issuerCoreClaim = Claim.newClaim(
      schemaHash,
      ClaimOptions.withIndexId(identity),
      ClaimOptions.withIndexData(dataSlotA, new ElemBytes()),
      ClaimOptions.withExpirationDate(getDateFromUnixTimestamp(1669884010)), //Thu Dec 01 2022 08:40:10 GMT+0000
      ClaimOptions.withRevocationNonce(nonce)
    );

    const { indexHash, valueHash } = claimsIndexValueHashes(issuerCoreClaim);

    await issuerData.claimsTree.add(indexHash, valueHash);

    const proof = await issuerData.claimsTree.generateProof(indexHash, issuerData.claimsTree.root);

    const stateAfterClaimAdd = await hashElems([
      issuerData.claimsTree.root.bigInt(),
      ZERO_HASH.bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const issuerStateAfterClaimAdd: TreeState = {
      state: stateAfterClaimAdd,
      claimsRoot: issuerData.claimsTree.root,
      revocationRoot: ZERO_HASH,
      rootOfRoots: ZERO_HASH
    };

    const issuerRevTree = new Merkletree(new InMemoryDB(str2Bytes('')), true, 40);

    const proofNotRevoke = await issuerRevTree.generateProof(nonce, ZERO_HASH);

    const authClaimRevNonce = authClaim.getRevocationNonce();
    const proofAuthClaimNotRevoked = await revTree.generateProof(authClaimRevNonce, ZERO_HASH);

    const inputsAuthClaim: ClaimWithMTPProof = {
      claim: authClaim,
      incProof: {
        proof: mtpProofUser.proof,
        treeState: userAuthTreeState
      },
      nonRevProof: {
        treeState: userAuthTreeState,
        proof: proofAuthClaimNotRevoked.proof
      }
    };

    const inputsUserClaim: ClaimWithMTPProof = {
      claim: issuerCoreClaim,
      incProof: {
        proof: proof.proof,
        treeState: issuerStateAfterClaimAdd
      },
      issuerID: issuerData.identity,
      nonRevProof: {
        treeState: issuerStateAfterClaimAdd,
        proof: proofNotRevoke.proof
      }
    };

    const query = new Query();
    query.slotIndex = 2;
    query.values = [BigInt(10)];
    query.operator = Operators.EQ;

    const atomicInputs = new AtomicQueryMTPInputs();
    atomicInputs.id = identity;
    atomicInputs.authClaim = inputsAuthClaim;
    atomicInputs.challenge = challenge;
    atomicInputs.signature = challengeSignature;

    atomicInputs.claim = inputsUserClaim;

    atomicInputs.currentTimeStamp = 1642074362;
    atomicInputs.query = query;

    const bytesInputs = atomicInputs.inputsMarshal();
    const expectedJSONInputs = `{"userAuthClaim":["304427537360709784173770334266246861770","0","17640206035128972995519606214765283372613874593503528180869261482403155458945","20634138280259599560273310290025659992320584624461316485434108770067472477956","15930428023331155902","0","0","0"],"userAuthClaimMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"userAuthClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"userAuthClaimNonRevMtpAuxHi":"0","userAuthClaimNonRevMtpAuxHv":"0","userAuthClaimNonRevMtpNoAux":"1","userClaimsTreeRoot":"9763429684850732628215303952870004997159843236039795272605841029866455670219","userState":"18656147546666944484453899241916469544090258810192803949522794490493271005313","userRevTreeRoot":"0","userRootsTreeRoot":"0","userID":"20920305170169595198233610955511031459141100274346276665183631177096036352","challenge":"1","challengeSignatureR8x":"8553678144208642175027223770335048072652078621216414881653012537434846327449","challengeSignatureR8y":"5507837342589329113352496188906367161790372084365285966741761856353367255709","challengeSignatureS":"2093461910575977345603199789919760192811763972089699387324401771367839603655","issuerClaim":["3583233690122716044519380227940806650830","20920305170169595198233610955511031459141100274346276665183631177096036352","10","0","30803922965249841627828060161","0","0","0"],"issuerClaimClaimsTreeRoot":"9039420820783947225129721782217789545748472394427426963935402963755305583703","issuerClaimIdenState":"13502509003951168747865850207840147567848114437663919718666503371668245440139","issuerClaimMtp":["0","18337129644116656308842422695567930755039142442806278977230099338026575870840","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"issuerClaimRevTreeRoot":"0","issuerClaimRootsTreeRoot":"0","issuerClaimNonRevClaimsTreeRoot":"9039420820783947225129721782217789545748472394427426963935402963755305583703","issuerClaimNonRevRevTreeRoot":"0","issuerClaimNonRevRootsTreeRoot":"0","issuerClaimNonRevState":"13502509003951168747865850207840147567848114437663919718666503371668245440139","issuerClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"issuerClaimNonRevMtpAuxHi":"0","issuerClaimNonRevMtpAuxHv":"0","issuerClaimNonRevMtpNoAux":"1","claimSchema":"180410020913331409885634153623124536270","issuerID":"24839761684028550613296892625503994006188774664975540620786183594699522048","operator":1,"slotIndex":2,"timestamp":"1642074362","value":["10","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"]}`;

    expect(JSON.parse(expectedJSONInputs)).toEqual(
      JSON.parse(new TextDecoder().decode(bytesInputs))
    );
  });

  it('TestAtomicQueryMTPOutputs_CircuitUnmarshal', async () => {
    const userID = Id.fromBigInt(
      BigInt('19224224881555258540966250468059781351205177043309252290095510834143232000')
    );

    const userStateInt = BigInt(
      '18656147546666944484453899241916469544090258810192803949522794490493271005313'
    );
    const userState = newHashFromBigInt(userStateInt);

    const schemaInt = BigInt('180410020913331409885634153623124536270');
    const schema = SchemaHash.newSchemaHashFromInt(schemaInt);

    const issuerClaimIdenStateInt = BigInt(
      '18605292738057394742004097311192572049290380262377486632479765119429313092475'
    );
    const issuerClaimIdenState = newHashFromBigInt(issuerClaimIdenStateInt);

    const issuerClaimNonRevStateInt = BigInt(
      '4526669839764419626617575537226877836118875794723391624256342150634803457675'
    );
    const issuerClaimNonRevState = newHashFromBigInt(issuerClaimNonRevStateInt);

    const issuerID = Id.fromBigInt(
      BigInt('19224224881555258540966250468059781351205177043309252290095510834143232000')
    );

    const values: bigint[] = new Array(64).fill(BigInt(0));
    values[0] = BigInt(10);
    values[63] = BigInt(9999);

    const timestamp = 1642074362;

    const expectedOut: Partial<AtomicQueryMTPPubSignals> = {
      userID: userID,
      userState: userState,
      challenge: BigInt(1),
      claimSchema: schema,
      issuerClaimIdenState: issuerClaimIdenState,
      issuerClaimNonRevState: issuerClaimNonRevState,
      issuerID: issuerID,
      slotIndex: 2,
      values: values,
      operator: Operators.EQ,
      timestamp: timestamp
    };

    const out = new AtomicQueryMTPPubSignals().pubSignalsUnmarshal(
      new TextEncoder().encode(
        JSON.stringify([
          '19224224881555258540966250468059781351205177043309252290095510834143232000',
          '18656147546666944484453899241916469544090258810192803949522794490493271005313',
          '1',
          '18605292738057394742004097311192572049290380262377486632479765119429313092475',
          '19224224881555258540966250468059781351205177043309252290095510834143232000',
          '4526669839764419626617575537226877836118875794723391624256342150634803457675',
          '1642074362',
          '180410020913331409885634153623124536270',
          '2',
          '1',
          '10',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '9999'
        ])
      )
    );

    expect(expectedOut).toEqual(out);
  });
});
