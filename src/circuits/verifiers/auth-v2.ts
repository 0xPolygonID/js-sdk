import { getDateFromUnixTimestamp } from '@iden3/js-iden3-core';
import { StateResolvers } from '../../storage';
import { byteEncoder } from '../../utils';
import { AuthV2PubSignals } from '../auth-v2';
import { BaseConfig } from '../common';
import { IDOwnershipPubSignals } from '../ownership-verifier';
import { checkGlobalState, getResolverByID } from './common';
import { PubSignalsVerifier, VerifyOpts } from './pub-signal-verifier';

const defaultAuthVerifyOpts = 5 * 60 * 1000; // 5 minutes

/**
 * Auth V2 pub signals verifier
 *
 * @public
 * @class AuthPubSignalsVerifier
 * @extends {IDOwnershipPubSignals}
 * @implements {PubSignalsVerifier}
 */
export class AuthV2PubSignalsVerifier extends IDOwnershipPubSignals implements PubSignalsVerifier {
  pubSignals = new AuthV2PubSignals();
  constructor(pubSignals: string[]) {
    super();
    this.pubSignals = this.pubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals))
    );

    this.userId = this.pubSignals.userID;
    this.challenge = this.pubSignals.challenge;
  }

  verifyQuery(): Promise<BaseConfig> {
    return Promise.resolve(new BaseConfig());
  }

  async verifyStates(resolvers: StateResolvers, opts?: VerifyOpts): Promise<void> {
    const resolver = getResolverByID(resolvers, this.userId);
    if (!resolver) {
      throw new Error(`resolver not found for id ${this.userId.string()}`);
    }
    const gist = await checkGlobalState(resolver, this.pubSignals.GISTRoot);

    let acceptedStateTransitionDelay = defaultAuthVerifyOpts;
    if (opts?.acceptedStateTransitionDelay) {
      acceptedStateTransitionDelay = opts.acceptedStateTransitionDelay;
    }

    if (!gist.latest) {
      const timeDiff =
        Date.now() - getDateFromUnixTimestamp(Number(gist.transitionTimestamp)).getTime();
      if (timeDiff > acceptedStateTransitionDelay) {
        throw new Error('global state is outdated');
      }
    }
  }

  verifyIdOwnership(sender: string, challenge: bigint): Promise<void> {
    return super.verifyIdOwnership(sender, challenge);
  }
}
