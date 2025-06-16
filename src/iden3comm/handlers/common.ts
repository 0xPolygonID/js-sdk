import { getRandomBytes } from '@iden3/js-crypto';
import {
  AcceptProfile,
  AuthMethod,
  AuthProof,
  BasicMessage,
  JsonDocumentObject,
  JWSPackerParams,
  ZeroKnowledgeProofAuthResponse,
  ZeroKnowledgeProofQuery,
  ZeroKnowledgeProofRequest,
  ZeroKnowledgeProofResponse
} from '../types';
import { mergeObjects } from '../../utils';
import { RevocationStatus, VerifiableConstants, W3CCredential } from '../../verifiable';
import { DID, getUnixTimestamp } from '@iden3/js-iden3-core';
import { IProofService } from '../../proof';
import { CircuitId } from '../../circuits';
import { AcceptJwsAlgorithms, defaultAcceptProfile, MediaType } from '../constants';
import { ethers, Signer } from 'ethers';
import { packZkpProof, prepareZkpProof } from '../../storage/blockchain/common';

/**
 * Groups the ZeroKnowledgeProofRequest objects based on their groupId.
 * Returns a Map where the key is the groupId and the value is an object containing the query and linkNonce.
 *
 * @param requestScope - An array of ZeroKnowledgeProofRequest objects.
 * @returns A Map<number, { query: ZeroKnowledgeProofQuery; linkNonce: number }> representing the grouped queries.
 */
const getGroupedQueries = (
  requestScope: ZeroKnowledgeProofRequest[]
): Map<number, { query: ZeroKnowledgeProofQuery; linkNonce: number }> =>
  requestScope.reduce((acc, proofReq) => {
    const groupId = proofReq.query.groupId as number | undefined;
    if (!groupId) {
      return acc;
    }

    const existedData = acc.get(groupId);
    if (!existedData) {
      const seed = getRandomBytes(12);
      const dataView = new DataView(seed.buffer);
      const linkNonce = dataView.getUint32(0);
      acc.set(groupId, { query: proofReq.query, linkNonce });
      return acc;
    }

    const credentialSubject = mergeObjects(
      existedData.query.credentialSubject as JsonDocumentObject,
      proofReq.query.credentialSubject as JsonDocumentObject
    );

    acc.set(groupId, {
      ...existedData,
      query: {
        skipClaimRevocationCheck:
          existedData.query.skipClaimRevocationCheck || proofReq.query.skipClaimRevocationCheck,
        ...existedData.query,
        credentialSubject
      }
    });

    return acc;
  }, new Map<number, { query: ZeroKnowledgeProofQuery; linkNonce: number }>());

/**
 * Processes zero knowledge proof requests.
 *
 * @param to - The identifier of the recipient.
 * @param requests - An array of zero knowledge proof requests.
 * @param from - The identifier of the sender.
 * @param proofService - The proof service.
 * @param opts - Additional options for processing the requests.
 * @returns A promise that resolves to an array of zero knowledge proof responses.
 */
export const processZeroKnowledgeProofRequests = async (
  to: DID,
  requests: ZeroKnowledgeProofRequest[] | undefined,
  from: DID | undefined,
  proofService: IProofService,
  opts: {
    mediaType?: MediaType;
    packerOptions?: JWSPackerParams;
    supportedCircuits: CircuitId[];
    ethSigner?: Signer;
    challenge?: bigint;
  }
): Promise<ZeroKnowledgeProofResponse[]> => {
  const requestScope = requests ?? [];

  const combinedQueries = getGroupedQueries(requestScope);

  const groupedCredentialsCache = new Map<
    number,
    { cred: W3CCredential; revStatus?: RevocationStatus }
  >();

  const zkpResponses = [];

  for (const proofReq of requestScope) {
    let zkpRes: ZeroKnowledgeProofResponse;
    try {
      const isCircuitSupported = opts.supportedCircuits.includes(proofReq.circuitId as CircuitId);
      if (!isCircuitSupported) {
        if (proofReq.optional) {
          continue;
        }
        throw new Error(`Circuit ${proofReq.circuitId} is not allowed`);
      }

      const query = proofReq.query;
      const groupId = query.groupId as number | undefined;
      const combinedQueryData = combinedQueries.get(groupId as number);

      if (groupId) {
        if (!combinedQueryData) {
          throw new Error(`Invalid group id ${query.groupId}`);
        }
        const combinedQuery = combinedQueryData.query;

        if (!groupedCredentialsCache.has(groupId)) {
          const credWithRevStatus = await proofService.findCredentialByProofQuery(
            to,
            combinedQueryData.query
          );
          if (!credWithRevStatus.cred) {
            if (proofReq.optional) {
              continue;
            }
            throw new Error(
              VerifiableConstants.ERRORS.PROOF_SERVICE_NO_CREDENTIAL_FOR_QUERY +
                `${JSON.stringify(combinedQuery)}`
            );
          }

          groupedCredentialsCache.set(groupId, credWithRevStatus);
        }
      }

      const credWithRevStatus = groupedCredentialsCache.get(groupId as number);
      zkpRes = await proofService.generateProof(proofReq, to, {
        verifierDid: from,
        challenge: opts.challenge,
        skipRevocation: Boolean(query.skipClaimRevocationCheck),
        credential: credWithRevStatus?.cred,
        credentialRevocationStatus: credWithRevStatus?.revStatus,
        linkNonce: combinedQueryData?.linkNonce ? BigInt(combinedQueryData.linkNonce) : undefined
      });
    } catch (error: unknown) {
      const expectedErrors = [
        VerifiableConstants.ERRORS.PROOF_SERVICE_NO_CREDENTIAL_FOR_IDENTITY_OR_PROFILE,
        VerifiableConstants.ERRORS.ID_WALLET_NO_CREDENTIAL_SATISFIED_QUERY,
        VerifiableConstants.ERRORS.CREDENTIAL_WALLET_ALL_CREDENTIALS_ARE_REVOKED
      ];
      // handle only errors in case credential is not found and it is optional proof request - otherwise throw
      if (
        error instanceof Error &&
        (expectedErrors.includes(error.message) ||
          error.message.includes(
            VerifiableConstants.ERRORS.PROOF_SERVICE_NO_CREDENTIAL_FOR_QUERY
          )) &&
        proofReq.optional
      ) {
        continue;
      }
      throw error;
    }

    zkpResponses.push(zkpRes);
  }

  return zkpResponses;
};

