import { DID, getDateFromUnixTimestamp, Id } from '@iden3/js-iden3-core';
import { DocumentLoader, getDocumentLoader, Path } from '@iden3/js-jsonld-merklization';
import { Hash } from '@iden3/js-merkletree';
import { IStateStorage, RootInfo, StateInfo } from '../../storage';
import { byteEncoder, isGenesisState } from '../../utils';
import { calculateCoreSchemaHash, ProofQuery, ProofType } from '../../verifiable';
import { AtomicQueryMTPV2PubSignals } from '../../circuits/atomic-query-mtp-v2';
import { AtomicQuerySigV2PubSignals } from '../../circuits/atomic-query-sig-v2';
import { AtomicQueryV3PubSignals } from '../../circuits/atomic-query-v3';
import { AuthV2PubSignals } from '../../circuits/auth-v2';
import { BaseConfig } from '../../circuits/common';
import {
  LinkedMultiQueryPubSignals,
  LinkedMultiQueryInputs
} from '../../circuits/linked-multi-query';
import { CircuitId } from '../../circuits/models';
import {
  checkQueryRequest,
  ClaimOutputs,
  VerifyOpts,
  fieldValueFromVerifiablePresentation,
  validateDisclosureV2Circuit,
  validateEmptyCredentialSubjectV2Circuit,
  validateOperators,
  verifyFieldValueInclusionV2,
  validateDisclosureNativeSDSupport,
  validateEmptyCredentialSubjectNoopNativeSupport,
  verifyFieldValueInclusionNativeExistsSupport,
  checkCircuitOperator
} from './query';
import { parseQueriesMetadata, QueryMetadata } from '../common';
import { Operators } from '../../circuits';
import { calculateQueryHashV3 } from './query-hash';
import { JsonLd } from 'jsonld/jsonld-spec';
import { PROTOCOL_CONSTANTS, JSONObject, VerifiablePresentation } from '../../iden3comm';

/**
 *  Verify Context - params for pub signal verification
 * @type VerifyContext
 */
export type VerifyContext = {
  pubSignals: string[];
  query: ProofQuery;
  verifiablePresentation?: VerifiablePresentation;
  sender: string;
  challenge: bigint;
  opts?: VerifyOpts;
  params?: JSONObject;
};

