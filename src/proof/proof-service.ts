import { newHashFromString } from '@iden3/js-merkletree';
import { MTProof, TreeState, ValueProof } from './../circuits/models';
import { RHSCredentialStatus, W3CCredential } from '../verifiable/credential';
import { ProofType } from '../verifiable/constants';

/* eslint-disable no-console */
import {
  DID,
  getUnixTimestamp,
  Claim,
  MerklizedRootPosition,
  BytesHelper
} from '@iden3/js-iden3-core';
import {
  CircuitClaim,
  CircuitId,
  strMTHex,
  Query,
  AtomicQueryMTPV2Inputs,
  AtomicQuerySigV2Inputs,
  QueryOperators,
  StateTransitionInputs,
  AuthV2Inputs
} from '../circuits';
import { RevocationStatus } from '../verifiable/credential';
import { toClaimNonRevStatus, toGISTProof } from './common';
import { NativeProver } from './prover';
import { IIdentityWallet } from '../identity';
import { ICredentialWallet } from '../credentials';
import { Hex, Poseidon, Signature } from '@iden3/js-crypto';
import {
  Iden3SparseMerkleTreeProof,
  MerkleTreeProofWithTreeState,
  ProofQuery
} from '../verifiable';

import { UniversalSchemaLoader } from '../loaders';
import { Parser } from '../schema-processor';
import { ICircuitStorage } from '../storage/interfaces/circuits';
import { IStateStorage } from '../storage/interfaces';
import { Signer } from 'ethers';
import { ZKProof } from '@iden3/js-jwz';
import { ZeroKnowledgeProofRequest } from '../iden3comm';
import { Path } from '@iden3/js-jsonld-merklization';

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
}

export interface ProofGenerationOptions {
  authProfileNonce: number;
  credentialSubjectProfileNonce: number;
  skipRevocation: boolean;
}

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
   * @returns `Promise<{ proof: ZKProof; credential: W3CCredential }>`
   */
  generateProof(
    proofReq: ZeroKnowledgeProofRequest,
    identifier: DID,
    credential: W3CCredential,
    opts?: ProofGenerationOptions
  ): Promise<{ proof: ZKProof; credential: W3CCredential }>;

  /**
   * generates auth inputs
   *
   * @param {Uint8Array} hash - challenge that will be signed
   * @param {DID} did - identity that will generate a proof
   * @param {Number} profileNonce - identity that will generate a proof
   * @param {CircuitId} circuitId - circuit id for authentication
   * @returns `Promise<Uint8Array>`
   */
  generateAuthV2Inputs(
    hash: Uint8Array,
    did: DID,
    profileNonce: number,
    circuitId: CircuitId
  ): Promise<Uint8Array>;

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
 * @export
 * @beta
 * @class ProofService
 * @implements implements IProofService interface
 */
