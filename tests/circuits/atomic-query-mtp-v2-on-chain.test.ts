import { Id } from '@iden3/js-iden3-core';
import { newHashFromString } from '@iden3/js-merkletree';
import {
  AtomicQueryMTPV2OnChainInputs,
  AtomicQueryMTPV2OnChainPubSignals,
  Operators,
  prepareCircuitArrayValues,
  Query
} from '../../src/circuits';
import {
  IdentityTest,
  userPK,
  issuerPK,
  defaultUserClaim,
  timestamp,
  prepareIntArray,
  globalTree,
  poseidonHashValue,
  coreSchemaFromStr
} from './utils';

import expectedJson from './data/mtp-v2-on-chain-inputs.json';
import { expect } from 'chai';
import { byteDecoder, byteEncoder } from '../../src';
import { poseidon } from '@iden3/js-crypto';

describe('atomic-query-mtp-v2-on-chain', () => {
  it('TestAttrQueryMTPV2OnChain_PrepareInputs', async () => {
    const user = await IdentityTest.newIdentity(userPK);
    const issuer = await IdentityTest.newIdentity(issuerPK);

     // generate global tree
     const gTree = globalTree();
     await gTree.add(issuer.id.bigInt(), (await issuer.state()).bigInt());

     // prepare inputs
     const globalProof = await gTree.generateProof(user.id.bigInt());
     const authClaimIncMTP = await user.claimMTPRaw(user.authClaim);
     const authClaimNonRevMTP = await user.claimRevMTPRaw(user.authClaim);

    const challenge = BigInt(10);
    const signature = user.signBJJ(challenge);

    const nonce = BigInt(0);

    const subjectID = user.id;
    const nonceSubject = BigInt(0);

    const claim = defaultUserClaim(subjectID);

    await issuer.addClaim(claim);

    const issuerClaimMtp = await issuer.claimMTPRaw(claim);

    const issuerClaimNonRevMtp = await issuer.claimRevMTPRaw(claim);

    const inputs = new AtomicQueryMTPV2OnChainInputs();

    inputs.requestID = BigInt(23);
    inputs.id = user.id;
    inputs.profileNonce = nonce;
    inputs.claimSubjectProfileNonce = nonceSubject;
    inputs.claim = {
      issuerID: issuer.id,
      claim: claim,
      nonRevProof: {
        treeState: {
          state: await issuer.state(),
          claimsRoot: await issuer.clt.root(),
          revocationRoot: await issuer.ret.root(),
          rootOfRoots: await issuer.rot.root()
        },
        proof: issuerClaimNonRevMtp.proof
      },
      incProof: {
        proof: issuerClaimMtp.proof,
        treeState: {
          state: await issuer.state(),
          claimsRoot: await issuer.clt.root(),
          revocationRoot: await issuer.ret.root(),
          rootOfRoots: await issuer.rot.root()
        }
      }
    };

    const query = new Query();
    query.operator = Operators.EQ;
    query.slotIndex = 2;
    query.values = prepareIntArray([BigInt(10)], 64);
    inputs.query = query;
    inputs.currentTimeStamp = timestamp;
    inputs.authClaim = user.authClaim;
    inputs.authClaimIncMtp = authClaimIncMTP.proof;
    inputs.authClaimNonRevMtp = authClaimNonRevMTP.proof;
    inputs.treeState = {
        state: await user.state(),
        claimsRoot: await user.clt.root(),
        revocationRoot: await user.ret.root(),
        rootOfRoots: await user.rot.root()
    };
    inputs.gistProof = {
        root: await gTree.root(),
        proof: globalProof.proof
    };
    inputs.signature = signature;
    inputs.challenge = challenge;

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));

    expect(actualJson).to.deep.equal(expectedJson);
  });

  it('TestAtomicQueryMTPV2Outputs_CircuitUnmarshal', () => {
    const out = new AtomicQueryMTPV2OnChainPubSignals();
    out.pubSignalsUnmarshal(
      byteEncoder.encode(
        `[
          "0",
          "26109404700696283154998654512117952420503675471097392618762221546565140481",
          "7002038488948284767652984010448061038733120594540539539730565455904340350321",
          "23",
          "10",
          "11098939821764568131087645431296528907277253709936443029379587475821759259406",
          "27918766665310231445021466320959318414450284884582375163563581940319453185",
          "19157496396839393206871475267813888069926627705277243727237933406423274512449",
          "1",
          "19157496396839393206871475267813888069926627705277243727237933406423274512449",
          "1642074362"
         ]`
      )
    );

    const expValue = prepareCircuitArrayValues([BigInt(10)], 64);
    const valueHash = poseidonHashValue(expValue);
    const schema = coreSchemaFromStr('180410020913331409885634153623124536270');
    const slotIndex = 2;
    const operator = 1;
    const quaryHash = poseidon.hash([schema.bigInt(),
        BigInt(slotIndex),
        BigInt(operator),
        BigInt(0),
        BigInt(1),
        valueHash]);

    const exp = new AtomicQueryMTPV2OnChainPubSignals();
    exp.requestID = BigInt(23);
    exp.userID = Id.fromBigInt(
      BigInt('26109404700696283154998654512117952420503675471097392618762221546565140481')
    );
    exp.issuerID = Id.fromBigInt(
      BigInt('27918766665310231445021466320959318414450284884582375163563581940319453185')
    );
    exp.issuerClaimIdenState = newHashFromString(
      '19157496396839393206871475267813888069926627705277243727237933406423274512449'
    );
    exp.issuerClaimNonRevState = newHashFromString(
      '19157496396839393206871475267813888069926627705277243727237933406423274512449'
    );
    exp.circuitQueryHash = quaryHash;
    exp.timestamp = timestamp;
    exp.merklized = 0;
    exp.isRevocationChecked = 1;
    exp.challenge = BigInt(10),
    exp.gistRoot = newHashFromString("11098939821764568131087645431296528907277253709936443029379587475821759259406");
    expect(exp).to.deep.equal(out);
  });
});
