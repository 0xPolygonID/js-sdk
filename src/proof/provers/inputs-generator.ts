import { DID, getUnixTimestamp } from '@iden3/js-iden3-core';
import {
  Iden3SparseMerkleTreeProof,
  ProofType,
  RevocationStatus,
  W3CCredential
} from '../../verifiable';
import { ZeroKnowledgeProofRequest } from '../../iden3comm';
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
  QueryOperators,
  TreeState,
  ValueProof,
  getOperatorNameByValue
} from '../../circuits';
import {
  PreparedAuthBJJCredential,
  PreparedCredential,
  toClaimNonRevStatus,
  toGISTProof
} from '../common';
import { IIdentityWallet } from '../../identity';
import { IStateStorage } from '../../storage';
import {
  CredentialStatusResolveOptions,
  ICredentialWallet,
  getUserDIDFromCredential
} from '../../credentials';
import { isEthereumIdentity } from '../../utils';

export type DIDProfileMetadata = {
  authProfileNonce: number | string;
  credentialSubjectProfileNonce: number | string;
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

const allOperations = Object.values(QueryOperators);
const v2Operations = [
  Operators.NOOP,
  Operators.EQ,
  Operators.LT,
  Operators.GT,
  Operators.IN,
  Operators.NIN,
  Operators.NE
];
const v2OnChainOperations = [
  Operators.EQ,
  Operators.LT,
  Operators.GT,
  Operators.IN,
  Operators.NIN,
  Operators.NE
];

export const circuitValidator: {
  [k in CircuitId]: { maxQueriesCount: number; supportedOperations: Operators[] };
} = {
  [CircuitId.AtomicQueryMTPV2]: { maxQueriesCount: 1, supportedOperations: v2Operations },
  [CircuitId.AtomicQueryMTPV2OnChain]: {
    maxQueriesCount: 1,
    supportedOperations: v2OnChainOperations
  },
  [CircuitId.AtomicQuerySigV2]: { maxQueriesCount: 1, supportedOperations: v2Operations },
  [CircuitId.AtomicQuerySigV2OnChain]: {
    maxQueriesCount: 1,
    supportedOperations: v2OnChainOperations
  },
  [CircuitId.AtomicQueryV3]: { maxQueriesCount: 1, supportedOperations: allOperations },
  [CircuitId.AtomicQueryV3OnChain]: { maxQueriesCount: 1, supportedOperations: allOperations },
  [CircuitId.AuthV2]: { maxQueriesCount: 0, supportedOperations: [] },
  [CircuitId.StateTransition]: { maxQueriesCount: 0, supportedOperations: [] },
  [CircuitId.LinkedMultiQuery10]: { maxQueriesCount: 10, supportedOperations: allOperations }
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
    const { authCredential, incProof, nonRevProof } =
      await this._identityWallet.getActualAuthCredential(did, treeStateInfo);

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
    query.operator = this.transformV2QueryOperator(query.operator);
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

    this.checkOperatorSupport(proofReq.circuitId, query.operator);

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

    this.checkOperatorSupport(proofReq.circuitId, query.operator);

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
    query.operator = this.transformV2QueryOperator(query.operator);
    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());

    this.checkOperatorSupport(proofReq.circuitId, query.operator);

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

    this.checkOperatorSupport(proofReq.circuitId, query.operator);

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
    query.values = [Operators.SD, Operators.NOOP].includes(query.operator) ? [] : query.values;
    query.valueProof = query.operator === Operators.NOOP ? new ValueProof() : query.valueProof;

    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());

    circuitInputs.proofType = proofType;
    circuitInputs.linkNonce = params.linkNonce ?? BigInt(0);
    circuitInputs.verifierID = params.verifierDid ? DID.idFromDID(params.verifierDid) : undefined;
    circuitInputs.nullifierSessionID = proofReq.params?.nullifierSessionId
      ? BigInt(proofReq.params?.nullifierSessionId?.toString())
      : BigInt(0);

    this.checkOperatorSupport(proofReq.circuitId, query.operator);

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
    query.values = [Operators.SD, Operators.NOOP].includes(query.operator) ? [] : query.values;
    query.valueProof = query.operator === Operators.NOOP ? new ValueProof() : query.valueProof;

    circuitInputs.query = query;
    circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());

    circuitInputs.proofType = proofType;
    circuitInputs.linkNonce = params.linkNonce ?? BigInt(0);
    circuitInputs.verifierID = params.verifierDid ? DID.idFromDID(params.verifierDid) : undefined;
    circuitInputs.nullifierSessionID = proofReq.params?.nullifierSessionId
      ? BigInt(proofReq.params?.nullifierSessionId?.toString())
      : BigInt(0);

    const isEthIdentity = isEthereumIdentity(identifier);
    circuitInputs.isBJJAuthEnabled = isEthIdentity ? 0 : 1;

    circuitInputs.challenge = BigInt(params.challenge ?? 0);
    const { nonce: authProfileNonce, genesisDID } =
      await this._identityWallet.getGenesisDIDMetadata(identifier);
    const id = DID.idFromDID(genesisDID);
    const stateProof = await this._stateStorage.getGISTProof(id.bigInt());
    const gistProof = toGISTProof(stateProof);
    circuitInputs.gistProof = gistProof;
    // auth inputs
    if (circuitInputs.isBJJAuthEnabled === 1) {
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

    this.checkOperatorSupport(proofReq.circuitId, query.operator);

    return circuitInputs.inputsMarshal();
  };

  private linkedMultiQuery10PrepareInputs = async ({
    preparedCredential,
    params,
    proofReq,
    circuitQueries
  }: InputContext): Promise<Uint8Array> => {
    const circuitClaimData = await this.newCircuitClaimData(preparedCredential);

    circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
    const circuitInputs = new LinkedMultiQueryInputs();
    circuitInputs.linkNonce = params.linkNonce ?? BigInt(0);

    circuitInputs.claim = circuitClaimData.claim;
    circuitInputs.query = circuitQueries;

    circuitQueries.forEach((query) => {
      this.checkOperatorSupport(proofReq.circuitId, query.operator);
    });

    return circuitInputs.inputsMarshal();
  };

  private transformV2QueryOperator(operator: number): number {
    return operator === Operators.SD || operator === Operators.NOOP ? Operators.EQ : operator;
  }
  private checkOperatorSupport(circuitId: string, operator: number) {
    const supportedOperators = circuitValidator[circuitId as CircuitId].supportedOperations;
    if (!supportedOperators.includes(operator)) {
      throw new Error(
        `operator ${getOperatorNameByValue(operator)} is not supported by ${circuitId}`
      );
    }
  }
}