export class ProofService implements IProofService {
  private readonly _prover: NativeProver;
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
    private readonly _circuitStorage: ICircuitStorage,
    private readonly _stateStorage: IStateStorage
  ) {
    this._prover = new NativeProver(_circuitStorage);
  }

  /** {@inheritdoc IProofService.verifyProof} */
  async verifyProof(zkp: ZKProof, circuitId: CircuitId): Promise<boolean> {
    return this._prover.verify(zkp, circuitId);
  }

  /** {@inheritdoc IProofService.generateProof} */
  async generateProof(
    proofReq: ZeroKnowledgeProofRequest,
    identifier: DID,
    credential: W3CCredential,
    opts?: ProofGenerationOptions
  ): Promise<{ proof: ZKProof; credential: W3CCredential }> {
    if (!opts) {
      opts = {
        authProfileNonce: 0,
        credentialSubjectProfileNonce: 0,
        skipRevocation: false
      };
    }
    const preparedCredential: PreparedCredential = await this.getPreparedCredential(credential);

    const inputs = await this.generateInputs(preparedCredential, identifier, proofReq, opts);

    const proof = await this._prover.generate(inputs, proofReq.circuitId as CircuitId);
    return { proof, credential: preparedCredential.credential };
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

    const newTreeState: TreeState = {
      revocationRoot: newTreeModel.revocationTree.root,
      claimsRoot: newTreeModel.claimsTree.root,
      state: newTreeModel.state,
      rootOfRoots: newTreeModel.rootsTree.root
    };
    const challenge = Poseidon.hash([oldTreeState.state.bigInt(), newTreeState.state.bigInt()]);

    const signature = await this._identityWallet.signChallenge(challenge, authInfo.authCredential);

    const circuitInputs = new StateTransitionInputs();
    circuitInputs.id = did.id;

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
    return txId;
  }

  private async getPreparedCredential(credential: W3CCredential): Promise<PreparedCredential> {
    const { cred: nonRevokedCred, revStatus } =
      await this._credentialWallet.findNonRevokedCredential([credential]);

    const credCoreClaim = await this._identityWallet.getCoreClaimFromCredential(nonRevokedCred);

    return { credential: nonRevokedCred, revStatus, credentialCoreClaim: credCoreClaim };
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
    opts: ProofGenerationOptions
  ): Promise<Uint8Array> {
    let inputs: Uint8Array;
    if (proofReq.circuitId === CircuitId.AtomicQueryMTPV2) {
      const circuitClaimData = await this.newCircuitClaimData(
        preparedCredential.credential,
        preparedCredential.credentialCoreClaim
      );

      circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);


      const circuitInputs = new AtomicQueryMTPV2Inputs();
      circuitInputs.id = identifier.id;
      circuitInputs.requestID = BigInt(proofReq.id);
      circuitInputs.query = await this.toCircuitsQuery(
        proofReq.query,
        preparedCredential.credential,
        preparedCredential.credentialCoreClaim
      );
      circuitInputs.claim = {
        issuerID: circuitClaimData.issuerId,
        claim: circuitClaimData.claim,
        incProof: { proof: circuitClaimData.proof, treeState: circuitClaimData.treeState },
        nonRevProof: circuitClaimData.nonRevProof
      };
      circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
      circuitInputs.claimSubjectProfileNonce = BigInt(opts.credentialSubjectProfileNonce);
      circuitInputs.profileNonce = BigInt(opts.authProfileNonce);
      circuitInputs.skipClaimRevocationCheck = opts.skipRevocation;

      inputs = circuitInputs.inputsMarshal();
    } else if (proofReq.circuitId === CircuitId.AtomicQuerySigV2) {
      const circuitClaimData = await this.newCircuitClaimData(
        preparedCredential.credential,
        preparedCredential.credentialCoreClaim
      );

      circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);

      const circuitInputs = new AtomicQuerySigV2Inputs();
      circuitInputs.id = identifier.id;
      circuitInputs.claim = {
        issuerID: circuitClaimData.issuerId,
        signatureProof: circuitClaimData.signatureProof,
        claim: circuitClaimData.claim,
        nonRevProof: circuitClaimData.nonRevProof
      };
      circuitInputs.requestID = BigInt(proofReq.id);
      circuitInputs.claimSubjectProfileNonce = BigInt(opts.credentialSubjectProfileNonce);
      circuitInputs.profileNonce = BigInt(opts.authProfileNonce);
      circuitInputs.skipClaimRevocationCheck = opts.skipRevocation;
      circuitInputs.query = await this.toCircuitsQuery(
        proofReq.query,
        preparedCredential.credential,
        preparedCredential.credentialCoreClaim
      );
      circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
      inputs = circuitInputs.inputsMarshal();
    } else {
      throw new Error(`circuit with id ${proofReq.circuitId} is not supported by issuer`);
    }
    return inputs;
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
    circuitClaim.issuerId = DID.parse(credential.issuer).id;

    if (smtProof) {
      circuitClaim.proof = smtProof.mtp;
      circuitClaim.treeState = {
        state: strMTHex(smtProof.issuerData.state?.value),
        claimsRoot: strMTHex(smtProof.issuerData.state?.claimsTreeRoot),
        revocationRoot: strMTHex(smtProof.issuerData.state?.revocationTreeRoot),
        rootOfRoots: strMTHex(smtProof.issuerData.state?.rootOfRoots)
      };
    }

    const sigProof = credential.getBJJSignature2021Proof();

    if (sigProof) {
      const signature = await bJJSignatureFromHexString(sigProof.signature);

      const rs: RevocationStatus = await this._credentialWallet.getRevocationStatus(
        sigProof.issuerData.credentialStatus as RHSCredentialStatus,
        DID.parse(sigProof.issuerData.id),
        sigProof.issuerData
      );
      //todo: check if this is correct
      const issuerAuthNonRevProof: MTProof = {
        treeState: {
          state: strMTHex(rs.issuer.state),
          claimsRoot: strMTHex(rs.issuer.claimsTreeRoot),
          revocationRoot: strMTHex(rs.issuer.revocationTreeRoot),
          rootOfRoots: strMTHex(rs.issuer.rootOfRoots)
        },
        proof: rs.mtp
      };
      if (!sigProof.issuerData.mtp) {
        throw new Error('issuer auth credential must have a mtp proof');
      }
      if (!sigProof.issuerData.authCoreClaim) {
        throw new Error('issuer auth credential must have a core claim proof');
      }

      circuitClaim.signatureProof = {
        signature,
        issuerAuthIncProof: {
          proof: sigProof.issuerData.mtp,
          treeState: {
            state: strMTHex(sigProof.issuerData.state?.value),
            claimsRoot: strMTHex(sigProof.issuerData.state?.claimsTreeRoot),
            revocationRoot: strMTHex(sigProof.issuerData.state?.revocationTreeRoot),
            rootOfRoots: strMTHex(sigProof.issuerData.state?.rootOfRoots)
          }
        },
        issuerAuthClaim: new Claim().fromHex(sigProof.issuerData.authCoreClaim),
        issuerAuthNonRevProof
      };
    }

    return circuitClaim;
  }
  private async toCircuitsQuery(
    query: ProofQuery,
    credential: W3CCredential,
    coreClaim: Claim
  ): Promise<Query> {
    const mtPosition = coreClaim.getMerklizedPosition();

    if (mtPosition === MerklizedRootPosition.None) {
      return this.prepareNonMerklizedQuery(query, credential);
    }

    return this.prepareMerklizedQuery(query, credential, mtPosition);
  }
  private async prepareMerklizedQuery(
    query: ProofQuery,
    credential: W3CCredential,
    merklizedPosition: MerklizedRootPosition
  ): Promise<Query> {
    const parsedQuery = await this.parseRequest(query.credentialSubject);

    const loader = new UniversalSchemaLoader('ipfs.io');
    const schema = await loader.load(credential['@context'][2]);

    let path :Path =  new Path();
    if (parsedQuery.query.operator !== QueryOperators.$noop){
      path = await Path.getContextPathKey(
        new TextDecoder().decode(schema),
        credential.type[1],
        parsedQuery.fieldName
      );
    }
    path.prepend(['https://www.w3.org/2018/credentials#credentialSubject']);

    const mk = await credential.merklize();
    const { proof, value: mtValue } = await mk.proof(path);

    const pathKey = await path.mtEntry();
    parsedQuery.query.valueProof = new ValueProof();
    parsedQuery.query.valueProof.mtp = proof;
    parsedQuery.query.valueProof.path = pathKey;
    parsedQuery.query.valueProof.mtp = proof;
    parsedQuery.query.valueProof.value = BigInt(await mtValue.mtEntry());

    if (merklizedPosition == MerklizedRootPosition.Index) {
      parsedQuery.query.slotIndex = 2; // value data slot a
    } else {
      parsedQuery.query.slotIndex = 5; // value data slot b
    }
    return parsedQuery.query;
  }

  private async prepareNonMerklizedQuery(
    query: ProofQuery,
    credential: W3CCredential
  ): Promise<Query> {
    const loader = new UniversalSchemaLoader('ipfs.io');
    const schema = await loader.load(credential.credentialSchema.id);

    if (query.credentialSubject && Object.keys(query.credentialSubject).length > 1) {
      throw new Error('multiple requests are not supported');
    }

    const parsedQuery = await this.parseRequest(query.credentialSubject);

    parsedQuery.query.slotIndex = new Parser().getFieldSlotIndex(parsedQuery.fieldName, schema);

    return parsedQuery.query;
  }

  private async parseRequest(req?: { [key: string]: unknown }): Promise<QueryWithFieldName> {
    if (!req) {
      const query = new Query();
      query.operator = QueryOperators.$noop;
      return { query, fieldName: '' };
    }

    let fieldName = '';
    let fieldReq = new Map<string, unknown>();
    if (Object.keys(req).length > 1) {
      throw new Error(`multiple requests  not supported`);
    }

    for (const [key, value] of Object.entries(req)) {
      fieldName = key;

      fieldReq = value as Map<string, unknown>;

      if (Object.keys(fieldReq).length > 1) {
        throw new Error(`multiple predicates for one field not supported`);
      }
      break;
    }

    let operator = 0;
    const values: bigint[] = new Array<bigint>(64).fill(BigInt(0));
    for (const [key, value] of Object.entries(fieldReq)) {
      if (!QueryOperators[key]) {
        throw new Error(`operator is not supported by lib`);
      }
      operator = QueryOperators[key];

      if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index++) {
          values[index] = BigInt(value[index]);
        }
      } else {
        values[0] = BigInt(value as string);
      }
      break;
    }

    const query = new Query();
    query.operator = operator;
    query.values = values;

    return { query, fieldName };
  }

  /** {@inheritdoc IProofService.generateAuthV2Inputs} */
  async generateAuthV2Inputs(
    hash: Uint8Array,
    did: DID,
    profileNonce: number,
    circuitId: CircuitId
  ): Promise<Uint8Array> {
    if (circuitId !== CircuitId.AuthV2) {
      throw new Error('CircuitId is not supported');
    }
    // todo: check if bigint is correct
    const challenge = BytesHelper.bytesToInt(hash.reverse());
    const authPrepared = await this.prepareAuthBJJCredential(did);

    const authClaimData = await this.newCircuitClaimData(
      authPrepared.authCredential,
      authPrepared.authCoreClaim
    );

    const signature = await this._identityWallet.signChallenge(
      challenge,
      authPrepared.authCredential
    );
    const id = did.id;
    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());

    const gistProof = toGISTProof(stateProof);

    const authInputs = new AuthV2Inputs();

    authInputs.genesisID = id;
    authInputs.profileNonce = BigInt(profileNonce);
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
    const gistRoot = newHashFromString(pubSignals[2]).bigInt();
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
}
// BJJSignatureFromHexString converts hex to  babyjub.Signature
export const bJJSignatureFromHexString = async (sigHex: string): Promise<Signature> => {
  const signatureBytes = Hex.decodeString(sigHex);
  const compressedSig = Uint8Array.from(signatureBytes).slice(0, 64);
  const bjjSig = Signature.newFromCompressed(compressedSig);
  return bjjSig as Signature;
};
