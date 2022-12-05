import { Hex } from '@iden3/js-crypto';
import {
  ElemBytes,
  SchemaHash,
  Claim,
  ClaimOptions,
  getDateFromUnixTimestamp,
  Id
} from '@iden3/js-iden3-core';
import { hashElems, newHashFromBigInt, ZERO_HASH } from '@iden3/js-merkletree';
import {
  ClaimWithMTPProof,
  JsonLDAtomicQueryMTPInputs,
  JsonLDAtomicQueryMTPPubSignals,
  Operators,
  Query,
  TreeState,
  ValueProof
} from '../../src/circuits';
import { merklizeJSONLD } from '../../src/schema-processor/processor/merklize';
import { claimsIndexValueHashes, generate } from './utils';

const testClaimDocument = `{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/citizenship/v1",
    "https://w3id.org/security/bbs/v1"
  ],
  "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
  "type": ["VerifiableCredential", "PermanentResidentCard"],
  "issuer": "did:example:489398593",
  "identifier": 83627465,
  "name": "Permanent Resident Card",
  "description": "Government of Example Permanent Resident Card.",
  "issuanceDate": "2019-12-03T12:19:52Z",
  "expirationDate": "2029-12-03T12:19:52Z",
  "credentialSubject": {
    "id": "did:example:b34ca6cd37bbf23",
    "type": ["PermanentResident", "Person"],
    "givenName": "JOHN",
    "familyName": "SMITH",
    "gender": "Male",
    "image": "data:image/png;base64,iVBORw0KGgokJggg==",
    "residentSince": "2015-01-01",
    "lprCategory": "C09",
    "lprNumber": "999-999-999",
    "commuterClassification": "C1",
    "birthCountry": "Bahamas",
    "birthDate": "1958-07-17"
  }
}`;

