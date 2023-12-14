import { Poseidon } from '@iden3/js-crypto';
import {
  BytesHelper,
  Claim,
  DID,
  Id,
  getUnixTimestamp,
  MerklizedRootPosition
} from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';
import {
  AtomicQueryMTPV2Inputs,
  AtomicQueryMTPV2OnChainInputs,
  AtomicQuerySigV2Inputs,
  AtomicQuerySigV2OnChainInputs,
  AtomicQueryV3Inputs,
  AtomicQueryV3OnChainInputs,
  AuthV2Inputs,
  CircuitClaim,
  CircuitId,
  MTProof,
  Operators,
  Query,
  StateTransitionInputs,
  TreeState,
  ValueProof
} from '../circuits';
import { CredentialStatusResolveOptions, ICredentialWallet } from '../credentials';
import { IIdentityWallet } from '../identity';
import {
  createVerifiablePresentation,
  Iden3SparseMerkleTreeProof,
  MerkleTreeProofWithTreeState,
  ProofQuery,
  ProofType,
  RevocationStatus,
  W3CCredential
} from '../verifiable';
import {
  QueryMetadata,
  parseCredentialSubject,
  parseQueryMetadata,
  toClaimNonRevStatus,
  toGISTProof,
  transformQueryValueToBigInts
} from './common';
import { IZKProver, NativeProver } from './prover';

