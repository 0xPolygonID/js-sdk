import { Id } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';
import {
  AtomicQueryV3OnChainInputs,
  AtomicQueryV3OnChainPubSignals,
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
  calculateQueryHash,
  globalTree
} from './utils';

import expectedMtpJson from './data/atomic-query-v3-mtp-on-chain.json';
import expectedSigJson from './data/atomic-query-v3-sig-on-chain.json';
import { expect } from 'chai';
import { byteDecoder, byteEncoder, ProofType } from '../../src';

describe('atomic-query-v3', () => {
  it('TestAttrQueryV3OnChain_SigPart_PrepareInputs', async () => {
    const user = await IdentityTest.newIdentity(userPK);
    const issuer = await IdentityTest.newIdentity(issuerPK);

    const nonce = BigInt(0);

    const subjectID = user.id;
    const nonceSubject = BigInt(0);

    const claim = defaultUserClaim(subjectID);

    const claimSig = await issuer.signClaim(claim);

    const issuerClaimNonRevMtp = await issuer.claimRevMTPRaw(claim);

    const issuerAuthClaimNonRevMtp = await issuer.claimRevMTPRaw(issuer.authClaim);
    const issuerAuthClaimMtp = await issuer.claimMTPRaw(issuer.authClaim);

    const gTree = globalTree();

    await gTree.add(issuer.id.bigInt(), (await issuer.state()).bigInt());
    const globalProof = await gTree.generateProof(user.id.bigInt());

    const authClaimIncMTP = await user.claimMTPRaw(user.authClaim);
    const authClaimNonRevMTP = await user.claimRevMTPRaw(user.authClaim);
    const challenge = BigInt(10);
    const signature = user.signBJJ(challenge);

    const inputs = new AtomicQueryV3OnChainInputs();

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
      signatureProof: {
        signature: claimSig,
        issuerAuthClaim: issuer.authClaim,
        issuerAuthIncProof: {
          treeState: {
            state: await issuer.state(),
            claimsRoot: await issuer.clt.root(),
            revocationRoot: await issuer.ret.root(),
            rootOfRoots: await issuer.rot.root()
          },
          proof: issuerAuthClaimMtp.proof
        },
        issuerAuthNonRevProof: {
          treeState: {
            state: await issuer.state(),
            claimsRoot: await issuer.clt.root(),
            revocationRoot: await issuer.ret.root(),
            rootOfRoots: await issuer.rot.root()
          },
          proof: issuerAuthClaimNonRevMtp.proof
        }
      }
    };

    const query = new Query();
    query.operator = Operators.EQ;
    query.slotIndex = 2;
    query.values = prepareIntArray([BigInt(10)], 64);
    inputs.query = query;
    inputs.currentTimeStamp = timestamp;
    inputs.proofType = ProofType.BJJSignature;

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

    inputs.linkNonce = BigInt(0);
    inputs.verifierID = Id.fromBigInt(
      BigInt('21929109382993718606847853573861987353620810345503358891473103689157378049')
    );
    inputs.nullifierSessionID = BigInt(32);
    inputs.authEnabled = 1;

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));

    expect(actualJson).to.deep.equal(expectedSigJson);
  });

  it('TestAttrQueryV3OnChain_MTPPart_PrepareInputs', async () => {
    const user = await IdentityTest.newIdentity(userPK);
    const issuer = await IdentityTest.newIdentity(issuerPK);

    const nonce = BigInt(0);

    const subjectID = user.id;
    const nonceSubject = BigInt(0);

    const claim = defaultUserClaim(subjectID);

    await issuer.addClaim(claim);

    const issuerClaimMtp = await issuer.claimMTPRaw(claim);

    const issuerClaimNonRevMtp = await issuer.claimRevMTPRaw(claim);

    const inputs = new AtomicQueryV3OnChainInputs();

    const gTree = globalTree();

    await gTree.add(issuer.id.bigInt(), (await issuer.state()).bigInt());
    const globalProof = await gTree.generateProof(user.id.bigInt());

    const authClaimIncMTP = await user.claimMTPRaw(user.authClaim);
    const authClaimNonRevMTP = await user.claimRevMTPRaw(user.authClaim);
    const challenge = BigInt(10);
    const signature = user.signBJJ(challenge);

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
    inputs.proofType = ProofType.Iden3SparseMerkleTreeProof;

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

    inputs.linkNonce = BigInt(0);
    inputs.verifierID = Id.fromBigInt(
      BigInt('21929109382993718606847853573861987353620810345503358891473103689157378049')
    );
    inputs.nullifierSessionID = BigInt(32);
    inputs.authEnabled = 1;

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));

    expect(actualJson).to.deep.equal(expectedMtpJson);
  });

  it('TestAtomicQueryV3OnChainOutputs_Sig_CircuitUnmarshal', () => {
    const out = new AtomicQueryV3OnChainPubSignals();
    out.pubSignalsUnmarshal(
      byteEncoder.encode(
        `[
          "0",
          "26109404700696283154998654512117952420503675471097392618762221546565140481",
          "7002038488948284767652984010448061038733120594540539539730565455904340350321",
          "2943483356559152311923412925436024635269538717812859789851139200242297094",
          "0",
          "0",
          "0",
          "1",
          "23",
          "10",
          "20177832565449474772630743317224985532862797657496372535616634430055981993180",
          "27918766665310231445021466320959318414450284884582375163563581940319453185",
          "1",
          "20177832565449474772630743317224985532862797657496372535616634430055981993180",
          "1642074362",
          "21929109382993718606847853573861987353620810345503358891473103689157378049",
          "32",
          "1"
          ]`
      )
    );

    const expValue = prepareCircuitArrayValues([BigInt(10)], 64);
    const schema = '180410020913331409885634153623124536270';
    const slotIndex = 2;
    const operator = 1;
    const queryHash = calculateQueryHash(expValue, schema, slotIndex, operator, 0, 1);

    const exp = new AtomicQueryV3OnChainPubSignals();
    exp.requestID = BigInt(23);
    exp.userID = Id.fromBigInt(
      BigInt('26109404700696283154998654512117952420503675471097392618762221546565140481')
    );
    exp.issuerID = Id.fromBigInt(
      BigInt('27918766665310231445021466320959318414450284884582375163563581940319453185')
    );
    exp.issuerState = Hash.fromString(
      '2943483356559152311923412925436024635269538717812859789851139200242297094'
    );
    exp.issuerClaimNonRevState = Hash.fromString(
      '20177832565449474772630743317224985532862797657496372535616634430055981993180'
    );
    exp.circuitQueryHash = queryHash;
    exp.timestamp = timestamp;
    exp.merklized = 0;
    exp.isRevocationChecked = 1;
    exp.challenge = BigInt(10);
    exp.gistRoot = Hash.fromString(
      '20177832565449474772630743317224985532862797657496372535616634430055981993180'
    );
    exp.proofType = 1;
    exp.linkID = BigInt(0);
    exp.nullifier = BigInt(0);
    exp.operatorOutput = BigInt(0);
    exp.verifierID = Id.fromBigInt(
      BigInt('21929109382993718606847853573861987353620810345503358891473103689157378049')
    );
    exp.nullifierSessionID = BigInt(32);
    exp.authEnabled = 1;
    expect(exp).to.deep.equal(out);
  });

  it('TestAtomicQueryV3OnChainOutputs_MTP_CircuitUnmarshal', () => {
    const out = new AtomicQueryV3OnChainPubSignals();
    out.pubSignalsUnmarshal(
      byteEncoder.encode(
        `[
          "0",
          "26109404700696283154998654512117952420503675471097392618762221546565140481",
          "7002038488948284767652984010448061038733120594540539539730565455904340350321",
          "2943483356559152311923412925436024635269538717812859789851139200242297094",
          "0",
          "0",
          "0",
          "2",
          "23",
          "10",
          "20177832565449474772630743317224985532862797657496372535616634430055981993180",
          "27918766665310231445021466320959318414450284884582375163563581940319453185",
          "1",
          "20177832565449474772630743317224985532862797657496372535616634430055981993180",
          "1642074362",
          "21929109382993718606847853573861987353620810345503358891473103689157378049",
          "32",
          "1"
          ]`
      )
    );

    const expValue = prepareCircuitArrayValues([BigInt(10)], 64);
    const schema = '180410020913331409885634153623124536270';
    const slotIndex = 2;
    const operator = 1;
    const queryHash = calculateQueryHash(expValue, schema, slotIndex, operator, 0, 1);

    const exp = new AtomicQueryV3OnChainPubSignals();
    exp.requestID = BigInt(23);
    exp.userID = Id.fromBigInt(
      BigInt('26109404700696283154998654512117952420503675471097392618762221546565140481')
    );
    exp.issuerID = Id.fromBigInt(
      BigInt('27918766665310231445021466320959318414450284884582375163563581940319453185')
    );
    exp.issuerClaimNonRevState = Hash.fromString(
      '20177832565449474772630743317224985532862797657496372535616634430055981993180'
    );
    exp.circuitQueryHash = queryHash;
    exp.timestamp = timestamp;
    exp.merklized = 0;
    exp.isRevocationChecked = 1;
    exp.challenge = BigInt(10);
    exp.gistRoot = Hash.fromString(
      '20177832565449474772630743317224985532862797657496372535616634430055981993180'
    );
    exp.proofType = 2;
    exp.issuerState = Hash.fromString(
      '2943483356559152311923412925436024635269538717812859789851139200242297094'
    );
    exp.operatorOutput = BigInt(0);
    exp.linkID = BigInt(0);
    exp.nullifier = BigInt(0);
    exp.verifierID = Id.fromBigInt(
      BigInt('21929109382993718606847853573861987353620810345503358891473103689157378049')
    );
    exp.nullifierSessionID = BigInt(32);
    exp.authEnabled = 1;
    expect(exp).to.deep.equal(out);
  });
});