describe('json-ld-atomic-query-mtp', () => {
  it('TestJsonLDAtomicQuery_PrepareInputs', async () => {
    const userPrivKHex = '28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
    const issuerPrivKHex = '21a5e7321d0e2f3ca1cc6504396e6594a2211544b08c206847cdee96f832421a';
    const challenge = BigInt(1);

    const {
      identity: userIdentity,
      claimsTree: uClaimsTree,
      revTree: uRevsTree,
      authClaim: userAuthCoreClaim,
      privateKey: userPrivateKey
    } = await generate(userPrivKHex);

    const state = await hashElems([
      uClaimsTree.root.bigInt(),
      ZERO_HASH.bigInt(),
      ZERO_HASH.bigInt()
    ]);

    const userAuthTrees: TreeState = {
      state: state,
      claimsRoot: uClaimsTree.root,
      revocationRoot: ZERO_HASH,
      rootOfRoots: ZERO_HASH
    };

    const hIndexAuthEntryUser = claimsIndexValueHashes(userAuthCoreClaim);

    const mtpProofUser = await uClaimsTree.generateProof(
      hIndexAuthEntryUser.indexHash,
      uClaimsTree.root
    );

    const message = challenge;

    const challengeSignature = userPrivateKey.signPoseidon(message);

    // Issuer
    const {
      identity: issuerID,
      claimsTree: iClaimsTree,
      revTree: issuerRevTree,
      rootsTree: issuerRoRTree
    } = await generate(issuerPrivKHex);

    const mz = merklizeJSONLD(new TextEncoder().encode(testClaimDocument));

    // issue issuerClaim for user
    const dataSlotA = ElemBytes.fromInt(mz.root().bigInt());

    const nonce = BigInt(1);
    const otherNonce1 = BigInt(2);
    const otherNonce2 = BigInt(3);

    const schemaHash = new SchemaHash(Hex.decodeString('ce6bb12c96bfd1544c02c289c6b4b987'));

    const issuerCoreClaim = Claim.newClaim(
      schemaHash,
      ClaimOptions.withIndexId(userIdentity),
      ClaimOptions.withIndexData(dataSlotA, new ElemBytes()),
      ClaimOptions.withExpirationDate(getDateFromUnixTimestamp(1669884010)), //Thu Dec 01 2022 08:40:10 GMT+0000
      ClaimOptions.withRevocationNonce(nonce)
    );

    const { indexHash: hIndexClaimEntry, valueHash: hValueClaimEntry } =
      claimsIndexValueHashes(issuerCoreClaim);

    await iClaimsTree.add(hIndexClaimEntry, hValueClaimEntry);

    const proof = await iClaimsTree.generateProof(hIndexClaimEntry, iClaimsTree.root);

    // add something to revocation tree so tree is not zeros
    await issuerRevTree.add(BigInt(otherNonce1), BigInt(0));
    await issuerRevTree.add(BigInt(otherNonce2), BigInt(0));

    const stateAfterClaimAdd = await hashElems([
      iClaimsTree.root.bigInt(),
      issuerRevTree.root.bigInt(),
      issuerRoRTree.root.bigInt()
    ]);

    const issuerStateAfterClaimAdd: TreeState = {
      state: stateAfterClaimAdd,
      claimsRoot: iClaimsTree.root,
      revocationRoot: issuerRevTree.root,
      rootOfRoots: issuerRoRTree.root
    };

    const proofNotRevoke = await issuerRevTree.generateProof(BigInt(nonce), ZERO_HASH);

    const authClaimRevNonce = userAuthCoreClaim.getRevocationNonce();
    const proofAuthClaimNotRevoked = await uRevsTree.generateProof(authClaimRevNonce, ZERO_HASH);

    const inputsAuthClaim: ClaimWithMTPProof = {
      claim: userAuthCoreClaim,
      incProof: {
        proof: mtpProofUser.proof,
        treeState: userAuthTrees
      },
      nonRevProof: {
        treeState: userAuthTrees,
        proof: proofAuthClaimNotRevoked.proof
      }
    };

    const inputsUserClaim: ClaimWithMTPProof = {
      claim: issuerCoreClaim,
      incProof: {
        proof: proof.proof,
        treeState: issuerStateAfterClaimAdd
      },
      issuerID: issuerID,
      nonRevProof: {
        treeState: issuerStateAfterClaimAdd,
        proof: proofNotRevoke.proof
      }
    };
    //todo:path
    const path = 'http://schema.org/identifier';

    const { proof: jsonLDProof, value } = mz.proof(path);

    const jsonLDValue = value.mtEntry() as bigint;

    const query = new Query();
    query.valueProof = new ValueProof();
    query.valueProof.mtp = jsonLDProof;
    query.valueProof.value = jsonLDValue;
    query.valueProof.path = path;

    query.values = [jsonLDValue];
    query.operator = Operators.EQ;

    const atomicInputs = new JsonLDAtomicQueryMTPInputs();
    atomicInputs.id = userIdentity;
    atomicInputs.authClaim = inputsAuthClaim;
    atomicInputs.challenge = challenge;
    atomicInputs.signature = challengeSignature;
    atomicInputs.claim = inputsUserClaim;
    atomicInputs.currentTimeStamp = 1642074362;
    atomicInputs.query = query;

    const bytesInputs = atomicInputs.inputsMarshal();

    const expectedJSONInputs = `{"userAuthClaim":["304427537360709784173770334266246861770","0","17640206035128972995519606214765283372613874593503528180869261482403155458945","20634138280259599560273310290025659992320584624461316485434108770067472477956","15930428023331155902","0","0","0"],"userAuthClaimMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"userAuthClaimNonRevMtp":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"userAuthClaimNonRevMtpAuxHi":"0","userAuthClaimNonRevMtpAuxHv":"0","userAuthClaimNonRevMtpNoAux":"1","userClaimsTreeRoot":"9763429684850732628215303952870004997159843236039795272605841029866455670219","userState":"18656147546666944484453899241916469544090258810192803949522794490493271005313","userRevTreeRoot":"0","userRootsTreeRoot":"0","userID":"20920305170169595198233610955511031459141100274346276665183631177096036352","challenge":"1","challengeSignatureR8x":"8553678144208642175027223770335048072652078621216414881653012537434846327449","challengeSignatureR8y":"5507837342589329113352496188906367161790372084365285966741761856353367255709","challengeSignatureS":"2093461910575977345603199789919760192811763972089699387324401771367839603655","issuerClaim":["3583233690122716044519380227940806650830","20920305170169595198233610955511031459141100274346276665183631177096036352","17568057213828477233507447080689055308823020388972334380526849356111335110900","0","30803922965249841627828060161","0","0","0"],"issuerClaimClaimsTreeRoot":"12043432325186851834711218335182459998010702175035207867812467115440003729689","issuerClaimIdenState":"7442410153287181122610943549348167471303699811467200353996210395269617163235","issuerClaimMtp":["0","0","18337129644116656308842422695567930755039142442806278977230099338026575870840","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"issuerClaimRevTreeRoot":"11955236168039024258206152167718595733300625004351440056586716560060653311750","issuerClaimRootsTreeRoot":"0","issuerClaimNonRevClaimsTreeRoot":"12043432325186851834711218335182459998010702175035207867812467115440003729689","issuerClaimNonRevRevTreeRoot":"11955236168039024258206152167718595733300625004351440056586716560060653311750","issuerClaimNonRevRootsTreeRoot":"0","issuerClaimNonRevState":"7442410153287181122610943549348167471303699811467200353996210395269617163235","issuerClaimNonRevMtp":["16893244256367465864542014032080213413654599301942077056250173615273598292583","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"issuerClaimNonRevMtpAuxHi":"3","issuerClaimNonRevMtpAuxHv":"0","issuerClaimNonRevMtpNoAux":"0","claimSchema":"180410020913331409885634153623124536270","issuerID":"24839761684028550613296892625503994006188774664975540620786183594699522048","claimPathNotExists":0,"claimPathMtp":["11910293038428617741524804146372123460316909087472110224310684293437832969164","16177004431687368818113912782442107150203001063591538107922536599846633952045","2273332527522244458085120870407367354166812099476912338970230154990132783303","13192918401641087849642106777397606986912934444326373440658673644787217670633","7168654565749461589078377009464061974077279404969163913984304601783416740392","14271173073428930573422493938722323454218890711784989528150404024814136007165","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"claimPathMtpNoAux":"0","claimPathMtpAuxHi":"0","claimPathMtpAuxHv":"0","claimPathKey":"14893038329526541210094612673793094547542854832994245253710267888299004292355","claimPathValue":"83627465","operator":1,"timestamp":"1642074362","value":["83627465","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"]}`;

    expect(JSON.parse(expectedJSONInputs)).toEqual(
      JSON.parse(new TextDecoder().decode(bytesInputs))
    );
  });

  it('TestJsonLDAtomicQueryMTPOutputs_CircuitUnmarshal', async () => {
    const userID = Id.fromBigInt(
      BigInt('20920305170169595198233610955511031459141100274346276665183631177096036352')
    );

    const userStateInt = BigInt(
      '18656147546666944484453899241916469544090258810192803949522794490493271005313'
    );
    const userState = newHashFromBigInt(userStateInt);

    const schemaInt = BigInt('180410020913331409885634153623124536270');
    const schema = SchemaHash.newSchemaHashFromInt(schemaInt);

    const issuerClaimIdenStateInt = BigInt(
      '16993161227479379075495985698325116578679629820096885930185446225558281870528'
    );
    const issuerClaimIdenState = newHashFromBigInt(issuerClaimIdenStateInt);

    const issuerClaimNonRevStateInt = BigInt(
      '16993161227479379075495985698325116578679629820096885930185446225558281870528'
    );
    const issuerClaimNonRevState = newHashFromBigInt(issuerClaimNonRevStateInt);

    const issuerID = Id.fromBigInt(
      BigInt('24839761684028550613296892625503994006188774664975540620786183594699522048')
    );

    const values = new Array<bigint>(64).fill(BigInt(0));
    values[0] = BigInt(83627465);

    const claimPathKeyInt = BigInt(
      '14893038329526541210094612673793094547542854832994245253710267888299004292355'
    );
    const claimPathKey = newHashFromBigInt(claimPathKeyInt);

    const timestamp = 1642074362;

    const expectedOut = new JsonLDAtomicQueryMTPPubSignals();
    expectedOut.userID = userID;
    expectedOut.userState = userState;
    expectedOut.challenge = BigInt(1);
    expectedOut.claimSchema = schema;
    expectedOut.issuerClaimIdenState = issuerClaimIdenState;
    expectedOut.issuerClaimNonRevState = issuerClaimNonRevState;
    expectedOut.issuerID = issuerID;
    expectedOut.claimPathKey = claimPathKey;
    expectedOut.values = values;
    expectedOut.operator = Operators.EQ;
    expectedOut.timestamp = timestamp;

    const out = new JsonLDAtomicQueryMTPPubSignals().pubSignalsUnmarshal(
      new TextEncoder().encode(
        JSON.stringify(`[
        "20920305170169595198233610955511031459141100274346276665183631177096036352",
        "18656147546666944484453899241916469544090258810192803949522794490493271005313",
        "1",
        "16993161227479379075495985698325116578679629820096885930185446225558281870528",
        "24839761684028550613296892625503994006188774664975540620786183594699522048",
        "16993161227479379075495985698325116578679629820096885930185446225558281870528",
        "1642074362",
        "180410020913331409885634153623124536270",
        "14893038329526541210094612673793094547542854832994245253710267888299004292355",
        "1",
        "83627465",
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
       ]`)
      )
    );

    expect(expectedOut).toEqual(out);
  });
});
