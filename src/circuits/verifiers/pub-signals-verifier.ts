import { poseidon } from '@iden3/js-crypto';
import { DID, getDateFromUnixTimestamp, Id } from '@iden3/js-iden3-core';
import { DocumentLoader, Path } from '@iden3/js-jsonld-merklization';
import { Hash } from '@iden3/js-merkletree';
import { isGenesisState } from '../../credentials';
import { JSONObject } from '../../iden3comm';
import { parseQueriesMetadata } from '../../proof';
import { createSchemaHash } from '../../schema-processor';
import { IStateStorage, RootInfo, StateInfo } from '../../storage';
import { bigIntCompare, byteEncoder } from '../../utils';
import { ProofQuery, ProofType } from '../../verifiable';
import { AtomicQueryMTPV2PubSignals } from '../atomic-query-mtp-v2';
import { AtomicQuerySigV2PubSignals } from '../atomic-query-sig-v2';
import { AtomicQueryV3PubSignals } from '../atomic-query-v3';
import { AuthV2PubSignals } from '../auth-v2';
import { BaseConfig } from '../common';
import { LinkedMultiQueryPubSignals } from '../linked-multi-query';
import { CircuitId } from '../models';
import { checkQueryRequest, ClaimOutputs, VerifyOpts } from './query';

/**
 *  Verify Context - params for pub signal verification
 * @type VerifyContext
 */
export type VerifyContext = {
  pubSignals: string[];
  query: ProofQuery;
  verifiablePresentation?: JSON;
  sender: string;
  challenge: bigint;
  opts?: VerifyOpts;
  params?: JSONObject;
};

export const userStateError = new Error(`user state is not valid`);
const zeroInt = 0n;
const defaultProofVerifyOpts = 1 * 60 * 60 * 1000; // 1 hour
const defaultAuthVerifyOpts = 5 * 60 * 1000; // 5 minutes

/**
 * PubSignalsVerifier provides verify method
 * @public
 * @class PubSignalsVerifier
 */
export class PubSignalsVerifier {
  userId!: Id;
  challenge!: bigint;

  /**
   * Creates an instance of PubSignalsVerifier.
   * @param {DocumentLoader} _documentLoader document loader
   * @param {IStateStorage} _stateStorage state storage
   */

  constructor(
    private readonly _documentLoader: DocumentLoader,
    private readonly _stateStorage: IStateStorage
  ) {}

  /**
   * verify public signals
   *
   * @param {string} circuitId circuit id
   * @param {VerifyContext} ctx verification parameters
   * @returns `Promise<BaseConfig>`
   */
  async verify(circuitId: string, ctx: VerifyContext): Promise<BaseConfig> {
    const fnName = `${circuitId.split('-')[0]}Verify`;
    const fn = (this as unknown as { [k: string]: (ctx: VerifyContext) => Promise<BaseConfig> })[
      fnName
    ];
    if (!fn) {
      throw new Error(`public signals verifier for ${circuitId} not found`);
    }
    return fn(ctx);
  }

