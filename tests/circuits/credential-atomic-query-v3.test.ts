import {
  IdentityTest,
  coreSchemaFromStr,
  defaultUserClaim,
  issuerPK,
  mtHashFromStr,
  prepareIntArray,
  userPK
} from './utils';
import {
  AtomicQueryV3Inputs,
  AtomicProofType,
  AtomicQueryV3PubSignals,
  prepareCircuitArrayValues
} from '../../src/circuits';
import { Operators, Query, byteDecoder, byteEncoder } from '../../src';
import expectedSigJson from './data/atomic-query-v3-sig.json';
import expectedMTPJson from './data/atomic-query-v3-mtp.json';
import { expect } from 'chai';
import { Id } from '@iden3/js-iden3-core';
import { ZERO_HASH } from '@iden3/js-merkletree';

const timestamp = 1642074362;

describe('Credential Atomic Query V3', () => {
  it('TestAttrQueryV3_SigPart_PrepareInputs', async () => {
    const user = await IdentityTest.newIdentity(userPK);
    const issuer = await IdentityTest.newIdentity(issuerPK);

    const subjectID = user.id;
    const profileNonce = 0n;

    const nonceSubject = 0n;

    const claim = defaultUserClaim(subjectID);

    // Sig claim
    const claimSig = issuer.signClaim(claim);

    const issuerClaimNonRevMtp = await issuer.claimRevMTPRaw(claim);

    const issuerAuthClaimNonRevMtp = await issuer.claimRevMTPRaw(issuer.authClaim);
    const issuerAuthClaimMtp = await issuer.claimMTPRaw(issuer.authClaim);

    const input = new AtomicQueryV3Inputs();

    input.requestID = 23n;
    input.id = user.id;
    input.profileNonce = profileNonce;
    input.claimSubjectProfileNonce = nonceSubject;
    input.claim = {
      issuerID: issuer.id,
      claim,
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
    query.values = prepareIntArray([10n], 64);
    input.query = query;

    input.currentTimeStamp = timestamp;
    input.proofType = AtomicProofType.Sig;

    const bytesInputs = input.inputsMarshal();

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

    const input = new AtomicQueryV3Inputs();
    input.requestID = 23n;
    input.id = user.id;
    input.profileNonce = nonce;
    input.claimSubjectProfileNonce = nonceSubject;
    input.claim = {
      issuerID: issuer.id,
      claim,
      incProof: {
        proof: issuerClaimMtp.proof,
        treeState: {
          state: await issuer.state(),
          claimsRoot: await issuer.clt.root(),
          revocationRoot: await issuer.ret.root(),
          rootOfRoots: await issuer.rot.root()
        }
      },
      nonRevProof: {
        proof: issuerClaimNonRevMtp.proof,
        treeState: {
          state: await issuer.state(),
          claimsRoot: await issuer.clt.root(),
          revocationRoot: await issuer.ret.root(),
          rootOfRoots: await issuer.rot.root()
        }
      }
    };

    input.query = new Query();
    input.query.operator = Operators.EQ;
    input.query.slotIndex = 2;
    input.query.values = prepareIntArray([10n], 64);
    input.currentTimeStamp = timestamp;
    input.proofType = AtomicProofType.MTP;

    const bytesInputs = input.inputsMarshal();

    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));
    expect(actualJson).to.deep.equal(expectedMTPJson);
  });

  it('TestAtomicQueryV3Outputs_Sig_CircuitUnmarshal', async () => {
    const out = new AtomicQueryV3PubSignals();
    out.pubSignalsUnmarshal(
      byteEncoder.encode(
        `[
     "0",
     "23148936466334350744548790012294489365207440754509988986684797708370051073",
     "2943483356559152311923412925436024635269538717812859789851139200242297094",
     "0",
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
     "0"
    ]`
      )
    );

    const expValue = prepareCircuitArrayValues([BigInt(10)], 64);

    const exp = new AtomicQueryV3PubSignals();
    exp.requestID = 23n;
    exp.userID = Id.fromBigInt(
      BigInt('23148936466334350744548790012294489365207440754509988986684797708370051073')
    );
    exp.issuerID = Id.fromBigInt(
      BigInt('21933750065545691586450392143787330185992517860945727248803138245838110721')
    );
    exp.issuerAuthState = mtHashFromStr(
      '2943483356559152311923412925436024635269538717812859789851139200242297094'
    );
    exp.issuerClaimNonRevState = mtHashFromStr(
      '2943483356559152311923412925436024635269538717812859789851139200242297094'
    );
    exp.claimSchema = coreSchemaFromStr('180410020913331409885634153623124536270');
    exp.slotIndex = 2;
    exp.operator = 1;
    exp.value = expValue;
    exp.timestamp = timestamp;
    exp.merklized = 0;
    exp.claimPathKey = 0n;
    exp.claimPathNotExists = 0;
    exp.isRevocationChecked = 1;
    exp.issuerClaimIdenState = ZERO_HASH;
    exp.proofType = 0;
    expect(exp).to.deep.equal(out);
  });

  it('TestAtomicQueryV3Outputs_MTP_CircuitUnmarshal', async () => {
    const out = new AtomicQueryV3PubSignals();
    out.pubSignalsUnmarshal(
      byteEncoder.encode(
        `[
 "0",
 "19104853439462320209059061537253618984153217267677512271018416655565783041",
 "0",
 "1",
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
 "5687720250943511874245715094520098014548846873346473635855112185560372332782"
]`
      )
    );

    const expValue = prepareCircuitArrayValues([BigInt(10)], 64);

    const exp = new AtomicQueryV3PubSignals();
    exp.requestID = 23n;
    exp.userID = Id.fromBigInt(
      BigInt('19104853439462320209059061537253618984153217267677512271018416655565783041')
    );
    exp.issuerID = Id.fromBigInt(
      BigInt('23528770672049181535970744460798517976688641688582489375761566420828291073')
    );
    exp.issuerAuthState = ZERO_HASH;
    exp.issuerClaimNonRevState = mtHashFromStr(
      '5687720250943511874245715094520098014548846873346473635855112185560372332782'
    );
    exp.claimSchema = coreSchemaFromStr('180410020913331409885634153623124536270');
    exp.slotIndex = 2;
    exp.operator = 1;
    exp.value = expValue;
    exp.timestamp = timestamp;
    exp.merklized = 0;
    exp.claimPathKey = 0n;
    exp.claimPathNotExists = 0;
    exp.isRevocationChecked = 1;
    exp.issuerClaimIdenState = mtHashFromStr(
      '5687720250943511874245715094520098014548846873346473635855112185560372332782'
    );
    exp.proofType = 1;
    expect(exp).to.deep.equal(out);
  });
});