import { Merklizer, Options, Path, getDocumentLoader } from '@iden3/js-jsonld-merklization';
import { ZKProof } from '@iden3/js-jwz';
import { Signer } from 'ethers';
import { JSONObject, ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from '../iden3comm';
import { cacheLoader } from '../schema-processor';
import { ICircuitStorage, IStateStorage } from '../storage';
import { byteDecoder, byteEncoder } from '../utils/encoding';

interface PreparedAuthBJJCredential {
  authCredential: W3CCredential;
  incProof: MerkleTreeProofWithTreeState;
  nonRevProof: MerkleTreeProofWithTreeState;
  authCoreClaim: Claim;
}
interface PreparedCredential {
  credential: W3CCredential;
  credentialCoreClaim: Claim;
  revStatus: RevocationStatus;
}

export interface QueryWithFieldName {
  query: Query;
  fieldName: string;
  rawValue?: unknown;
  isSelectiveDisclosure?: boolean;
}

export interface ProofGenerationOptions {
  skipRevocation: boolean;
  challenge?: bigint;
  credential?: W3CCredential;
  verifierDID?: DID;
  linkNonce?: bigint;
}

export interface DIDProfileMetadata {
  authProfileNonce: number;
  credentialSubjectProfileNonce: number;
}

type InputsParams = ProofGenerationOptions & DIDProfileMetadata;

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

    // find credential

    const credential = opts.credential ?? (await this.findCredential(identifier, proofReq.query));

    const { nonce: authProfileNonce, genesisDID } =
      await this._identityWallet.getGenesisDIDMetadata(identifier);

    const preparedCredential: PreparedCredential = await this.getPreparedCredential(credential);

    const subjectDID = DID.parse(preparedCredential.credential.credentialSubject['id'] as string);

    const { nonce: credentialSubjectProfileNonce, genesisDID: subjectGenesisDID } =
      await this._identityWallet.getGenesisDIDMetadata(subjectDID);

    if (subjectGenesisDID.string() !== genesisDID.string()) {
      throw new Error('subject and auth profiles are not derived from the same did');
    }

    // const queries: QueryMetadata[] = await this.prepareQueryMetadata(proofReq, preparedCredential);

    const propertiesMetadata = await parseCredentialSubject(
      proofReq.query.credentialSubject as JSONObject
    );
    if (!propertiesMetadata.length) {
      throw new Error('no queries in zkp request');
    }

    // let's merklize credential if there is a merklized root position
    const mtPosition = preparedCredential.credentialCoreClaim.getMerklizedPosition();

    let mk: Merklizer | undefined;
    if (mtPosition !== MerklizedRootPosition.None) {
      mk = await preparedCredential.credential.merklize(this._ldOptions);
    }
    const context = proofReq.query['context'] as string;

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

    const { inputs } = await this.generateInputs(
      preparedCredential,
      genesisDID,
      proofReq,
      {
        ...opts,
        authProfileNonce,
        credentialSubjectProfileNonce
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
    const authInfo = await this.prepareAuthBJJCredential(did, oldTreeState);

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

    const signature = await this._identityWallet.signChallenge(challenge, authInfo.authCredential);

    const circuitInputs = new StateTransitionInputs();
    circuitInputs.id = DID.idFromDID(did);

    circuitInputs.signature = signature;
    circuitInputs.isOldStateGenesis = isOldStateGenesis;

    const authClaimIncProofNewState = await this._identityWallet.generateCredentialMtp(
      did,
      authInfo.authCredential,
      newTreeState
    );

    circuitInputs.newTreeState = authClaimIncProofNewState.treeState;
    circuitInputs.authClaimNewStateIncProof = authClaimIncProofNewState.proof;

    circuitInputs.oldTreeState = oldTreeState;
    circuitInputs.authClaim = {
      claim: authInfo.authCoreClaim,
      incProof: authInfo.incProof,
      nonRevProof: authInfo.nonRevProof
    };

    const inputs = circuitInputs.inputsMarshal();

    const proof = await this._prover.generate(inputs, CircuitId.StateTransition);

    const txId = await stateStorage.publishState(proof, ethSigner);

    await this._identityWallet.updateIdentityState(did, true, newTreeState);

    return txId;
  }

  private async getPreparedCredential(credential: W3CCredential): Promise<PreparedCredential> {
    const revStatus = await this._credentialWallet.getRevocationStatusFromCredential(credential);

    const credCoreClaim = await this._identityWallet.getCoreClaimFromCredential(credential);

    return { credential, revStatus, credentialCoreClaim: credCoreClaim };
  }

  private async prepareAuthBJJCredential(
    did: DID,
    treeStateInfo?: TreeState
  ): Promise<PreparedAuthBJJCredential> {
    const authCredential = await this._credentialWallet.getAuthBJJCredential(did);

    const incProof = await this._identityWallet.generateCredentialMtp(
      did,
      authCredential,
      treeStateInfo
    );

    const nonRevProof = await this._identityWallet.generateNonRevocationMtp(
      did,
      authCredential,
      treeStateInfo
    );

    const authCoreClaim = authCredential.getCoreClaimFromProof(
      ProofType.Iden3SparseMerkleTreeProof
    );
    if (!authCoreClaim) {
      throw new Error('auth core claim is not defined for auth bjj credential');
    }

    return { authCredential, incProof, nonRevProof, authCoreClaim };
  }

  private async generateInputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams,
    queries: Query[]
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    let generateInputFn;
    switch (proofReq.circuitId) {
      case CircuitId.AtomicQueryMTPV2:
        generateInputFn = this.generateMTPV2Inputs.bind(this);
        break;
      case CircuitId.AtomicQueryMTPV2OnChain:
        generateInputFn = this.generateMTPV2OnChainInputs.bind(this);
        break;
      case CircuitId.AtomicQuerySigV2:
        generateInputFn = this.generateQuerySigV2Inputs.bind(this);
        break;
      case CircuitId.AtomicQuerySigV2OnChain:
        generateInputFn = this.generateQuerySigV2OnChainInputs.bind(this);
        break;
      case CircuitId.AtomicQueryV3:
        generateInputFn = this.generateQueryV3Inputs.bind(this);
        break;
      case CircuitId.AtomicQueryV3OnChain:
        generateInputFn = this.generateQueryV3OnChainInputs.bind(this);
        break;
      default:
        throw new Error(`circuit with id ${proofReq.circuitId} is not supported by issuer`);
    }

    return generateInputFn(preparedCredential, identifier, proofReq, params, queries);
  }

  private async generateMTPV2Inputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams,
    circuitQueries: Query[]
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    const circuitClaimData = await this.newCircuitClaimData(
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );
    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const circuitInputs = new AtomicQueryMTPV2Inputs();
    circuitInputs.id = DID.idFromDID(identifier);
    circuitInputs.requestID = BigInt(proofReq.id);

    // todo: don't forget about vp
    circuitInputs.query = circuitQueries[0];
    circuitInputs.claim = {
      issuerID: circuitClaimData.issuerId,
      claim: circuitClaimData.claim,
      incProof: { proof: circuitClaimData.proof, treeState: circuitClaimData.treeState },
      nonRevProof: circuitClaimData.nonRevProof
    };
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;

    return { inputs: circuitInputs.inputsMarshal() };
  }

  private async generateMTPV2OnChainInputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams,
    circuitQueries: Query[]
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    const circuitClaimData = await this.newCircuitClaimData(
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );
    const authPrepared = await this.prepareAuthBJJCredential(identifier);
    const authClaimData = await this.newCircuitClaimData(
      authPrepared.authCredential,
      authPrepared.authCoreClaim
    );

    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);

    const circuitInputs = new AtomicQueryMTPV2OnChainInputs();
    const id = DID.idFromDID(identifier);
    circuitInputs.id = DID.idFromDID(identifier);
    circuitInputs.requestID = BigInt(proofReq.id);

    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());

    const gistProof = toGISTProof(stateProof);
    circuitInputs.gistProof = gistProof;

    if (authClaimData?.treeState) {
      circuitInputs.treeState = {
        state: authClaimData?.treeState?.state,
        claimsRoot: authClaimData?.treeState?.claimsRoot,
        revocationRoot: authClaimData?.treeState?.revocationRoot,
        rootOfRoots: authClaimData?.treeState?.rootOfRoots
      };
    }

    circuitInputs.authClaim = authClaimData.claim;
    circuitInputs.authClaimIncMtp = authClaimData.proof;
    circuitInputs.authClaimNonRevMtp = authPrepared.nonRevProof.proof;
    if (!params.challenge) {
      throw new Error('challenge must be provided for onchain circuits');
    }
    const signature = await this._identityWallet.signChallenge(
      params.challenge,
      authPrepared.authCredential
    );

    circuitInputs.signature = signature;
    circuitInputs.challenge = params.challenge;

    circuitInputs.query = circuitQueries[0];
    circuitInputs.claim = {
      issuerID: circuitClaimData.issuerId,
      claim: circuitClaimData.claim,
      incProof: { proof: circuitClaimData.proof, treeState: circuitClaimData.treeState },
      nonRevProof: circuitClaimData.nonRevProof
    };
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;

    return { inputs: circuitInputs.inputsMarshal() };
  }

  private async generateQuerySigV2Inputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams,
    circuitQueries: Query[]
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    const circuitClaimData = await this.newCircuitClaimData(
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );

    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);

    const circuitInputs = new AtomicQuerySigV2Inputs();
    circuitInputs.id = DID.idFromDID(identifier);
    circuitInputs.claim = {
      issuerID: circuitClaimData?.issuerId,
      signatureProof: circuitClaimData.signatureProof,
      claim: circuitClaimData.claim,
      nonRevProof: circuitClaimData.nonRevProof
    };
    circuitInputs.requestID = BigInt(proofReq.id);
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;

    circuitInputs.query = circuitQueries[0];
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
    return { inputs: circuitInputs.inputsMarshal() };
  }

  private async generateQuerySigV2OnChainInputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams,
    circuitQueries: Query[]
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    const circuitClaimData = await this.newCircuitClaimData(
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );

    const authPrepared = await this.prepareAuthBJJCredential(identifier);
    const authClaimData = await this.newCircuitClaimData(
      authPrepared.authCredential,
      authPrepared.authCoreClaim
    );

    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);

    const circuitInputs = new AtomicQuerySigV2OnChainInputs();
    const id = DID.idFromDID(identifier);
    circuitInputs.id = id;
    circuitInputs.claim = {
      issuerID: circuitClaimData.issuerId,
      signatureProof: circuitClaimData.signatureProof,
      claim: circuitClaimData.claim,
      nonRevProof: circuitClaimData.nonRevProof
    };
    circuitInputs.requestID = BigInt(proofReq.id);
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;

    circuitInputs.query = circuitQueries[0];
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());

    if (authClaimData.treeState) {
      circuitInputs.treeState = {
        state: authClaimData.treeState?.state,
        claimsRoot: authClaimData.treeState?.claimsRoot,
        revocationRoot: authClaimData.treeState?.revocationRoot,
        rootOfRoots: authClaimData.treeState?.rootOfRoots
      };
    }

    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());
    const gistProof = toGISTProof(stateProof);
    circuitInputs.gistProof = gistProof;

    circuitInputs.authClaim = authClaimData.claim;
    circuitInputs.authClaimIncMtp = authClaimData.proof;
    circuitInputs.authClaimNonRevMtp = authPrepared.nonRevProof.proof;

    if (!params.challenge) {
      throw new Error('challenge must be provided for onchain circuits');
    }

    const signature = await this._identityWallet.signChallenge(
      params.challenge,
      authPrepared.authCredential
    );

    circuitInputs.signature = signature;
    circuitInputs.challenge = params.challenge;

    return { inputs: circuitInputs.inputsMarshal() };
  }

  private async generateQueryV3Inputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams,
    circuitQueries: Query[]
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    const circuitClaimData = await this.newCircuitClaimData(
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );

    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    let proofType: ProofType;
    switch (proofReq.query.proofType) {
      case ProofType.BJJSignature:
        proofType = ProofType.BJJSignature;
        break;
      case ProofType.Iden3SparseMerkleTreeProof:
        proofType = ProofType.Iden3SparseMerkleTreeProof;
        break;
      default:
        if (circuitClaimData.proof) {
          proofType = ProofType.Iden3SparseMerkleTreeProof;
        } else if (circuitClaimData.signatureProof) {
          proofType = ProofType.BJJSignature;
        } else {
          throw Error('claim has no MTP or signature proof');
        }
        break;
    }

    const circuitInputs = new AtomicQueryV3Inputs();
    circuitInputs.id = DID.idFromDID(identifier);
    circuitInputs.claim = {
      issuerID: circuitClaimData?.issuerId,
      signatureProof: circuitClaimData.signatureProof,
      claim: circuitClaimData.claim,
      nonRevProof: circuitClaimData.nonRevProof,
      incProof: { proof: circuitClaimData.proof, treeState: circuitClaimData.treeState }
    };
    circuitInputs.requestID = BigInt(proofReq.id);
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;

    circuitInputs.query = circuitQueries[0];

    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());

    circuitInputs.proofType = proofType;
    circuitInputs.linkNonce = params.linkNonce ?? BigInt(0);
    circuitInputs.verifierID = params.verifierDID ? DID.idFromDID(params.verifierDID) : undefined;
    circuitInputs.nullifierSessionID = proofReq.params?.nullifierSessionID
      ? BigInt(proofReq.params?.nullifierSessionID?.toString())
      : BigInt(0);
    return { inputs: circuitInputs.inputsMarshal() };
  }

  private async generateQueryV3OnChainInputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams,
    circuitQueries: Query[]
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    const circuitClaimData = await this.newCircuitClaimData(
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );

    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    let proofType: ProofType;
    switch (proofReq.query.proofType) {
      case ProofType.BJJSignature:
        proofType = ProofType.BJJSignature;
        break;
      case ProofType.Iden3SparseMerkleTreeProof:
        proofType = ProofType.Iden3SparseMerkleTreeProof;
        break;
      default:
        if (circuitClaimData.proof) {
          proofType = ProofType.Iden3SparseMerkleTreeProof;
        } else if (circuitClaimData.signatureProof) {
          proofType = ProofType.BJJSignature;
        } else {
          throw Error('claim has no MTP or signature proof');
        }
        break;
    }

    const circuitInputs = new AtomicQueryV3OnChainInputs();
    circuitInputs.id = DID.idFromDID(identifier);
    circuitInputs.claim = {
      issuerID: circuitClaimData?.issuerId,
      signatureProof: circuitClaimData.signatureProof,
      claim: circuitClaimData.claim,
      nonRevProof: circuitClaimData.nonRevProof,
      incProof: { proof: circuitClaimData.proof, treeState: circuitClaimData.treeState }
    };
    circuitInputs.requestID = BigInt(proofReq.id);
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);
    circuitInputs.profileNonce = BigInt(params.authProfileNonce);
    circuitInputs.skipClaimRevocationCheck = params.skipRevocation;

    circuitInputs.query = circuitQueries[0];
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());

    circuitInputs.proofType = proofType;
    circuitInputs.linkNonce = params.linkNonce ?? BigInt(0);
    circuitInputs.verifierID = params.verifierDID ? DID.idFromDID(params.verifierDID) : undefined;
    circuitInputs.nullifierSessionID = proofReq.params?.nullifierSessionID
      ? BigInt(proofReq.params?.nullifierSessionID?.toString())
      : BigInt(0);

    let isEthIdentity = true;
    try {
      Id.ethAddressFromId(circuitInputs.id);
    } catch {
      isEthIdentity = false;
    }
    circuitInputs.authEnabled = isEthIdentity ? 0 : 1;

    circuitInputs.challenge = BigInt(params.challenge ?? 0);
    const { nonce: authProfileNonce, genesisDID } =
      await this._identityWallet.getGenesisDIDMetadata(identifier);
    const authPrepared = await this.prepareAuthBJJCredential(genesisDID);
    const id = DID.idFromDID(genesisDID);
    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());
    const gistProof = toGISTProof(stateProof);
    circuitInputs.gistProof = gistProof;
    // auth inputs
    if (circuitInputs.authEnabled === 1) {
      const authClaimData = await this.newCircuitClaimData(
        authPrepared.authCredential,
        authPrepared.authCoreClaim
      );
      const signature = await this._identityWallet.signChallenge(
        circuitInputs.challenge,
        authPrepared.authCredential
      );

      circuitInputs.profileNonce = BigInt(authProfileNonce);
      circuitInputs.authClaim = authClaimData.claim;
      circuitInputs.authClaimIncMtp = authClaimData.proof;
      circuitInputs.authClaimNonRevMtp = authPrepared.nonRevProof.proof;
      circuitInputs.treeState = authClaimData.treeState;
      circuitInputs.signature = signature;
    }
    return { inputs: circuitInputs.inputsMarshal() };
  }

  // NewCircuitClaimData generates circuits claim structure
  private async newCircuitClaimData(
    credential: W3CCredential,
    coreClaim: Claim
  ): Promise<CircuitClaim> {
    const smtProof: Iden3SparseMerkleTreeProof | undefined =
      credential.getIden3SparseMerkleTreeProof();

    const circuitClaim = new CircuitClaim();
    circuitClaim.claim = coreClaim;
    circuitClaim.issuerId = DID.idFromDID(DID.parse(credential.issuer));

    if (smtProof) {
      circuitClaim.proof = smtProof.mtp;
      circuitClaim.treeState = {
        state: smtProof.issuerData.state.value,
        claimsRoot: smtProof.issuerData.state.claimsTreeRoot,
        revocationRoot: smtProof.issuerData.state.revocationTreeRoot,
        rootOfRoots: smtProof.issuerData.state.rootOfRoots
      };
    }

    const sigProof = credential.getBJJSignature2021Proof();

    if (sigProof) {
      const issuerDID = sigProof.issuerData.id;
      let userDID: DID;
      if (!credential.credentialSubject.id) {
        userDID = issuerDID;
      } else {
        if (typeof credential.credentialSubject.id !== 'string') {
          throw new Error('credential status `id` is not a string');
        }
        userDID = DID.parse(credential.credentialSubject.id);
      }

      if (!sigProof.issuerData.credentialStatus) {
        throw new Error(
          "can't check the validity of issuer auth claim: no credential status in proof"
        );
      }
      const opts: CredentialStatusResolveOptions = {
        issuerGenesisState: sigProof.issuerData.state,
        issuerDID,
        userDID
      };
      const rs = await this._credentialWallet.getRevocationStatus(
        sigProof.issuerData.credentialStatus,
        opts
      );
      if (!rs) {
        throw new Error("can't fetch the credential status of issuer auth claim");
      }

      const issuerAuthNonRevProof: MTProof = toClaimNonRevStatus(rs);
      if (!sigProof.issuerData.mtp) {
        throw new Error('issuer auth credential must have a mtp proof');
      }
      if (!sigProof.issuerData.authCoreClaim) {
        throw new Error('issuer auth credential must have a core claim proof');
      }

      circuitClaim.signatureProof = {
        signature: sigProof.signature,
        issuerAuthIncProof: {
          proof: sigProof.issuerData.mtp,
          treeState: {
            state: sigProof.issuerData.state.value,
            claimsRoot: sigProof.issuerData.state.claimsTreeRoot,
            revocationRoot: sigProof.issuerData.state.revocationTreeRoot,
            rootOfRoots: sigProof.issuerData.state.rootOfRoots
          }
        },
        issuerAuthClaim: sigProof.issuerData.authCoreClaim,
        issuerAuthNonRevProof
      };
    }

    return circuitClaim;
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
      throw new Error('merklized root position is set not set to None for non-merklized schema');
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
    const authPrepared = await this.prepareAuthBJJCredential(genesisDID);

    const authClaimData = await this.newCircuitClaimData(
      authPrepared.authCredential,
      authPrepared.authCoreClaim
    );

    const signature = await this._identityWallet.signChallenge(
      challenge,
      authPrepared.authCredential
    );
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

  private async findCredential(did: DID, query: ProofQuery): Promise<W3CCredential> {
    const credentials = await this._identityWallet.findOwnedCredentialsByDID(did, query);

    if (!credentials.length) {
      throw new Error(`no credentials belong to did or its profiles`);
    }

    //  For EQ / IN / NIN / LT / GT operations selective if credential satisfies query - we can get any.
    // TODO: choose credential for selective credentials
    const credential = query.skipClaimRevocationCheck
      ? credentials[0]
      : (await this._credentialWallet.findNonRevokedCredential(credentials)).cred;
    return credential;
  }
}
