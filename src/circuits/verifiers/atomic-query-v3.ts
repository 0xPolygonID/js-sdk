import { DID, getDateFromUnixTimestamp } from '@iden3/js-iden3-core';
import { DocumentLoader } from '@iden3/js-jsonld-merklization';
import { JSONObject } from '../../iden3comm';
import { StateResolvers } from '../../storage';
import { byteEncoder } from '../../utils';
import { ProofQuery, ProofType } from '../../verifiable';
import { AtomicQueryV3PubSignals } from '../atomic-query-v3';
import { BaseConfig } from '../common';
import { IDOwnershipPubSignals } from '../ownership-verifier';
import { checkIssuerNonRevState, checkUserState, getResolverByID } from './common';
import { PubSignalsVerifier, VerifyOpts } from './pub-signal-verifier';
import { checkQueryRequest, ClaimOutputs } from './query';

const defaultProofVerifyOpts = 1 * 60 * 60 * 1000; // 1 hour

/**
 * Atomic query v3 pub signals verifier
 *
 * @public
 * @class AtomicQueryV3PubSignalsVerifier
 * @extends {IDOwnershipPubSignals}
 * @implements {PubSignalsVerifier}
 */
export class AtomicQueryV3PubSignalsVerifier
  extends IDOwnershipPubSignals
  implements PubSignalsVerifier
{
  pubSignals = new AtomicQueryV3PubSignals();

  constructor(pubSignals: string[]) {
    super();
    this.pubSignals = this.pubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals))
    );

    this.userId = this.pubSignals.userID;
    this.challenge = this.pubSignals.requestID;
  }

  async verifyQuery(
    query: ProofQuery,
    schemaLoader?: DocumentLoader,
    verifiablePresentation?: JSON,
    opts?: VerifyOpts,
    params?: JSONObject
  ): Promise<BaseConfig> {
    const outs: ClaimOutputs = {
      issuerId: this.pubSignals.issuerID,
      schemaHash: this.pubSignals.claimSchema,
      slotIndex: this.pubSignals.slotIndex,
      operator: this.pubSignals.operator,
      value: this.pubSignals.value,
      timestamp: this.pubSignals.timestamp,
      merklized: this.pubSignals.merklized,
      claimPathKey: this.pubSignals.claimPathKey,
      claimPathNotExists: this.pubSignals.claimPathNotExists,
      valueArraySize: this.pubSignals.getValueArrSize(),
      isRevocationChecked: this.pubSignals.isRevocationChecked
    };
    await checkQueryRequest(query, outs, schemaLoader, verifiablePresentation, opts);

    const { proofType, verifierID, nullifier, nullifierSessionID, linkID } = this.pubSignals;

    switch (query.proofType) {
      case ProofType.BJJSignature:
        if (proofType !== 1) {
          throw new Error('wrong proof type for BJJSignature');
        }
        break;
      case ProofType.Iden3SparseMerkleTreeProof:
        if (proofType !== 2) {
          throw new Error('wrong proof type for Iden3SparseMerkleTreeProof');
        }
        break;
      default:
        throw new Error('invalid proof type');
    }

    const nSessionId = BigInt((params?.nullifierSessionId as string) ?? 0);

    if (nSessionId !== 0n) {
      if (BigInt(nullifier ?? 0) === 0n) {
        throw new Error('nullifier should be provided for nullification and should not be 0');
      }
      // verify nullifier information
      const verifierDIDParam = params?.verifierDid;
      if (!verifierDIDParam) {
        throw new Error('verifierDid is required');
      }

      const id = DID.idFromDID(verifierDIDParam as DID);

      if (verifierID.bigInt() != id.bigInt()) {
        throw new Error('wrong verifier is used for nullification');
      }

      if (nullifierSessionID !== nSessionId) {
        throw new Error(
          `wrong verifier session id is used for nullification, expected ${nSessionId}, got ${nullifierSessionID}`
        );
      }
    } else if (nullifierSessionID !== 0n) {
      throw new Error(`Nullifier id is generated but wasn't requested`);
    }

    if (!query.groupId && linkID !== 0n) {
      throw new Error(`proof contains link id, but group id is not provided`);
    }

    if (query.groupId && linkID === 0n) {
      throw new Error("proof doesn't contain link id, but group id is provided");
    }

    return this.pubSignals;
  }

  async verifyStates(resolvers: StateResolvers, opts?: VerifyOpts): Promise<void> {
    const resolver = getResolverByID(resolvers, this.pubSignals.issuerID);
    if (!resolver) {
      throw new Error(`resolver not found for issuerID ${this.pubSignals.issuerID.string()}`);
    }

    await checkUserState(resolver, this.pubSignals.issuerID, this.pubSignals.issuerState);

    if (this.pubSignals.isRevocationChecked === 0) {
      return;
    }

    const issuerNonRevStateResolved = await checkIssuerNonRevState(
      resolver,
      this.pubSignals.issuerID,
      this.pubSignals.issuerClaimNonRevState
    );

    const acceptedStateTransitionDelay =
      opts?.acceptedStateTransitionDelay ?? defaultProofVerifyOpts;

    if (issuerNonRevStateResolved.latest) {
      return;
    }

    const timeDiff =
      Date.now() -
      getDateFromUnixTimestamp(Number(issuerNonRevStateResolved.transitionTimestamp)).getTime();
    if (timeDiff > acceptedStateTransitionDelay) {
      throw new Error('issuer state is outdated');
    }
  }
}
