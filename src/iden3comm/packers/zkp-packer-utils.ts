import { Token } from '@iden3/js-jwz';
import { BasicMessage } from '../types';
import { ErrSenderNotUsedTokenCreation, ErrUnknownCircuitID } from '../errors';
import { AuthV3PubSignals, CircuitId } from '../../circuits';
import { byteEncoder } from '../../utils';
import { BytesHelper, DID } from '@iden3/js-iden3-core';
import { AcceptJwzAlgorithms, MediaType } from '../constants';
import { parseAcceptProfile } from '../utils';

export async function verifySender(token: Token, msg: BasicMessage): Promise<void> {
  switch (token.circuitId) {
    case CircuitId.AuthV2:
    case CircuitId.AuthV3_8_32:
    case CircuitId.AuthV3:
      {
        if (!msg.from) {
          throw new Error(ErrSenderNotUsedTokenCreation);
        }
        const authSignals = new AuthV3PubSignals().pubSignalsUnmarshal(
          byteEncoder.encode(JSON.stringify(token.zkProof.pub_signals))
        );
        const did = DID.parseFromId(authSignals.userID);

        const msgHash = await token.getMessageHash();
        const challenge = BytesHelper.bytesToInt(msgHash.reverse());

        if (challenge !== authSignals.challenge) {
          throw new Error(ErrSenderNotUsedTokenCreation);
        }

        if (msg.from !== did.string()) {
          throw new Error(ErrSenderNotUsedTokenCreation);
        }
      }
      break;
    default:
      throw new Error(ErrUnknownCircuitID);
  }
}

export function getSupportedProfiles(
  supportedProtocolVersions: string[],
  mediaType: MediaType,
  supportedAlgorithms: AcceptJwzAlgorithms[],
  supportedCircuitIds: string[]
): string[] {
  return supportedProtocolVersions.map(
    (v) =>
      `${v};env=${mediaType};alg=${supportedAlgorithms.join(
        ','
      )};circuitIds=${supportedCircuitIds.join(',')}`
  );
}

export function isProfileSupported(
  profile: string,
  supportedProtocolVersions: string[],
  mediaType: MediaType,
  supportedAlgorithms: AcceptJwzAlgorithms[],
  supportedCircuitIds: string[]
): boolean {
  const { protocolVersion, env, circuits, alg } = parseAcceptProfile(profile);

  if (!supportedProtocolVersions.includes(protocolVersion)) {
    return false;
  }

  if (env !== mediaType) {
    return false;
  }

  const circuitIdSupported =
    !circuits?.length || circuits.some((c) => supportedCircuitIds.includes(c as string));

  const supportedAlgArr = supportedAlgorithms;
  const algSupported =
    !alg?.length || alg.some((a) => supportedAlgArr.includes(a as AcceptJwzAlgorithms));
  return algSupported && circuitIdSupported;
}
