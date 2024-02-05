import { DID, Id, getUnixTimestamp } from '@iden3/js-iden3-core';
import {
  Iden3SparseMerkleTreeProof,
  ProofType,
  RevocationStatus,
  W3CCredential
} from '../verifiable';
import { ZeroKnowledgeProofRequest } from '../iden3comm';
import {
  AtomicQueryMTPV2Inputs,
  AtomicQueryMTPV2OnChainInputs,
  AtomicQuerySigV2Inputs,
  AtomicQuerySigV2OnChainInputs,
  AtomicQueryV3Inputs,
  AtomicQueryV3OnChainInputs,
  CircuitClaim,
  CircuitId,
  LinkedMultiQueryInputs,
  MTProof,
  Operators,
  Query,
  TreeState
} from '../circuits';
import {
  PreparedAuthBJJCredential,
  PreparedCredential,
  toClaimNonRevStatus,
  toGISTProof
} from './common';
import { IIdentityWallet } from '../identity';
import { IStateStorage } from '../storage';
import {
  CredentialStatusResolveOptions,
  ICredentialWallet,
  getUserDIDFromCredential
} from '../credentials';

export type DIDProfileMetadata = {
  authProfileNonce: number;
  credentialSubjectProfileNonce: number;
};

export type ProofGenerationOptions = {
  skipRevocation: boolean;
  challenge?: bigint;
  credential?: W3CCredential;
  credentialRevocationStatus?: RevocationStatus;
  verifierDid?: DID;
  linkNonce?: bigint;
};

export type ProofInputsParams = ProofGenerationOptions & DIDProfileMetadata;

type InputContext = {
  preparedCredential: PreparedCredential;
  identifier: DID;
  proofReq: ZeroKnowledgeProofRequest;
  params: ProofInputsParams;
  circuitQueries: Query[];
};

const circuitValidator: {
  [k in CircuitId]: { maxQueriesCount: number };
} = {
  [CircuitId.AtomicQueryMTPV2]: { maxQueriesCount: 1 },
  [CircuitId.AtomicQueryMTPV2OnChain]: { maxQueriesCount: 1 },
  [CircuitId.AtomicQuerySigV2]: { maxQueriesCount: 1 },
  [CircuitId.AtomicQuerySigV2OnChain]: { maxQueriesCount: 1 },
  [CircuitId.AtomicQueryV3]: { maxQueriesCount: 1 },
  [CircuitId.AtomicQueryV3OnChain]: { maxQueriesCount: 1 },
  [CircuitId.AuthV2]: { maxQueriesCount: 0 },
  [CircuitId.StateTransition]: { maxQueriesCount: 0 },
  [CircuitId.LinkedMultiQuery10]: { maxQueriesCount: LinkedMultiQueryInputs.queryCount }
};

export class InputGenerator {
  constructor(
    private readonly _identityWallet: IIdentityWallet,
    private readonly _credentialWallet: ICredentialWallet,
    private readonly _stateStorage: IStateStorage
  ) {}

  async generateInputs(ctx: InputContext): Promise<Uint8Array> {
    const { circuitId } = ctx.proofReq;
    const fnName = `${circuitId.split('-')[0]}PrepareInputs`;

    const queriesLength = ctx.circuitQueries.length;

    if (queriesLength > circuitValidator[circuitId as CircuitId].maxQueriesCount) {
      throw new Error(
        `circuit ${circuitId} supports only ${
          circuitValidator[circuitId as CircuitId].maxQueriesCount
        } queries`
      );
    }

    const fn = (this as unknown as { [k: string]: (ctx: InputContext) => Promise<Uint8Array> })[
      fnName
    ];

    if (!fn) {
      throw new Error(`inputs generator for ${circuitId} not found`);
    }

    return fn(ctx);
  }

  async newCircuitClaimData(preparedCredential: PreparedCredential): Promise<CircuitClaim> {
    const smtProof: Iden3SparseMerkleTreeProof | undefined =
      preparedCredential.credential.getIden3SparseMerkleTreeProof();

    const circuitClaim = new CircuitClaim();
    circuitClaim.claim = preparedCredential.credentialCoreClaim;
    circuitClaim.issuerId = DID.idFromDID(DID.parse(preparedCredential.credential.issuer));

    if (smtProof) {
      circuitClaim.proof = smtProof.mtp;
      circuitClaim.treeState = {
        state: smtProof.issuerData.state.value,
        claimsRoot: smtProof.issuerData.state.claimsTreeRoot,
        revocationRoot: smtProof.issuerData.state.revocationTreeRoot,
        rootOfRoots: smtProof.issuerData.state.rootOfRoots
      };
    }

    const sigProof = preparedCredential.credential.getBJJSignature2021Proof();

    if (sigProof) {
      const issuerDID = sigProof.issuerData.id;
      const userDID: DID = getUserDIDFromCredential(issuerDID, preparedCredential.credential);

      const { credentialStatus, mtp, authCoreClaim } = sigProof.issuerData;

      if (!credentialStatus) {
        throw new Error(
          "can't check the validity of issuer auth claim: no credential status in proof"
        );
      }

      if (!mtp) {
        throw new Error('issuer auth credential must have a mtp proof');
      }

      if (!authCoreClaim) {
        throw new Error('issuer auth credential must have a core claim proof');
      }

      const opts: CredentialStatusResolveOptions = {
        issuerGenesisState: sigProof.issuerData.state,
        issuerDID,
        userDID
      };

      const rs = await this._credentialWallet.getRevocationStatus(credentialStatus, opts);

      const issuerAuthNonRevProof: MTProof = toClaimNonRevStatus(rs);

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

  async prepareAuthBJJCredential(
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

    return {
      credential: authCredential,
      incProof,
      nonRevProof,
      coreClaim: authCoreClaim
    };
  }

  private credentialAtomicQueryMTPV2PrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);
    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const circuitInputs = new AtomicQueryMTPV2Inputs();
    circuitInputs.id = DID.idFromDID(identifier);
    circuitInputs.requestID = BigInt(proofReq.id);

    const query = circuitQueries[0];
    query.operator = query.operator === Operators.SD ? Operators.EQ : query.operator;
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

    return circuitInputs.inputsMarshal();
  };

