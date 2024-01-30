import { getDateFromUnixTimestamp } from '@iden3/js-iden3-core';
import { DocumentLoader } from '@iden3/js-jsonld-merklization';
import { checkIssuerNonRevState, checkUserState, getResolverByID, StateResolvers } from '../../storage';
import { byteEncoder } from '../../utils';
import { ProofQuery } from '../../verifiable';
import { AtomicQueryMTPV2PubSignals } from '../atomic-query-mtp-v2';
import { BaseConfig } from '../common';
import { IDOwnershipPubSignals } from '../ownership-verifier';
import {
  defaultProofVerifyOpts,
} from './common';
import { PubSignalsVerifier, VerifyOpts } from './pub-signal-verifier';
import { checkQueryRequest, ClaimOutputs } from './query';

/**
 * MTP v2 pub signals verifier
 *
 * @public
 * @class AtomicQueryMTPV2PubSignalsVerifier
 * @extends {IDOwnershipPubSignals}
 * @implements {PubSignalsVerifier}
 */
export class AtomicQueryMTPV2PubSignalsVerifier
  extends IDOwnershipPubSignals
  implements PubSignalsVerifier
{
  pubSignals = new AtomicQueryMTPV2PubSignals();
  constructor(pubSignals: string[]) {
    super();
    this.pubSignals = this.pubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals))
    );

    if (!this.pubSignals.userID) {
      throw new Error('user id is not presented in proof public signals');
    }

    if (!this.pubSignals.requestID) {
      throw new Error('requestId is not presented in proof public signals');
    }

    this.userId = this.pubSignals.userID;
    this.challenge = this.pubSignals.requestID;
  }

  async verifyQuery(
    query: ProofQuery,
    schemaLoader?: DocumentLoader,
    verifiablePresentation?: JSON,
    opts?: VerifyOpts
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

    return this.pubSignals;
  }

  async verifyStates(resolvers: StateResolvers, opts?: VerifyOpts): Promise<void> {
    const resolver = getResolverByID(resolvers, this.pubSignals.issuerID);
    if (!resolver) {
      throw new Error(`resolver not found for issuerID ${this.pubSignals.issuerID.string()}`);
    }

    await checkUserState(resolver, this.pubSignals.issuerID, this.pubSignals.issuerClaimIdenState);

    if (this.pubSignals.isRevocationChecked === 0) {
      return;
    }

    const issuerNonRevStateResolved = await checkIssuerNonRevState(
      resolver,
      this.pubSignals.issuerID,
      this.pubSignals.issuerClaimNonRevState
    );

    let acceptedStateTransitionDelay = defaultProofVerifyOpts;
    if (opts?.acceptedStateTransitionDelay) {
      acceptedStateTransitionDelay = opts.acceptedStateTransitionDelay;
    }

    if (!issuerNonRevStateResolved.latest) {
      const timeDiff =
        Date.now() -
        getDateFromUnixTimestamp(Number(issuerNonRevStateResolved.transitionTimestamp)).getTime();
      if (timeDiff > acceptedStateTransitionDelay) {
        throw new Error('issuer state is outdated');
      }
    }
  }
}
