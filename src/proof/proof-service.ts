import { Hex, Poseidon, Signature } from '@iden3/js-crypto';
import {
  BytesHelper,
  Claim,
  DID,
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
  LinkedMultiQueryInputs,
  LinkedNullifierInputs,
  MTProof,
  Query,
  QueryOperators,
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
  verifiablePresentationFromCred,
  W3CCredential
} from '../verifiable';
import { toClaimNonRevStatus, toGISTProof } from './common';
import { IZKProver, NativeProver } from './prover';

import { Merklizer, Options, Path, getDocumentLoader } from '@iden3/js-jsonld-merklization';
import { ZKProof } from '@iden3/js-jwz';
import { Signer } from 'ethers';
import { JSONObject, ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from '../iden3comm';
import { JSONSchema, Parser, cacheLoader } from '../schema-processor';
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
  authEnabled?: number;

  // LINK ID POC:
  queryLength?: number;
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

    const credential =
      opts.credential ?? (await this.findCredential(identifier, proofReq.query as ProofQuery));

    const { nonce: authProfileNonce, genesisDID } =
      await this._identityWallet.getGenesisDIDMetadata(identifier);

    const preparedCredential: PreparedCredential = await this.getPreparedCredential(credential);

    const subjectDID = DID.parse(preparedCredential.credential.credentialSubject['id'] as string);

    const { nonce: credentialSubjectProfileNonce, genesisDID: subjectGenesisDID } =
      await this._identityWallet.getGenesisDIDMetadata(subjectDID);

    if (subjectGenesisDID.string() !== genesisDID.string()) {
      throw new Error('subject and auth profiles are not derived from the same did');
    }
    const { inputs, vp } = await this.generateInputs(preparedCredential, genesisDID, proofReq, {
      ...opts,
      authProfileNonce,
      credentialSubjectProfileNonce
    });

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
    params: InputsParams
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

      // Link ID POC:
      case CircuitId.LinkedNullifier:
        generateInputFn = this.generateLinkedNullifierInputs.bind(this);
        break;
      case CircuitId.LinkedMultiQuery3:
        params.queryLength = 3;
        generateInputFn = this.generateLinkedMultiQueryInputs.bind(this);
        break;
      case CircuitId.LinkedMultiQuery10:
        params.queryLength = 10;
        generateInputFn = this.generateLinkedMultiQueryInputs.bind(this);
        break;
      default:
        throw new Error(`circuit with id ${proofReq.circuitId} is not supported by issuer`);
    }

    return generateInputFn(preparedCredential, identifier, proofReq, params);
  }

  private async generateMTPV2Inputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    const circuitClaimData = await this.newCircuitClaimData(
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );
    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const circuitInputs = new AtomicQueryMTPV2Inputs();
    circuitInputs.id = DID.idFromDID(identifier);
    circuitInputs.requestID = BigInt(proofReq.id);
    const { query, vp } = await this.toCircuitsQuery(
      proofReq.query as ProofQuery,
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );
    circuitInputs.query = query;
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

    return { inputs: circuitInputs.inputsMarshal(), vp };
  }

  private async generateMTPV2OnChainInputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams
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

    const { query, vp } = await this.toCircuitsQuery(
      proofReq.query as ProofQuery,
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );
    circuitInputs.query = query;
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

    return { inputs: circuitInputs.inputsMarshal(), vp };
  }

  private async generateQuerySigV2Inputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams
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
    const { query, vp } = await this.toCircuitsQuery(
      proofReq.query as ProofQuery,
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );
    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
    return { inputs: circuitInputs.inputsMarshal(), vp };
  }

  private async generateQuerySigV2OnChainInputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams
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
    const { query, vp } = await this.toCircuitsQuery(
      proofReq.query as ProofQuery,
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );
    circuitInputs.query = query;
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

    return { inputs: circuitInputs.inputsMarshal(), vp };
  }

  // LinkID POC:
  private async generateLinkedNullifierInputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    const circuitClaimData = await this.newCircuitClaimData(
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );

    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);

    const circuitInputs = new LinkedNullifierInputs();
    circuitInputs.linkID = (proofReq.query as JSONObject).linkID
      ? BigInt((proofReq.query as JSONObject).linkID.toString())
      : BigInt(0);
    circuitInputs.linkNonce = (proofReq.query as JSONObject).linkNonce
      ? BigInt((proofReq.query as JSONObject).linkNonce.toString())
      : BigInt(0);
    circuitInputs.issuerClaim = circuitClaimData.claim;
    circuitInputs.id = DID.idFromDID(identifier);
    circuitInputs.claimSubjectProfileNonce = BigInt(params.credentialSubjectProfileNonce);

    circuitInputs.verifierID = params.verifierDID ? DID.idFromDID(params.verifierDID) : undefined;
    circuitInputs.verifierSessionID = (proofReq.query as JSONObject).verifierSessionID
      ? BigInt((proofReq.query as JSONObject).verifierSessionID?.toString())
      : BigInt(0);

    return { inputs: circuitInputs.inputsMarshal(), vp: undefined };
  }

  private async generateLinkedMultiQueryInputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    const circuitClaimData = await this.newCircuitClaimData(
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );

    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    let proofType: ProofType;
    switch ((proofReq.query as JSONObject).proofType) {
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

    const circuitInputs = new LinkedMultiQueryInputs();
    circuitInputs.linkID = (proofReq.query as JSONObject).linkID
      ? BigInt((proofReq.query as JSONObject).linkID.toString())
      : BigInt(0);
    circuitInputs.linkNonce = (proofReq.query as JSONObject).linkNonce
      ? BigInt((proofReq.query as JSONObject).linkNonce.toString())
      : BigInt(0);

    circuitInputs.claim = circuitClaimData.claim;

    if (proofReq.query.length !== params.queryLength) {
      throw Error('invalid query length');
    }
    const queries = [];
    for (let i = 0; i < (proofReq.query as JSONObject[]).length; i++) {
      const { query, vp } = await this.toCircuitsQuery(
        (proofReq.query as JSONObject[])[i] as ProofQuery,
        preparedCredential.credential,
        preparedCredential.credentialCoreClaim
      );
      queries.push(query);
    }

    return { inputs: circuitInputs.inputsMarshal(), vp: undefined };
  }

  // End LinkID POC.

  private async generateQueryV3Inputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    const circuitClaimData = await this.newCircuitClaimData(
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );

    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    let proofType: ProofType;
    switch ((proofReq.query as JSONObject).proofType) {
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
    const { query, vp } = await this.toCircuitsQuery(
      proofReq.query as ProofQuery,
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );
    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());

    circuitInputs.proofType = proofType;
    circuitInputs.linkNonce = (proofReq.query as JSONObject).linkNonce
      ? BigInt((proofReq.query as JSONObject).linkNonce.toString())
      : BigInt(0);
    circuitInputs.verifierID = params.verifierDID ? DID.idFromDID(params.verifierDID) : undefined;
    circuitInputs.nullifierSessionID = proofReq.params?.nullifierSessionID
      ? BigInt(proofReq.params?.nullifierSessionID?.toString())
      : BigInt(0);
    return { inputs: circuitInputs.inputsMarshal(), vp };
  }

  private async generateQueryV3OnChainInputs(
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZeroKnowledgeProofRequest,
    params: InputsParams
  ): Promise<{ inputs: Uint8Array; vp?: object }> {
    const circuitClaimData = await this.newCircuitClaimData(
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );

    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    let proofType: ProofType;
    switch ((proofReq.query as JSONObject).proofType) {
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
    const { query, vp } = await this.toCircuitsQuery(
      proofReq.query as ProofQuery,
      preparedCredential.credential,
      preparedCredential.credentialCoreClaim
    );
    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());

    circuitInputs.proofType = proofType;
    circuitInputs.linkNonce = (proofReq.query as JSONObject).linkNonce
      ? BigInt((proofReq.query as JSONObject).linkNonce.toString())
      : BigInt(0);
    circuitInputs.verifierID = params.verifierDID ? DID.idFromDID(params.verifierDID) : undefined;
    circuitInputs.nullifierSessionID = proofReq.params?.nullifierSessionID
      ? BigInt(proofReq.params?.nullifierSessionID?.toString())
      : BigInt(0);
    circuitInputs.authEnabled = params.authEnabled ?? 0;

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
    return { inputs: circuitInputs.inputsMarshal(), vp };
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
    query: ProofQuery,
    credential: W3CCredential,
    coreClaim: Claim
  ): Promise<{ query: Query; vp?: object }> {
    const mtPosition = coreClaim.getMerklizedPosition();

    return mtPosition === MerklizedRootPosition.None
      ? this.prepareNonMerklizedQuery(query, credential)
      : this.prepareMerklizedQuery(query, credential);
  }

  private async prepareMerklizedQuery(
    query: ProofQuery,
    credential: W3CCredential
  ): Promise<{ query: Query; vp?: object }> {
    const parsedQuery = await this.parseRequest(query.credentialSubject);

    const ldContext = await this.loadLdContextFromJSONSchema(credential.credentialSchema.id);

    let path: Path = new Path();
    if (parsedQuery.fieldName) {
      path = await Path.getContextPathKey(
        byteDecoder.decode(ldContext),
        credential.type[1],
        parsedQuery.fieldName,
        this._ldOptions
      );
    }
    path.prepend(['https://www.w3.org/2018/credentials#credentialSubject']);

    const mk = await credential.merklize(this._ldOptions);

    const { proof, value: mtValue } = await mk.proof(path);

    const pathKey = await path.mtEntry();
    parsedQuery.query.valueProof = new ValueProof();
    parsedQuery.query.valueProof.mtp = proof;
    parsedQuery.query.valueProof.path = pathKey;
    parsedQuery.query.valueProof.mtp = proof;
    const mtEntry = await mtValue?.mtEntry();
    if (!mtEntry) {
      throw new Error(`can't merklize credential: no merkle tree entry found`);
    }
    parsedQuery.query.valueProof.value = mtEntry;

    // for merklized credentials slotIndex in query must be equal to zero
    // and not a position of merklization root.
    // it has no influence on check in the off-chain circuits, but it aligns with onchain verification standard
    parsedQuery.query.slotIndex = 0;

    if (!parsedQuery.fieldName) {
      const resultQuery = parsedQuery.query;
      resultQuery.operator = QueryOperators.$eq;
      resultQuery.values = [mtEntry];
      return { query: resultQuery };
    }
    if (parsedQuery.isSelectiveDisclosure) {
      const rawValue = mk.rawValue(path);
      const vp = createVerifiablePresentation(
        query.context ?? '',
        query.type ?? '',
        parsedQuery.fieldName,
        rawValue
      );
      const resultQuery = parsedQuery.query;
      resultQuery.operator = QueryOperators.$eq;
      resultQuery.values = [mtEntry];
      return { query: resultQuery, vp };
    }
    if (parsedQuery.rawValue === null || parsedQuery.rawValue === undefined) {
      throw new Error('value is not presented in the query');
    }
    const ldType = await mk.jsonLDType(path);
    parsedQuery.query.values = await this.transformQueryValueToBigInts(
      parsedQuery.rawValue,
      ldType
    );

    return { query: parsedQuery.query };
  }

  private async prepareNonMerklizedQuery(
    query: ProofQuery,
    credential: W3CCredential
  ): Promise<{ query: Query; vp?: object }> {
    const ldContext = await this.loadLdContextFromJSONSchema(credential.credentialSchema.id);

    if (query.credentialSubject && Object.keys(query.credentialSubject).length > 1) {
      throw new Error('multiple requests are not supported');
    }

    const parsedQuery = await this.parseRequest(query.credentialSubject);

    if (!query.type) {
      throw new Error('query type is not defined');
    }

    parsedQuery.query.slotIndex = await Parser.getFieldSlotIndex(
      parsedQuery.fieldName,
      query.type,
      ldContext
    );
    const { vp, mzValue, dataType } = await verifiablePresentationFromCred(
      credential,
      query,
      parsedQuery.fieldName,
      this._ldOptions
    );

    if (parsedQuery.isSelectiveDisclosure) {
      const resultQuery = parsedQuery.query;
      resultQuery.operator = QueryOperators.$eq;
      resultQuery.values = [await mzValue.mtEntry()];
      return { query: resultQuery, vp };
    }
    if (parsedQuery.rawValue === null || parsedQuery.rawValue === undefined) {
      throw new Error('value is not presented in the query');
    }

    parsedQuery.query.values = await this.transformQueryValueToBigInts(
      parsedQuery.rawValue,
      dataType
    );

    return { query: parsedQuery.query };
  }

  private async loadLdContextFromJSONSchema(jsonSchemaURL: string): Promise<Uint8Array> {
    const loader = getDocumentLoader(this._ldOptions);

    let schema: object;
    try {
      schema = (await loader(jsonSchemaURL)).document;
    } catch (e) {
      throw new Error(`can't load credential schema ${jsonSchemaURL}`);
    }
    const jsonSchema = schema as JSONSchema;

    let ldSchema: object;
    let ldContextUrl = '';
    try {
      ldContextUrl = jsonSchema.$metadata.uris['jsonLdContext'];
      if (!ldContextUrl) {
        throw new Error('ldContext is not defined in json schema metadata');
      }
      ldSchema = (await loader(ldContextUrl)).document;
    } catch (e) {
      throw new Error(`can't load ld context from url ${ldContextUrl}`);
    }
    return byteEncoder.encode(JSON.stringify(ldSchema));
  }

  private async parseRequest(req?: { [key: string]: unknown }): Promise<QueryWithFieldName> {
    if (!req) {
      const query = new Query();
      query.operator = QueryOperators.$eq;
      return { query, fieldName: '' };
    }

    const entries = Object.entries(req);
    if (entries.length > 1) {
      throw new Error(`multiple requests  not supported`);
    }

    const [fieldName, fieldReq] = entries[0];

    const fieldReqEntries = Object.entries(fieldReq as { [key: string]: unknown });

    if (fieldReqEntries.length > 1) {
      throw new Error(`multiple predicates for one field not supported`);
    }

    const isSelectiveDisclosure = fieldReqEntries.length === 0;
    const query = new Query();

    if (isSelectiveDisclosure) {
      return { query, fieldName, isSelectiveDisclosure };
    }

    let operator = 0;
    const [key, value] = fieldReqEntries[0];
    if (!QueryOperators[key as keyof typeof QueryOperators]) {
      throw new Error(`operator is not supported by lib`);
    }
    operator = QueryOperators[key as keyof typeof QueryOperators];

    query.operator = operator;

    return { query, fieldName, rawValue: value };
  }

  async transformQueryValueToBigInts(value: unknown, ldType: string): Promise<bigint[]> {
    const values: bigint[] = new Array<bigint>(64).fill(BigInt(0));

    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index++) {
        values[index] = await Merklizer.hashValue(ldType, value[index]);
      }
    } else {
      values[0] = await Merklizer.hashValue(ldType, value);
    }
    return values;
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
// BJJSignatureFromHexString converts hex to  babyjub.Signature
export const bJJSignatureFromHexString = async (sigHex: string): Promise<Signature> => {
  const signatureBytes = Hex.decodeString(sigHex);
  const compressedSig = Uint8Array.from(signatureBytes).slice(0, 64);
  const bjjSig = Signature.newFromCompressed(compressedSig);
  return bjjSig as Signature;
};