export const userStateError = new Error(`user state is not valid`);
const zeroInt = 0n;

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

    await this.checkQueryV2Circuits(
      CircuitId.AtomicQueryMTPV2,
      query,
      outs,
      opts,
      verifiablePresentation
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

    await this.checkQueryV2Circuits(
      CircuitId.AtomicQuerySigV2,
      query,
      outs,
      opts,
      verifiablePresentation
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
      valueArraySize: v3PubSignals.getValueArrSize(),
      operatorOutput: v3PubSignals.operatorOutput,
      isRevocationChecked: v3PubSignals.isRevocationChecked
    };

    if (!query.type) {
      throw new Error(`proof query type is undefined`);
    }

    const loader = this._documentLoader ?? getDocumentLoader();

    // validate schema
    let context: JsonLd;
    try {
      context = (await loader(query.context ?? '')).document;
    } catch (e) {
      throw new Error(`can't load schema for request query`);
    }

    const queriesMetadata = await parseQueriesMetadata(
      query.type,
      JSON.stringify(context),
      query.credentialSubject as JSONObject,
      {
        documentLoader: loader
      }
    );

    const circuitId = CircuitId.AtomicQueryV3;
    await checkQueryRequest(
      query,
      queriesMetadata,
      context,
      outs,
      circuitId,
      this._documentLoader,
      opts
    );

    const queryMetadata = queriesMetadata[0]; // only one query is supported

    checkCircuitOperator(circuitId, outs.operator);
    // validate selective disclosure
    if (queryMetadata.operator === Operators.SD) {
      try {
        await validateDisclosureNativeSDSupport(
          queryMetadata,
          outs,
          verifiablePresentation,
          loader
        );
      } catch (e) {
        throw new Error(`failed to validate selective disclosure: ${(e as Error).message}`);
      }
    } else if (!queryMetadata.fieldName && queryMetadata.operator == Operators.NOOP) {
      try {
        await validateEmptyCredentialSubjectNoopNativeSupport(outs);
      } catch (e: unknown) {
        throw new Error(`failed to validate operators: ${(e as Error).message}`);
      }
    } else {
      try {
        await validateOperators(queryMetadata, outs);
      } catch (e) {
        throw new Error(`failed to validate operators: ${(e as Error).message}`);
      }
    }

    // verify field inclusion / non-inclusion

    verifyFieldValueInclusionNativeExistsSupport(outs, queryMetadata);

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
    const gist = await this.checkGlobalState(authV2PubSignals.GISTRoot, this.userId);

    let acceptedStateTransitionDelay = PROTOCOL_CONSTANTS.DEFAULT_AUTH_VERIFY_DELAY;
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
    verifiablePresentation,
    pubSignals
  }: VerifyContext): Promise<BaseConfig> => {
    let multiQueryPubSignals = new LinkedMultiQueryPubSignals();

    multiQueryPubSignals = multiQueryPubSignals.pubSignalsUnmarshal(
      byteEncoder.encode(JSON.stringify(pubSignals))
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
      ldContextJSON,
      query.type || '',
      ldOpts
    );
    const schemaHash = calculateCoreSchemaHash(byteEncoder.encode(schemaId));

    const queriesMetadata = await parseQueriesMetadata(
      query.type || '',
      ldContextJSON,
      credentialSubject,
      ldOpts
    );

    const request: { queryHash: bigint; queryMeta: QueryMetadata }[] = [];
    const merklized = queriesMetadata[0]?.merklizedSchema ? 1 : 0;
    for (let i = 0; i < LinkedMultiQueryInputs.queryCount; i++) {
      const queryMeta = queriesMetadata[i];
      const values = queryMeta?.values ?? [];
      const valArrSize = values.length;

      const queryHash = calculateQueryHashV3(
        values,
        schemaHash,
        queryMeta?.slotIndex ?? 0,
        queryMeta?.operator ?? 0,
        queryMeta?.claimPathKey.toString() ?? 0,
        valArrSize,
        merklized,
        0,
        0,
        0
      );
      request.push({ queryHash, queryMeta });
    }

    const queryHashCompare = (a: { queryHash: bigint }, b: { queryHash: bigint }): number => {
      if (a.queryHash < b.queryHash) return -1;
      if (a.queryHash > b.queryHash) return 1;
      return 0;
    };

    const pubSignalsMeta = multiQueryPubSignals.circuitQueryHash.map((queryHash, index) => ({
      queryHash,
      operatorOutput: multiQueryPubSignals.operatorOutput[index]
    }));

    pubSignalsMeta.sort(queryHashCompare);
    request.sort(queryHashCompare);

    for (let i = 0; i < LinkedMultiQueryInputs.queryCount; i++) {
      if (request[i].queryHash != pubSignalsMeta[i].queryHash) {
        throw new Error('query hashes do not match');
      }

      if (request[i].queryMeta?.operator === Operators.SD) {
        const disclosedValue = await fieldValueFromVerifiablePresentation(
          request[i].queryMeta.fieldName,
          verifiablePresentation,
          this._documentLoader
        );
        if (disclosedValue != pubSignalsMeta[i].operatorOutput) {
          throw new Error('disclosed value is not in the proof outputs');
        }
      }
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

  private async checkQueryV2Circuits(
    circuitId: CircuitId.AtomicQueryMTPV2 | CircuitId.AtomicQuerySigV2,
    query: ProofQuery,
    outs: ClaimOutputs,
    opts: VerifyOpts | undefined,
    verifiablePresentation: VerifiablePresentation | undefined
  ) {
    if (!query.type) {
      throw new Error(`proof query type is undefined`);
    }

    const loader = this._documentLoader ?? getDocumentLoader();

    // validate schema
    let context: JsonLd;
    try {
      context = (await loader(query.context ?? '')).document;
    } catch (e) {
      throw new Error(`can't load schema for request query`);
    }

    const queriesMetadata = await parseQueriesMetadata(
      query.type,
      JSON.stringify(context),
      query.credentialSubject as JSONObject,
      {
        documentLoader: loader
      }
    );

    await checkQueryRequest(
      query,
      queriesMetadata,
      context,
      outs,
      circuitId,
      this._documentLoader,
      opts
    );

    const queryMetadata = queriesMetadata[0]; // only one query is supported

    checkCircuitOperator(circuitId, outs.operator);

    // validate selective disclosure
    if (queryMetadata.operator === Operators.SD) {
      try {
        await validateDisclosureV2Circuit(queryMetadata, outs, verifiablePresentation, loader);
      } catch (e) {
        throw new Error(`failed to validate selective disclosure: ${(e as Error).message}`);
      }
    } else if (!queryMetadata.fieldName && queryMetadata.operator == Operators.NOOP) {
      try {
        await validateEmptyCredentialSubjectV2Circuit(queryMetadata, outs);
      } catch (e: unknown) {
        throw new Error(`failed to validate operators: ${(e as Error).message}`);
      }
    } else {
      try {
        await validateOperators(queryMetadata, outs);
      } catch (e) {
        throw new Error(`failed to validate operators: ${(e as Error).message}`);
      }
    }

    // verify field inclusion
    verifyFieldValueInclusionV2(outs, queryMetadata);
  }

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
      const stateNotExistErr = ((e as unknown as { errorArgs: string[] })?.errorArgs ?? [])[0];
      const errMsg = stateNotExistErr || (e as unknown as Error).message;
      if (errMsg.includes('State does not exist')) {
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

    return {
      latest:
        !contractState.replacedAtTimestamp ||
        contractState.replacedAtTimestamp.toString() === zeroInt.toString(),
      transitionTimestamp: contractState.replacedAtTimestamp?.toString() ?? 0
    };
  }

  private async rootResolve(
    state: bigint,
    id: bigint
  ): Promise<{
    latest: boolean;
    transitionTimestamp: number | string;
  }> {
    let globalStateInfo: RootInfo;
    try {
      globalStateInfo = await this._stateStorage.getGISTRootInfo(state, id);
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
    await this.resolve(userId, userState.bigInt());
  };

  private checkGlobalState = async (
    state: Hash,
    id: Id
  ): Promise<{
    latest: boolean;
    transitionTimestamp: number | string;
  }> => {
    return this.rootResolve(state.bigInt(), id.bigInt());
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
      opts?.acceptedStateTransitionDelay ?? PROTOCOL_CONSTANTS.DEFAULT_PROOF_VERIFY_DELAY;

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