  private credentialAtomicQueryMTPV2OnChainPrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);

    const authInfo = await this.prepareAuthBJJCredential(identifier);

    const authClaimData = await this.newCircuitClaimData({
      credential: authInfo.credential,
      credentialCoreClaim: authInfo.coreClaim
    });

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
    circuitInputs.authClaimNonRevMtp = authInfo.nonRevProof.proof;
    if (!params.challenge) {
      throw new Error('challenge must be provided for onchain circuits');
    }
    const signature = await this._identityWallet.signChallenge(
      params.challenge,
      authInfo.credential
    );

    circuitInputs.signature = signature;
    circuitInputs.challenge = params.challenge;

    const query = circuitQueries[0];
    query.operator = query.operator === Operators.SD ? Operators.EQ : query.operator;
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

    return circuitInputs.inputsMarshal();
  };

  private credentialAtomicQuerySigV2PrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);

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

    const query = circuitQueries[0];
    query.operator = query.operator === Operators.SD ? Operators.EQ : query.operator;
    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
    return circuitInputs.inputsMarshal();
  };

  private credentialAtomicQuerySigV2OnChainPrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);

    const authInfo = await this.prepareAuthBJJCredential(identifier);

    const authClaimData = await this.newCircuitClaimData({
      credential: authInfo.credential,
      credentialCoreClaim: authInfo.coreClaim
    });

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

    const query = circuitQueries[0];
    query.operator = query.operator === Operators.SD ? Operators.EQ : query.operator;
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
    circuitInputs.authClaimNonRevMtp = authInfo.nonRevProof.proof;

    if (!params.challenge) {
      throw new Error('challenge must be provided for onchain circuits');
    }

    const signature = await this._identityWallet.signChallenge(
      params.challenge,
      authInfo.credential
    );

    circuitInputs.signature = signature;
    circuitInputs.challenge = params.challenge;

    return circuitInputs.inputsMarshal();
  };

  private credentialAtomicQueryV3PrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);

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

    const query = circuitQueries[0];
    query.values = query.operator === Operators.SD ? new Array(64).fill(0) : query.values;
    circuitInputs.query = query;

    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());

    circuitInputs.proofType = proofType;
    circuitInputs.linkNonce = params.linkNonce ?? BigInt(0);
    circuitInputs.verifierID = params.verifierDid ? DID.idFromDID(params.verifierDid) : undefined;
    circuitInputs.nullifierSessionID = proofReq.params?.nullifierSessionId
      ? BigInt(proofReq.params?.nullifierSessionId?.toString())
      : BigInt(0);
    return circuitInputs.inputsMarshal();
  };

  private credentialAtomicQueryV3OnChainPrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);

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

    const query = circuitQueries[0];
    query.values = query.operator === Operators.SD ? new Array(64).fill(0) : query.values;
    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());

    circuitInputs.proofType = proofType;
    circuitInputs.linkNonce = params.linkNonce ?? BigInt(0);
    circuitInputs.verifierID = params.verifierDid ? DID.idFromDID(params.verifierDid) : undefined;
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
    const id = DID.idFromDID(genesisDID);
    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());
    const gistProof = toGISTProof(stateProof);
    circuitInputs.gistProof = gistProof;
    // auth inputs
    if (circuitInputs.authEnabled === 1) {
      const authPrepared = await this.prepareAuthBJJCredential(genesisDID);

      const authClaimData = await this.newCircuitClaimData({
        credential: authPrepared.credential,
        credentialCoreClaim: authPrepared.coreClaim
      });

      const signature = await this._identityWallet.signChallenge(
        circuitInputs.challenge,
        authPrepared.credential
      );

      circuitInputs.profileNonce = BigInt(authProfileNonce);
      circuitInputs.authClaim = authClaimData.claim;
      circuitInputs.authClaimIncMtp = authClaimData.proof;
      circuitInputs.authClaimNonRevMtp = authPrepared.nonRevProof.proof;
      circuitInputs.treeState = authClaimData.treeState;
      circuitInputs.signature = signature;
    }
    return circuitInputs.inputsMarshal();
  };

  private linkedMultiQuery10PrepareInputs = async ({
    preparedCredential,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);

    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const circuitInputs = new LinkedMultiQueryInputs();
    circuitInputs.linkNonce = params.linkNonce ?? BigInt(0);

    circuitInputs.claim = circuitClaimData.claim;
    circuitInputs.query = circuitQueries;

    return circuitInputs.inputsMarshal();
  };
}
