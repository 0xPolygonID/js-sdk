import { getRandomBytes, poseidon } from '@iden3/js-crypto';
import {
  AcceptProfile,
  AuthMethod,
  AuthProofResponse,
  BasicMessage,
  JsonDocumentObject,
  JWSPackerParams,
  ZeroKnowledgeProofAuthResponse,
  ZeroKnowledgeProofQuery,
  ZeroKnowledgeProofRequest,
  ZeroKnowledgeProofResponse
} from '../types';
import { byteEncoder, bytesToHex, mergeObjects } from '../../utils';
import { RevocationStatus, W3CCredential } from '../../verifiable';
import { BytesHelper, DID, getUnixTimestamp } from '@iden3/js-iden3-core';
import { IProofService } from '../../proof';
import { CircuitId } from '../../circuits';
import { AcceptJwsAlgorithms, defaultAcceptProfile, MediaType } from '../constants';
import { ethers, Signer } from 'ethers';
import { packZkpProof, prepareZkpProof } from '../utils';

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
    if (!opts.supportedCircuits.includes(proofReq.circuitId as CircuitId)) {
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
          throw new Error(`Credential not found for query ${JSON.stringify(combinedQuery)}`);
        }

        groupedCredentialsCache.set(groupId, credWithRevStatus);
      }
    }

    const credWithRevStatus = groupedCredentialsCache.get(groupId as number);

    const zkpRes: ZeroKnowledgeProofResponse = await proofService.generateProof(proofReq, to, {
      verifierDid: from,
      challenge: opts.challenge,
      skipRevocation: Boolean(query.skipClaimRevocationCheck),
      credential: credWithRevStatus?.cred,
      credentialRevocationStatus: credWithRevStatus?.revStatus,
      linkNonce: combinedQueryData?.linkNonce ? BigInt(combinedQueryData.linkNonce) : undefined
    });

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
    skipRevocation?: boolean;
    sender: string;
    zkpResponses: ZeroKnowledgeProofResponse[];
  }
): Promise<{ authResponse: AuthProofResponse; authProof?: ZeroKnowledgeProofAuthResponse }> => {
  if (!opts.acceptProfile) {
    opts.acceptProfile = defaultAcceptProfile;
  }
  if (!opts.skipRevocation) {
    opts.skipRevocation = true;
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
        if (!opts.sender) {
          throw new Error('Sender address is not provided');
        }
        if (!opts.zkpResponses || opts.zkpResponses.length === 0) {
          throw new Error('ZKP responses are not provided');
        }
        const challengeAuth = calcChallengeAuthV2(opts.sender, opts.zkpResponses);

        const zkpRes: ZeroKnowledgeProofAuthResponse = await proofService.generateAuthProof(
          circuitId as unknown as CircuitId,
          to,
          { challenge: challengeAuth, skipRevocation: opts.skipRevocation }
        );

        switch (circuitId as unknown as CircuitId) {
          case CircuitId.AuthV2: {
            const preparedZkpProof = prepareZkpProof(zkpRes.proof);
            const zkProofEncoded = packZkpProof(
              zkpRes.pub_signals,
              preparedZkpProof.a,
              preparedZkpProof.b,
              preparedZkpProof.c
            );

            return {
              authResponse: {
                authMethod: AuthMethod.AUTHV2,
                proof: zkProofEncoded
              },
              authProof: zkpRes
            };
          }
        }
      }
      throw new Error(`Auth method is not supported`);
    case MediaType.SignedMessage:
      if (!opts.acceptProfile.alg || opts.acceptProfile.alg.length === 0) {
        throw new Error('Algorithm not specified');
      }
      if (opts.acceptProfile.alg[0] === AcceptJwsAlgorithms.ES256KR) {
        const ethIdProof = packEthIdentityProof(to);

        return {
          authResponse: {
            authMethod: AuthMethod.ETH_IDENTITY,
            proof: ethIdProof
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

  const metadataArr: { key: string; value: Uint8Array }[] = [];
  if (zkProof.vp) {
    for (const key in zkProof.vp.verifiableCredential.credentialSubject) {
      if (key === '@type') {
        continue;
      }
      const metadataValue = poseidon.hashBytes(
        byteEncoder.encode(JSON.stringify(zkProof.vp.verifiableCredential.credentialSubject[key]))
      );
      const bytesValue = byteEncoder.encode(metadataValue.toString());
      metadataArr.push({
        key,
        value: bytesValue
      });
    }
  }

  const metadata = metadataArr.length ? packMetadatas(metadataArr) : emptyBytes;

  return { requestId, zkProofEncoded, metadata };
};

/**
 * Calculates the challenge authentication V2 value.
 * @param sender - The address of the sender.
 * @param zkpResponses - An array of ZeroKnowledgeProofResponse objects.
 * @returns A bigint representing the challenge authentication value.
 */
export const calcChallengeAuthV2 = (
  sender: string,
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
          [sender, responses]
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

/**
 * Packs an Ethereum identity proof from a Decentralized Identifier (DID).
 * @param did - Decentralized Identifier (DID) to pack.
 * @returns A hexadecimal string representing the packed DID identity proof.
 */
export const packEthIdentityProof = (did: DID): string => {
  return `0x${bytesToHex(BytesHelper.intToBytes(DID.idFromDID(did).bigInt()))}`;
};