  private credentialAtomicQueryMTPV2Verify = async ({
    query,
    verifiablePresentation,
    sender,
    challenge,
    pubSignals,
    opts
  }: VerifyContext): Promise<BaseConfig> => {
    let mtpv2PubSignals = new AtomicQueryMTPV2PubSignals();
    mtpv2PubSignals = mtpv2PubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals))
    );

    if (!mtpv2PubSignals.userID) {
      throw new Error('user id is not presented in proof public signals');
    }

    if (!mtpv2PubSignals.requestID) {
      throw new Error('requestId is not presented in proof public signals');
    }

    this.userId = mtpv2PubSignals.userID;
    this.challenge = mtpv2PubSignals.requestID;

    // verify query
    const outs: ClaimOutputs = {
      issuerId: mtpv2PubSignals.issuerID,
      schemaHash: mtpv2PubSignals.claimSchema,
      slotIndex: mtpv2PubSignals.slotIndex,
      operator: mtpv2PubSignals.operator,
      value: mtpv2PubSignals.value,
      timestamp: mtpv2PubSignals.timestamp,
      merklized: mtpv2PubSignals.merklized,
      claimPathKey: mtpv2PubSignals.claimPathKey,
      claimPathNotExists: mtpv2PubSignals.claimPathNotExists,
      valueArraySize: mtpv2PubSignals.getValueArrSize(),
      isRevocationChecked: mtpv2PubSignals.isRevocationChecked
    };
    await checkQueryRequest(
      query,
      outs,
      CircuitId.AtomicQueryMTPV2,
      this._documentLoader,
      verifiablePresentation,
      opts
    );
    // verify state
    await this.checkStateExistenceForId(
      mtpv2PubSignals.issuerID,
      mtpv2PubSignals.issuerClaimIdenState
    );

    if (mtpv2PubSignals.isRevocationChecked !== 0) {
      await this.checkRevocationState(
        mtpv2PubSignals.issuerID,
        mtpv2PubSignals.issuerClaimNonRevState,
        opts
      );
    }

    // verify ID ownership
    this.verifyIdOwnership(sender, challenge);
    return mtpv2PubSignals;
  };

  private credentialAtomicQuerySigV2Verify = async ({
    query,
    verifiablePresentation,
    sender,
    challenge,
    pubSignals,
    opts
  }: VerifyContext): Promise<BaseConfig> => {
    let sigV2PubSignals = new AtomicQuerySigV2PubSignals();
    sigV2PubSignals = sigV2PubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals))
    );

    this.userId = sigV2PubSignals.userID;
    this.challenge = sigV2PubSignals.requestID;

    // verify query
    const outs: ClaimOutputs = {
      issuerId: sigV2PubSignals.issuerID,
      schemaHash: sigV2PubSignals.claimSchema,
      slotIndex: sigV2PubSignals.slotIndex,
      operator: sigV2PubSignals.operator,
      value: sigV2PubSignals.value,
      timestamp: sigV2PubSignals.timestamp,
      merklized: sigV2PubSignals.merklized,
      claimPathKey: sigV2PubSignals.claimPathKey,
      claimPathNotExists: sigV2PubSignals.claimPathNotExists,
      valueArraySize: sigV2PubSignals.getValueArrSize(),
      isRevocationChecked: sigV2PubSignals.isRevocationChecked
    };
    await checkQueryRequest(
      query,
      outs,
      CircuitId.AtomicQuerySigV2,
      this._documentLoader,
      verifiablePresentation,
      opts
    );
    // verify state
    await this.checkStateExistenceForId(sigV2PubSignals.issuerID, sigV2PubSignals.issuerAuthState);

    if (sigV2PubSignals.isRevocationChecked !== 0) {
      await this.checkRevocationState(
        sigV2PubSignals.issuerID,
        sigV2PubSignals.issuerClaimNonRevState,
        opts
      );
    }
    // verify Id ownership
    this.verifyIdOwnership(sender, challenge);

    return sigV2PubSignals;
  };

  private credentialAtomicQueryV3Verify = async ({
    query,
    verifiablePresentation,
    sender,
    challenge,
    pubSignals,
    opts,
    params
  }: VerifyContext): Promise<BaseConfig> => {
    let v3PubSignals = new AtomicQueryV3PubSignals();
    v3PubSignals = v3PubSignals.pubSignalsUnmarshal(byteEncoder.encode(JSON.stringify(pubSignals)));

    this.userId = v3PubSignals.userID;
    this.challenge = v3PubSignals.requestID;

    // verify query
    const outs: ClaimOutputs = {
      issuerId: v3PubSignals.issuerID,
      schemaHash: v3PubSignals.claimSchema,
      slotIndex: v3PubSignals.slotIndex,
      operator: v3PubSignals.operator,
      value: v3PubSignals.value,
      timestamp: v3PubSignals.timestamp,
      merklized: v3PubSignals.merklized,
      claimPathKey: v3PubSignals.claimPathKey,
      claimPathNotExists: v3PubSignals.claimPathNotExists,
      valueArraySize: v3PubSignals.getValueArrSize(),
      isRevocationChecked: v3PubSignals.isRevocationChecked
    };
    await checkQueryRequest(
      query,
      outs,
      CircuitId.AtomicQueryV3,
      this._documentLoader,
      verifiablePresentation,
      opts
    );

    const { proofType, verifierID, nullifier, nullifierSessionID, linkID } = v3PubSignals;

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

    // verify state
    await this.checkStateExistenceForId(v3PubSignals.issuerID, v3PubSignals.issuerState);

    if (v3PubSignals.isRevocationChecked !== 0) {
      await this.checkRevocationState(
        v3PubSignals.issuerID,
        v3PubSignals.issuerClaimNonRevState,
        opts
      );
    }

    this.verifyIdOwnership(sender, challenge);

    return v3PubSignals;
  };

  private authV2Verify = async ({
    sender,
    challenge,
    pubSignals,
    opts
  }: VerifyContext): Promise<BaseConfig> => {
    let authV2PubSignals = new AuthV2PubSignals();
    authV2PubSignals = authV2PubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals))
    );

    this.userId = authV2PubSignals.userID;
    this.challenge = authV2PubSignals.challenge;

    // no query verification
    // verify state
    const gist = await this.checkGlobalState(authV2PubSignals.GISTRoot);

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

    // verify Id ownership
    this.verifyIdOwnership(sender, challenge);
    return new BaseConfig();
  };

  private linkedMultiQuery10Verify = async ({
    query,
    pubSignals
  }: VerifyContext): Promise<BaseConfig> => {
    let multiQueryPubSignals = new LinkedMultiQueryPubSignals();

    multiQueryPubSignals = multiQueryPubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals)),
      10
    );

    // verify query
    let schema: JSONObject;
    const ldOpts = { documentLoader: this._documentLoader };
    try {
      schema = (await ldOpts.documentLoader(query.context || '')).document as JSONObject;
    } catch (e) {
      throw new Error(`can't load schema for request query`);
    }
    const ldContextJSON = JSON.stringify(schema);
    const credentialSubject = query.credentialSubject as JSONObject;
    const schemaId: string = await Path.getTypeIDFromContext(
      JSON.stringify(schema),
      query.type || '',
      ldOpts
    );
    const schemaHash = createSchemaHash(byteEncoder.encode(schemaId));

    const queriesMetadata = await parseQueriesMetadata(
      query.type || '',
      ldContextJSON,
      credentialSubject,
      ldOpts
    );

    const queryHashes = queriesMetadata.map((queryMeta) => {
      const valueHash = poseidon.spongeHashX(queryMeta.values, 6);
      return poseidon.hash([
        schemaHash.bigInt(),
        BigInt(queryMeta.slotIndex),
        BigInt(queryMeta.operator),
        BigInt(queryMeta.claimPathKey),
        queryMeta.merklizedSchema ? 0n : 1n,
        valueHash
      ]);
    });

    const circuitQueryHashes = multiQueryPubSignals.circuitQueryHash
      .filter((i) => i !== 0n)
      .sort(bigIntCompare);
    queryHashes.sort(bigIntCompare);
    if (!queryHashes.every((queryHash, i) => queryHash === circuitQueryHashes[i])) {
      throw new Error('query hashes do not match');
    }

    return multiQueryPubSignals as unknown as BaseConfig;
  };

  private verifyIdOwnership = (sender: string, challenge: bigint): void => {
    const senderId = DID.idFromDID(DID.parse(sender));
    if (senderId.string() !== this.userId.string()) {
      throw new Error(
        `sender id is not used for proof creation, expected ${sender}, user from public signals: ${this.userId.string()}`
      );
    }
    if (challenge !== this.challenge) {
      throw new Error(
        `challenge is not used for proof creation, expected ${challenge}, challenge from public signals: ${this.challenge}  `
      );
    }
  };

  private async resolve(
    id: Id,
    state: bigint
  ): Promise<{
    latest: boolean;
    transitionTimestamp: number | string;
  }> {
    const idBigInt = id.bigInt();
    const did = DID.parseFromId(id);
    // check if id is genesis
    const isGenesis = isGenesisState(did, state);
    let contractState: StateInfo;
    try {
      contractState = await this._stateStorage.getStateInfoByIdAndState(idBigInt, state);
    } catch (e) {
      if ((e as { errorArgs: string[] }).errorArgs[0] === 'State does not exist') {
        if (isGenesis) {
          return {
            latest: true,
            transitionTimestamp: 0
          };
        }
        throw new Error('State is not genesis and not registered in the smart contract');
      }
      throw e;
    }

    if (!contractState.id || contractState.id.toString() !== idBigInt.toString()) {
      throw new Error(`state was recorded for another identity`);
    }

    if (!contractState.state || contractState.state.toString() !== state.toString()) {
      if (
        !contractState.replacedAtTimestamp ||
        contractState.replacedAtTimestamp.toString() === zeroInt.toString()
      ) {
        throw new Error(`no information about state transition`);
      }
      return {
        latest: false,
        transitionTimestamp: contractState.replacedAtTimestamp.toString()
      };
    }

    return { latest: true, transitionTimestamp: 0 };
  }

  private async rootResolve(state: bigint): Promise<{
    latest: boolean;
    transitionTimestamp: number | string;
  }> {
    let globalStateInfo: RootInfo;
    try {
      globalStateInfo = await this._stateStorage.getGISTRootInfo(state);
    } catch (e: unknown) {
      if ((e as { errorArgs: string[] }).errorArgs[0] === 'Root does not exist') {
        throw new Error('GIST root does not exist in the smart contract');
      }
      throw e;
    }

    if (globalStateInfo.root.toString() !== state.toString()) {
      throw new Error(`gist info contains invalid state`);
    }

    if (globalStateInfo.replacedByRoot.toString() !== zeroInt.toString()) {
      if (globalStateInfo.replacedAtTimestamp.toString() === zeroInt.toString()) {
        throw new Error(`state was replaced, but replaced time unknown`);
      }
      return {
        latest: false,
        transitionTimestamp: globalStateInfo.replacedAtTimestamp.toString()
      };
    }

    return {
      latest: true,
      transitionTimestamp: 0
    };
  }

  private checkStateExistenceForId = async (userId: Id, userState: Hash): Promise<void> => {
    const { latest } = await this.resolve(userId, userState.bigInt());
    if (!latest) {
      throw userStateError;
    }
  };

  private checkGlobalState = async (
    state: Hash
  ): Promise<{
    latest: boolean;
    transitionTimestamp: number | string;
  }> => {
    const gistStateResolved = await this.rootResolve(state.bigInt());
    return gistStateResolved;
  };

  private checkRevocationStateForId = async (
    issuerId: Id,
    issuerClaimNonRevState: Hash
  ): Promise<{
    latest: boolean;
    transitionTimestamp: number | string;
  }> => {
    const issuerNonRevStateResolved = await this.resolve(issuerId, issuerClaimNonRevState.bigInt());
    return issuerNonRevStateResolved;
  };

  private checkRevocationState = async (
    issuerID: Id,
    issuerClaimNonRevState: Hash,
    opts: VerifyOpts | undefined
  ) => {
    const issuerNonRevStateResolved = await this.checkRevocationStateForId(
      issuerID,
      issuerClaimNonRevState
    );

    const acceptedStateTransitionDelay =
      opts?.acceptedStateTransitionDelay ?? defaultProofVerifyOpts;

    if (!issuerNonRevStateResolved.latest) {
      const timeDiff =
        Date.now() -
        getDateFromUnixTimestamp(Number(issuerNonRevStateResolved.transitionTimestamp)).getTime();
      if (timeDiff > acceptedStateTransitionDelay) {
        throw new Error('issuer state is outdated');
      }
    }
  };
}