/**
 * Processes auth proof requests.
 *
 * @param to - The identifier of the recipient.
 * @param proofService - The proof service.
 * @param opts - Additional options for processing the requests.
 * @returns A promise that resolves to an auth proof response.
 */
export const processProofAuth = async (
  to: DID,
  proofService: IProofService,
  opts: {
    supportedCircuits: CircuitId[];
    acceptProfile?: AcceptProfile;
    senderAddress: string;
    zkpResponses: ZeroKnowledgeProofResponse[];
  }
): Promise<{ authProof: AuthProof }> => {
  if (!opts.acceptProfile) {
    opts.acceptProfile = defaultAcceptProfile;
  }

  switch (opts.acceptProfile.env) {
    case MediaType.ZKPMessage:
      if (!opts.acceptProfile.circuits) {
        throw new Error('Circuit not specified in accept profile');
      }

      for (const circuitId of opts.acceptProfile.circuits) {
        if (!opts.supportedCircuits.includes(circuitId as unknown as CircuitId)) {
          throw new Error(`Circuit ${circuitId} is not supported`);
        }
        if (!opts.senderAddress) {
          throw new Error('Sender address is not provided');
        }
        const challengeAuth = calcChallengeAuthV2(opts.senderAddress, opts.zkpResponses);

        const zkpRes: ZeroKnowledgeProofAuthResponse = await proofService.generateAuthProof(
          circuitId as unknown as CircuitId,
          to,
          { challenge: challengeAuth }
        );
        return {
          authProof: {
            authMethod: AuthMethod.AUTHV2,
            zkp: zkpRes
          }
        };
      }
      throw new Error(`Auth method is not supported`);
    case MediaType.SignedMessage:
      if (!opts.acceptProfile.alg || opts.acceptProfile.alg.length === 0) {
        throw new Error('Algorithm not specified');
      }
      if (opts.acceptProfile.alg[0] === AcceptJwsAlgorithms.ES256KR) {
        return {
          authProof: {
            authMethod: AuthMethod.ETH_IDENTITY,
            userDid: to
          }
        };
      }
      throw new Error(`Algorithm ${opts.acceptProfile.alg[0]} not supported`);
    default:
      throw new Error('Accept env not supported');
  }
};

/**
 * Processes a ZeroKnowledgeProofResponse object and prepares it for further use.
 * @param zkProof - The ZeroKnowledgeProofResponse object containing the proof data.
 * @returns An object containing the requestId, zkProofEncoded, and metadata.
 */
export const processProofResponse = (zkProof: ZeroKnowledgeProofResponse) => {
  const requestId = zkProof.id;
  const inputs = zkProof.pub_signals;
  const emptyBytes = '0x';

  if (inputs.length === 0) {
    return { requestId, zkProofEncoded: emptyBytes, metadata: emptyBytes };
  }

  const preparedZkpProof = prepareZkpProof(zkProof.proof);
  const zkProofEncoded = packZkpProof(
    inputs,
    preparedZkpProof.a,
    preparedZkpProof.b,
    preparedZkpProof.c
  );

  const metadata = emptyBytes;

  return { requestId, zkProofEncoded, metadata };
};

/**
 * Calculates the challenge authentication V2 value.
 * @param senderAddress - The address of the sender.
 * @param zkpResponses - An array of ZeroKnowledgeProofResponse objects.
 * @returns A bigint representing the challenge authentication value.
 */
export const calcChallengeAuthV2 = (
  senderAddress: string,
  zkpResponses: ZeroKnowledgeProofResponse[]
): bigint => {
  const responses = zkpResponses.map((zkpResponse) => {
    const response = processProofResponse(zkpResponse);
    return {
      requestId: response.requestId,
      proof: response.zkProofEncoded,
      metadata: response.metadata
    };
  });

  return (
    BigInt(
      ethers.keccak256(
        new ethers.AbiCoder().encode(
          ['address', '(uint256 requestId,bytes proof,bytes metadata)[]'],
          [senderAddress, responses]
        )
      )
    ) & BigInt('0x0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
  );
};

/**
 * Packs metadata into a string format suitable for encoding in a transaction.
 * @param metas - An array of objects containing key-value pairs to be packed.
 * @returns A string representing the packed metadata.
 */
export const packMetadatas = (
  metas: {
    key: string;
    value: Uint8Array;
  }[]
): string => {
  return new ethers.AbiCoder().encode(['tuple(' + 'string key,' + 'bytes value' + ')[]'], [metas]);
};

/**
 * Verifies that the expires_time field of a message is not in the past. Throws an error if it is.
 *
 * @param message - Basic message to verify.
 */
export const verifyExpiresTime = (message: BasicMessage) => {
  if (message?.expires_time && message.expires_time < getUnixTimestamp(new Date())) {
    throw new Error('Message expired');
  }
};
