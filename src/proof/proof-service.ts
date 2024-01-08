import { Poseidon } from '@iden3/js-crypto';
import { BytesHelper, DID, MerklizedRootPosition } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';
import {
  AuthV2Inputs,
  CircuitId,
  Operators,
  Query,
  StateTransitionInputs,
  TreeState,
  ValueProof
} from '../circuits';
import { ICredentialWallet } from '../credentials';
import { IIdentityWallet } from '../identity';
import {
  createVerifiablePresentation,
  ProofQuery,
  RevocationStatus,
  W3CCredential
} from '../verifiable';
import {
  PreparedCredential,
  QueryMetadata,
  parseCredentialSubject,
  parseQueryMetadata,
  toGISTProof,
  transformQueryValueToBigInts
} from './common';
import { IZKProver, NativeProver } from './prover';

import { Merklizer, Options, getDocumentLoader } from '@iden3/js-jsonld-merklization';
import { ZKProof } from '@iden3/js-jwz';
import { Signer } from 'ethers';
import { JSONObject, ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from '../iden3comm';
import { cacheLoader } from '../schema-processor';
import { ICircuitStorage, IStateStorage } from '../storage';
import { byteDecoder, byteEncoder } from '../utils/encoding';
import { InputGenerator, ProofGenerationOptions, ProofInputsParams } from './inputs-generator';

export interface QueryWithFieldName {
  query: Query;
  fieldName: string;
  rawValue?: unknown;
  isSelectiveDisclosure?: boolean;
}
/**
 *  List of options to customize ProofService
 */
export type ProofServiceOptions = Options & {
  prover?: IZKProver;
};

export interface IProofService {
  /**
   * Verification of zkp proof for given circuit id
   *
   * @param {ZKProof} zkp  - proof to verify
   * @param {CircuitId} circuitId - circuit id
   * @returns `{Promise<boolean>}`
   */
  verifyProof(zkp: ZKProof, circuitName: CircuitId): Promise<boolean>;

  /**
   * Generate proof from given identity and credential for protocol proof request
   *
   * @param {ZeroKnowledgeProofRequest} proofReq - protocol zkp request
   * @param {DID} identifier - did that will generate proof
   * @param {W3CCredential} credential - credential that will be used for proof generation
   * @param {ProofGenerationOptions} opts - options that will be used for proof generation
   *
   * @returns `Promise<ZeroKnowledgeProofResponse>`
   */
  generateProof(
    proofReq: ZeroKnowledgeProofRequest,
    identifier: DID,
    opts?: ProofGenerationOptions
  ): Promise<ZeroKnowledgeProofResponse>;

  /**
   * generates auth inputs
   *
   * @param {Uint8Array} hash - challenge that will be signed
   * @param {DID} did - identity that will generate a proof
   * @param {Number} profileNonce - identity that will generate a proof
   * @param {CircuitId} circuitId - circuit id for authentication
   * @returns `Promise<Uint8Array>`
   */
  generateAuthV2Inputs(hash: Uint8Array, did: DID, circuitId: CircuitId): Promise<Uint8Array>;

  /**
   * state verification function
   *
   * @param {string} circuitId - id of authentication circuit
   * @param {Array<string>} pubSignals - public signals of authentication circuit
   * @returns `Promise<boolean>`
   */
  verifyState(circuitId: string, pubSignals: Array<string>): Promise<boolean>;
  /**
   * transitState is done always to the latest state
   *
   * Generates a state transition proof and publishes state to the blockchain
   *
   * @param {DID} did - identity that will transit state
   * @param {TreeState} oldTreeState - previous tree state
   * @param {boolean} isOldStateGenesis - is a transition state is done from genesis state
   * @param {IStateStorage} stateStorage - storage of identity states (only eth based storage currently)
   * @param {Signer} ethSigner - signer for transaction
   * @returns `{Promise<string>}` - transaction hash is returned
   */
  transitState(
    did: DID,
    oldTreeState: TreeState,
    isOldStateGenesis: boolean,
    stateStorage: IStateStorage,
    ethSigner: Signer
  ): Promise<string>;

  findCredentialByProofQuery(
    did: DID,
    query: ProofQuery,
    opts?: { skipClaimRevocationCheck: boolean }
  ): Promise<{ cred: W3CCredential; revStatus: RevocationStatus | undefined }>;
}
/**
 * Proof service is an implementation of IProofService
 * that works with a native groth16 prover
 *
 * @public
 * @class ProofService
 * @implements implements IProofService interface
 */
export class ProofService implements IProofService {
  private readonly _prover: IZKProver;
  private readonly _ldOptions: Options;
  private readonly _inputsGenerator: InputGenerator;
  /**
   * Creates an instance of ProofService.
   * @param {IIdentityWallet} _identityWallet - identity wallet
   * @param {ICredentialWallet} _credentialWallet - credential wallet
   * @param {ICircuitStorage} _circuitStorage - circuit storage to load proving / verification files
   * @param {IStateStorage} _stateStorage - state storage to get GIST proof / publish state
   */
  constructor(
    private readonly _identityWallet: IIdentityWallet,
    private readonly _credentialWallet: ICredentialWallet,
    _circuitStorage: ICircuitStorage,
    private readonly _stateStorage: IStateStorage,
    opts?: ProofServiceOptions
  ) {
    this._prover = opts?.prover ?? new NativeProver(_circuitStorage);
    this._ldOptions = { ...opts, documentLoader: opts?.documentLoader ?? cacheLoader(opts) };
    this._inputsGenerator = new InputGenerator(_identityWallet, _credentialWallet, _stateStorage);
  }

  /** {@inheritdoc IProofService.verifyProof} */
  async verifyProof(zkp: ZKProof, circuitId: CircuitId): Promise<boolean> {
    return this._prover.verify(zkp, circuitId);
  }

  /** {@inheritdoc IProofService.generateProof} */
  async generateProof(
    proofReq: ZeroKnowledgeProofRequest,
    identifier: DID,
    opts?: ProofGenerationOptions
  ): Promise<ZeroKnowledgeProofResponse> {
    if (!opts) {
      opts = {
        skipRevocation: false,
        challenge: 0n
      };
    }

    let credentialWithRevStatus: {
      cred: W3CCredential | undefined;
      revStatus: RevocationStatus | undefined;
    } = { cred: opts.credential, revStatus: opts.credentialRevocationStatus };

    if (!opts.credential) {
      credentialWithRevStatus = await this.findCredentialByProofQuery(identifier, proofReq.query);
    }

    if (opts.credential && !opts.credentialRevocationStatus && !opts.skipRevocation) {
      const revStatus = await this._credentialWallet.getRevocationStatusFromCredential(
        opts.credential
      );
      credentialWithRevStatus = { cred: opts.credential, revStatus };
    }

    if (!credentialWithRevStatus.cred) {
      throw new Error(`credential not found for query ${JSON.stringify(proofReq.query)}`);
    }

    const credentialCoreClaim = await this._identityWallet.getCoreClaimFromCredential(
      credentialWithRevStatus.cred
    );

    const { nonce: authProfileNonce, genesisDID } =
      await this._identityWallet.getGenesisDIDMetadata(identifier);

    const preparedCredential: PreparedCredential = {
      credential: credentialWithRevStatus.cred,
      credentialCoreClaim,
      revStatus: credentialWithRevStatus.revStatus
    };

    const subjectDID = DID.parse(preparedCredential.credential.credentialSubject['id'] as string);

    const { nonce: credentialSubjectProfileNonce, genesisDID: subjectGenesisDID } =
      await this._identityWallet.getGenesisDIDMetadata(subjectDID);

    if (subjectGenesisDID.string() !== genesisDID.string()) {
      throw new Error('subject and auth profiles are not derived from the same did');
    }

    const propertiesMetadata = parseCredentialSubject(
      proofReq.query.credentialSubject as JSONObject
    );
    if (!propertiesMetadata.length) {
      throw new Error('no queries in zkp request');
    }

    const mtPosition = preparedCredential.credentialCoreClaim.getMerklizedPosition();

    let mk: Merklizer | undefined;
    if (mtPosition !== MerklizedRootPosition.None) {
      mk = await preparedCredential.credential.merklize(this._ldOptions);
    }

    const context = proofReq.query['context'] as string;
    const groupId = proofReq.query['groupId'] as number;

    const ldContext = await this.loadLdContext(context);

    const credentialType = proofReq.query['type'] as string;
    const queriesMetadata: QueryMetadata[] = [];
    const circuitQueries: Query[] = [];

    for (const propertyMetadata of propertiesMetadata) {
      const queryMetadata = await parseQueryMetadata(
        propertyMetadata,
        byteDecoder.decode(ldContext),
        credentialType,
        this._ldOptions
      );

      queriesMetadata.push(queryMetadata);
      const circuitQuery = await this.toCircuitsQuery(
        preparedCredential.credential,
        queryMetadata,
        mk
      );
      circuitQueries.push(circuitQuery);
    }

    const inputs = await this.generateInputs(
      preparedCredential,
      genesisDID,
      proofReq,
      {
        ...opts,
        authProfileNonce,
        credentialSubjectProfileNonce,
        linkNonce: groupId ? opts.linkNonce : 0n
      },
      circuitQueries
    );

    const sdQueries = queriesMetadata.filter((q) => q.operator === Operators.SD);
    let vp: object | undefined;
    if (sdQueries.length) {
      vp = createVerifiablePresentation(
        context,
        credentialType,
        preparedCredential.credential,
        sdQueries
      );
    }

    const { proof, pub_signals } = await this._prover.generate(inputs, proofReq.circuitId);

    return {
      id: proofReq.id,
      circuitId: proofReq.circuitId,
      vp,
      proof,
      pub_signals
    };
  }

  /** {@inheritdoc IProofService.transitState} */
  async transitState(
    did: DID,
    oldTreeState: TreeState,
    isOldStateGenesis: boolean,
    stateStorage: IStateStorage,
    ethSigner: Signer
  ): Promise<string> {
    const authInfo = await this._inputsGenerator.prepareAuthBJJCredential(did, oldTreeState);

    const newTreeModel = await this._identityWallet.getDIDTreeModel(did);
    const claimsRoot = await newTreeModel.claimsTree.root();
    const rootOfRoots = await newTreeModel.rootsTree.root();
    const revocationRoot = await newTreeModel.revocationTree.root();

    const newTreeState: TreeState = {
      revocationRoot,
      claimsRoot,
      state: newTreeModel.state,
      rootOfRoots
    };
    const challenge = Poseidon.hash([oldTreeState.state.bigInt(), newTreeState.state.bigInt()]);

    const signature = await this._identityWallet.signChallenge(challenge, authInfo.credential);

    const circuitInputs = new StateTransitionInputs();
    circuitInputs.id = DID.idFromDID(did);

    circuitInputs.signature = signature;
    circuitInputs.isOldStateGenesis = isOldStateGenesis;

    const authClaimIncProofNewState = await this._identityWallet.generateCredentialMtp(
      did,
      authInfo.credential,
      newTreeState
    );

    circuitInputs.newTreeState = authClaimIncProofNewState.treeState;
    circuitInputs.authClaimNewStateIncProof = authClaimIncProofNewState.proof;

    circuitInputs.oldTreeState = oldTreeState;
    circuitInputs.authClaim = {
      claim: authInfo.coreClaim,
      incProof: authInfo.incProof,
      nonRevProof: authInfo.nonRevProof
    };

    const inputs = circuitInputs.inputsMarshal();

    const proof = await this._prover.generate(inputs, CircuitId.StateTransition);

    const txId = await stateStorage.publishState(proof, ethSigner);

    await this._identityWallet.updateIdentityState(did, true, newTreeState);

    return txId;
  }

  private async generateInputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: ProofInputsParams,
    circuitQueries: Query[]
  ): Promise<Uint8Array> {
    return this._inputsGenerator.generateInputs({
      preparedCredential,
      identifier,
      proofReq,
      params,
      circuitQueries
    });
  }

  private async toCircuitsQuery(
    credential: W3CCredential,
    queryMetadata: QueryMetadata,
    merklizedCredential?: Merklizer
  ): Promise<Query> {
    if (queryMetadata.merklizedSchema && !merklizedCredential) {
      throw new Error('merklized root position is set to None for merklized schema');
    }
    if (!queryMetadata.merklizedSchema && merklizedCredential) {
      throw new Error('merklized root position is not set to None for non-merklized schema');
    }
    const query = new Query();

    query.slotIndex = queryMetadata.slotIndex;
    query.operator = queryMetadata.operator;
    query.values = queryMetadata.values;

    if (queryMetadata.merklizedSchema && merklizedCredential) {
      const { proof, value: mtValue } = await merklizedCredential.proof(queryMetadata.path);
      query.valueProof = new ValueProof();
      query.valueProof.mtp = proof;
      query.valueProof.path = queryMetadata.claimPathKey;

      const mtEntry = await mtValue?.mtEntry();
      if (!mtEntry) {
        throw new Error(`can't merklize credential: no merkle tree entry found`);
      }

      query.valueProof.value = mtEntry;
      if (!queryMetadata.fieldName) {
        query.values = [mtEntry];
        return query;
      }
    }

    if (queryMetadata.operator === Operators.SD) {
      const [first, ...rest] = queryMetadata.fieldName.split('.');
      let v = credential.credentialSubject[first];
      for (const part of rest) {
        v = (v as JSONObject)[part];
      }
      if (typeof v === 'undefined') {
        throw new Error(`credential doesn't contain value for field ${queryMetadata.fieldName}`);
      }
      query.values = await transformQueryValueToBigInts(v, queryMetadata.datatype);
    }

    return query;
  }

  private async loadLdContext(context: string): Promise<Uint8Array> {
    const loader = getDocumentLoader(this._ldOptions);
    let ldSchema: object;
    try {
      ldSchema = (await loader(context)).document;
    } catch (e) {
      throw new Error(`can't load ld context from url ${context}`);
    }
    return byteEncoder.encode(JSON.stringify(ldSchema));
  }

  /** {@inheritdoc IProofService.generateAuthV2Inputs} */
  async generateAuthV2Inputs(
    hash: Uint8Array,
    did: DID,
    circuitId: CircuitId
  ): Promise<Uint8Array> {
    if (circuitId !== CircuitId.AuthV2) {
      throw new Error('CircuitId is not supported');
    }

    const { nonce: authProfileNonce, genesisDID } =
      await this._identityWallet.getGenesisDIDMetadata(did);

    const challenge = BytesHelper.bytesToInt(hash.reverse());

    const authPrepared = await this._inputsGenerator.prepareAuthBJJCredential(genesisDID);

    const authClaimData = await this._inputsGenerator.newCircuitClaimData({
      credential: authPrepared.credential,
      credentialCoreClaim: authPrepared.coreClaim
    });

    const signature = await this._identityWallet.signChallenge(challenge, authPrepared.credential);
    const id = DID.idFromDID(genesisDID);
    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());

    const gistProof = toGISTProof(stateProof);

    const authInputs = new AuthV2Inputs();

    authInputs.genesisID = id;
    authInputs.profileNonce = BigInt(authProfileNonce);
    authInputs.authClaim = authClaimData.claim;
    authInputs.authClaimIncMtp = authClaimData.proof;
    authInputs.authClaimNonRevMtp = authPrepared.nonRevProof.proof;
    authInputs.treeState = authClaimData.treeState;
    authInputs.signature = signature;
    authInputs.challenge = challenge;
    authInputs.gistProof = gistProof;
    return authInputs.inputsMarshal();
  }

  async verifyState(circuitId: string, pubSignals: Array<string>): Promise<boolean> {
    if (circuitId !== CircuitId.AuthV2) {
      throw new Error(`CircuitId is not supported ${circuitId}`);
    }
    const gistRoot = Hash.fromString(pubSignals[2]).bigInt();
    const globalStateInfo = await this._stateStorage.getGISTRootInfo(gistRoot);

    if (globalStateInfo.createdAtTimestamp === 0n) {
      throw new Error(`gist state doesn't exists in contract`);
    }

    if (globalStateInfo.root !== gistRoot) {
      throw new Error(`gist info contains invalid state`);
    }

    if (globalStateInfo.replacedByRoot !== 0n) {
      if (globalStateInfo.replacedAtTimestamp === 0n) {
        throw new Error(`state was replaced, but replaced time unknown`);
      }
      return false;
    }

    return true;
  }

  async findCredentialByProofQuery(
    did: DID,
    query: ProofQuery
  ): Promise<{ cred: W3CCredential; revStatus: RevocationStatus | undefined }> {
    const credentials = await this._identityWallet.findOwnedCredentialsByDID(did, query);

    if (!credentials.length) {
      throw new Error(`no credentials belong to did or its profiles`);
    }

    //  For EQ / IN / NIN / LT / GT operations selective if credential satisfies query - we can get any.
    // TODO: choose credential for selective credentials
    const credential = query.skipClaimRevocationCheck
      ? { cred: credentials[0], revStatus: undefined }
      : await this._credentialWallet.findNonRevokedCredential(credentials);

    return credential;
  }
}
