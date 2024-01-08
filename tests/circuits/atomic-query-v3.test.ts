import { Id, SchemaHash } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';
import {
  AtomicQueryV3Inputs,
  AtomicQueryV3PubSignals,
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
  prepareIntArray
} from './utils';

import expectedMtpJson from './data/atomic-query-v3-mtp.json';
import expectedSigJson from './data/atomic-query-v3-sig.json';
import { expect } from 'chai';
import { byteDecoder, byteEncoder, ProofType } from '../../src';

describe('atomic-query-v3', () => {
  it('TestAttrQueryV3_SigPart_PrepareInputs', async () => {
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

    const inputs = new AtomicQueryV3Inputs();

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
    inputs.linkNonce = BigInt(0);
    inputs.verifierID = Id.fromBigInt(
      BigInt('21929109382993718606847853573861987353620810345503358891473103689157378049')
    );
    inputs.nullifierSessionID = BigInt(32);

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));

    expect(actualJson).to.deep.equal(expectedSigJson);
  });

  it('TestAttrQueryV3_MTPPart_PrepareInputs', async () => {
    const user = await IdentityTest.newIdentity(userPK);
    const issuer = await IdentityTest.newIdentity(issuerPK);

    const nonce = BigInt(0);

    const subjectID = user.id;
    const nonceSubject = BigInt(0);

    const claim = defaultUserClaim(subjectID);

    await issuer.addClaim(claim);

    const issuerClaimMtp = await issuer.claimMTPRaw(claim);

    const issuerClaimNonRevMtp = await issuer.claimRevMTPRaw(claim);

    const inputs = new AtomicQueryV3Inputs();

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
    inputs.linkNonce = BigInt(0);
    inputs.verifierID = Id.fromBigInt(
      BigInt('21929109382993718606847853573861987353620810345503358891473103689157378049')
    );
    inputs.nullifierSessionID = BigInt(32);

    const bytesInputs = inputs.inputsMarshal();

    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));

    expect(actualJson).to.deep.equal(expectedMtpJson);
  });

  it('TestAtomicQueryV3Outputs_Sig_CircuitUnmarshal', () => {
    const out = new AtomicQueryV3PubSignals();
    out.pubSignalsUnmarshal(
      byteEncoder.encode(
        `[
          "0",
          "23148936466334350744548790012294489365207440754509988986684797708370051073",
          "2943483356559152311923412925436024635269538717812859789851139200242297094",
          "0",
          "0",
          "0",
          "1",
          "23",
          "21933750065545691586450392143787330185992517860945727248803138245838110721",
          "1",
          "2943483356559152311923412925436024635269538717812859789851139200242297094",
          "1642074362",
          "180410020913331409885634153623124536270",
          "0",
          "0",
          "2",
          "1",
          "10",
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
          "0",
          "21929109382993718606847853573861987353620810345503358891473103689157378049",
          "32"
          ]`
      )
    );

    const expValue = prepareCircuitArrayValues([BigInt(10)], 64);

    const exp = new AtomicQueryV3PubSignals();
    exp.requestID = BigInt(23);
    exp.userID = Id.fromBigInt(
      BigInt('23148936466334350744548790012294489365207440754509988986684797708370051073')
    );
    exp.issuerID = Id.fromBigInt(
      BigInt('21933750065545691586450392143787330185992517860945727248803138245838110721')
    );
    exp.issuerState = Hash.fromString(
      '2943483356559152311923412925436024635269538717812859789851139200242297094'
    );
    exp.issuerClaimNonRevState = Hash.fromString(
      '2943483356559152311923412925436024635269538717812859789851139200242297094'
    );
    exp.claimSchema = SchemaHash.newSchemaHashFromInt(
      BigInt('180410020913331409885634153623124536270')
    );

    exp.slotIndex = 2;
    exp.operator = 1;
    exp.value = expValue;
    exp.timestamp = timestamp;
    exp.merklized = 0;
    exp.claimPathKey = BigInt(0);
    exp.claimPathNotExists = 0;
    exp.isRevocationChecked = 1;
    exp.proofType = 1;
    exp.linkID = BigInt(0);
    exp.nullifier = BigInt(0);
    exp.operatorOutput = BigInt(0);
    exp.verifierID = Id.fromBigInt(
      BigInt('21929109382993718606847853573861987353620810345503358891473103689157378049')
    );
    exp.nullifierSessionID = BigInt(32);
    expect(exp).to.deep.equal(out);
  });

  it('TestAtomicQueryV3Outputs_MTP_CircuitUnmarshal', () => {
    const out = new AtomicQueryV3PubSignals();
    out.pubSignalsUnmarshal(
      byteEncoder.encode(
        `[
          "0",
          "19104853439462320209059061537253618984153217267677512271018416655565783041",
          "5687720250943511874245715094520098014548846873346473635855112185560372332782",
          "0",
          "0",
          "0",
          "2",
          "23",
          "23528770672049181535970744460798517976688641688582489375761566420828291073",
          "1",
          "5687720250943511874245715094520098014548846873346473635855112185560372332782",
          "1642074362",
          "180410020913331409885634153623124536270",
          "0",
          "0",
          "2",
          "1",
          "10",
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
          "0",
          "21929109382993718606847853573861987353620810345503358891473103689157378049",
          "32"
          ]`
      )
    );

    const expValue = prepareCircuitArrayValues([BigInt(10)], 64);

    const exp = new AtomicQueryV3PubSignals();
    exp.requestID = BigInt(23);
    exp.userID = Id.fromBigInt(
      BigInt('19104853439462320209059061537253618984153217267677512271018416655565783041')
    );
    exp.issuerID = Id.fromBigInt(
      BigInt('23528770672049181535970744460798517976688641688582489375761566420828291073')
    );
    exp.issuerState = Hash.fromString(
      '5687720250943511874245715094520098014548846873346473635855112185560372332782'
    );
    exp.issuerClaimNonRevState = Hash.fromString(
      '5687720250943511874245715094520098014548846873346473635855112185560372332782'
    );
    exp.claimSchema = SchemaHash.newSchemaHashFromInt(
      BigInt('180410020913331409885634153623124536270')
    );

    exp.slotIndex = 2;
    exp.operator = 1;
    exp.value = expValue;
    exp.timestamp = timestamp;
    exp.merklized = 0;
    exp.claimPathKey = BigInt(0);
    exp.claimPathNotExists = 0;
    exp.isRevocationChecked = 1;
    exp.proofType = 2;
    exp.linkID = BigInt(0);
    exp.nullifier = BigInt(0);
    exp.operatorOutput = BigInt(0);
    exp.verifierID = Id.fromBigInt(
      BigInt('21929109382993718606847853573861987353620810345503358891473103689157378049')
    );
    exp.nullifierSessionID = BigInt(32);
    expect(exp).to.deep.equal(out);
  });
});
