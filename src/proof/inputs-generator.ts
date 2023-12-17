import { DID, Id, getUnixTimestamp } from '@iden3/js-iden3-core';
import { ProofType, W3CCredential } from '../verifiable';
import { ZeroKnowledgeProofRequest } from '../iden3comm';
import {
  AtomicQueryMTPV2Inputs,
  AtomicQueryMTPV2OnChainInputs,
  AtomicQuerySigV2Inputs,
  AtomicQuerySigV2OnChainInputs,
  AtomicQueryV3Inputs,
  AtomicQueryV3OnChainInputs,
  CircuitId,
  Query
} from '../circuits';
import {
  PreparedCredential,
  newCircuitClaimData,
  prepareAuthBJJCredential,
  toClaimNonRevStatus,
  toGISTProof
} from './common';
import { IIdentityWallet } from '../identity';
import { IStateStorage } from '../storage';
import { ICredentialWallet } from '../credentials';

export type DIDProfileMetadata = {
  authProfileNonce: number;
  credentialSubjectProfileNonce: number;
};

export type ProofGenerationOptions = {
  skipRevocation: boolean;
  challenge?: bigint;
  credential?: W3CCredential;
  verifierDID?: DID;
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
  [CircuitId.AuthV2]: { maxQueriesCount: 1 },
  [CircuitId.StateTransition]: { maxQueriesCount: 1 }
};

export class InputGenerator {
  constructor(
    private readonly _identityWallet: IIdentityWallet,
    private readonly _credentialWallet: ICredentialWallet,
    private readonly _stateStorage: IStateStorage
  ) {}

  async generateInputs(ctx: InputContext): Promise<Uint8Array> {
    const { circuitId } = ctx.proofReq;
    const fnName = `${circuitId}PrepareInputs`;

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

  private credentialAtomicQueryMTPV2PrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await newCircuitClaimData(preparedCredential);
    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const circuitInputs = new AtomicQueryMTPV2Inputs();
    circuitInputs.id = DID.idFromDID(identifier);
    circuitInputs.requestID = BigInt(proofReq.id);

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

    return circuitInputs.inputsMarshal();
  };

  private credentialAtomicQueryMTPV2OnChainPrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await newCircuitClaimData(preparedCredential);

    const authInfo = await prepareAuthBJJCredential(
      this._credentialWallet,
      this._identityWallet,
      identifier
    );

    const authRevStatus = await this._credentialWallet.getRevocationStatusFromCredential(
      authInfo.authCredential
    );

    const authClaimData = await newCircuitClaimData({
      credential: authInfo.authCredential,
      credentialCoreClaim: authInfo.authCoreClaim,
      revStatus: authRevStatus
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
      authInfo.authCredential
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

    return circuitInputs.inputsMarshal();
  };

  private credentialAtomicQuerySigV2PrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await newCircuitClaimData(preparedCredential);

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
    return circuitInputs.inputsMarshal();
  };

  private credentialAtomicQuerySigV2OnChainPrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await newCircuitClaimData(preparedCredential);

    const authPrepared = await prepareAuthBJJCredential(
      this._credentialWallet,
      this._identityWallet,
      identifier
    );

    const authRevStatus = await this._credentialWallet.getRevocationStatusFromCredential(
      authPrepared.authCredential
    );
    const authClaimData = await newCircuitClaimData({
      credential: authPrepared.authCredential,
      credentialCoreClaim: authPrepared.authCoreClaim,
      revStatus: authRevStatus
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

    return circuitInputs.inputsMarshal();
  };

  private credentialAtomicQueryV3PrepareInputs = async ({
    preparedCredential,
    identifier,
    proofReq,
    params,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await newCircuitClaimData(preparedCredential);

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
    circuitInputs.nullifierSessionID = proofReq.params?.nullifierSessionId
      ? BigInt(proofReq.params?.nullifierSessionID?.toString())
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
    const circuitClaimData = await newCircuitClaimData(preparedCredential);

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
    const authPrepared = await prepareAuthBJJCredential(
      this._credentialWallet,
      this._identityWallet,
      genesisDID
    );
    const id = DID.idFromDID(genesisDID);
    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());
    const gistProof = toGISTProof(stateProof);
    circuitInputs.gistProof = gistProof;
    // auth inputs
    if (circuitInputs.authEnabled === 1) {
      const authRevStatus = await this._credentialWallet.getRevocationStatusFromCredential(
        authPrepared.authCredential
      );

      const authClaimData = await newCircuitClaimData({
        credential: authPrepared.authCredential,
        credentialCoreClaim: authPrepared.authCoreClaim,
        revStatus: authRevStatus
      });

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
    return circuitInputs.inputsMarshal();
  };
}
