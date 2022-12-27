import { MTProof, ValueProof } from './../circuits/models';
import { RHSCredentialStatus, W3CCredential } from '../verifiable/credential';
import { ProofType } from '../verifiable/constants';
import { KMS } from '../kms/kms';

/* eslint-disable no-console */
import { DID, getUnixTimestamp, Claim, MerklizedRootPosition } from '@iden3/js-iden3-core';
import {
  CircuitClaim,
  CircuitId,
  strMTHex,
  Query,
  AtomicQueryMTPV2Inputs,
  AtomicQuerySigV2Inputs,
  AuthV2Inputs,
  QueryOperators,
  Operators,
  StateTransitionInputs
} from '../circuits';
import { RevocationStatus } from '../verifiable/credential';
import { toClaimNonRevStatus } from './common';
import { NativeProver } from './prover';
import { IIdentityWallet } from '../identity';
import { ICredentialWallet } from '../credentials';
import { Hex, Signature } from '@iden3/js-crypto';
import {
  Iden3SparseMerkleTreeProof,
  MerkleTreeProofWithTreeState,
  ProofQuery
} from '../verifiable';

import { UniversalSchemaLoader } from '../loaders';
import { Parser } from '../schema-processor';

import {} from '../schema-processor';
import { getContextPathKey } from '../schema-processor/merklize/merkelizer';
import { ICircuitStorage } from '../storage/interfaces/circuits';

// ErrAllClaimsRevoked all claims are revoked.
const ErrAllClaimsRevoked = 'all claims are revoked';

interface PreparedAuthBJJCredential {
  authCredential: W3CCredential;
  signature: Signature;
  incProof: MerkleTreeProofWithTreeState;
  nonRevProof: MerkleTreeProofWithTreeState;
  authCoreClaim: Claim;
}
interface PreparedCredential {
  credential: W3CCredential;
  credentialCoreClaim: Claim;
  revStatus: RevocationStatus;
}
// ZKPRequest is a request for zkp proof
export interface ZKPRequest {
  id: number;
  circuitId: CircuitId;
  optional?: boolean;
  query: ProofQuery;
}

export interface QueryWithFieldName {
  query: Query;
  fieldName: string;
}
// ZKPResponse is a response with a zkp
export interface ZKPResponse {
  id: number;
  circuitId: string; // `circuitId` compatibility with golang implementation.
  pub_signals: string[];
  proof: ProofData;
}

export interface FullProof {
  pub_signals: string[];
  proof: ProofData;
}

// ProofData is a result of snarkJS groth16 proof generation
export interface ProofData {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol?: string;
  curve?: string;
}

export interface IProofService {
  verifyProof(zkp: FullProof, circuitName: CircuitId): Promise<boolean>;
  generateProof(
    proofReq: ZKPRequest,
    identifier: DID
  ): Promise<{ proof: FullProof; credentials: W3CCredential[] }>;
}

export class ProofService implements IProofService {
  private _prover: NativeProver;
  constructor(
    private readonly _identityWallet: IIdentityWallet,
    private readonly _credentialWallet: ICredentialWallet,
    private readonly _kms: KMS,
    private readonly _circuitStorage: ICircuitStorage
  ) {
    this._prover = new NativeProver(_circuitStorage);
  }

  async verifyProof(zkp: FullProof, circuitId: CircuitId): Promise<boolean> {
    return this._prover.verify(zkp, circuitId);
  }

  async generateProof(
    proofReq: ZKPRequest,
    identifier: DID
  ): Promise<{ proof: FullProof; credentials: W3CCredential[] }> {
    const { inputs, creds } = await this.prepareInputs(identifier, proofReq);

    const proof = await this._prover.generate(inputs, proofReq.circuitId);
    return { proof, credentials: creds };
  }

  private async prepareInputs(
    did: DID,
    proofReq: ZKPRequest
  ): Promise<{ inputs: Uint8Array; creds: W3CCredential[] }> {
    const preparedAuthBJJCredential = await this.prepareAuthBJJCredential(did, proofReq);

    const preparedCredential = await this.prepareCredential(did, proofReq.query);

    const inputs = await this.generateInputs(
      preparedAuthBJJCredential,
      preparedCredential,
      did,
      proofReq
    );
    return { inputs, creds: [preparedCredential.credential] };
  }

  private async prepareCredential(did: DID, query: ProofQuery): Promise<PreparedCredential> {
    let credentials: W3CCredential[] = [];

    if (!!query.claimId) {
      const credential = await this._credentialWallet.findById(query.claimId!);
      if (!credential) {
        throw new Error("claim doesn't exist");
      }
      credentials.push(credential!);
    } else {
      query.credentialSubjectId = did.toString();
      credentials = await this._credentialWallet.findByQuery(query);
    }
    if (credentials.length === 0) {
      throw new Error('could not find claims for query');
    }
    const { cred, revStatus } = await this.findNonRevokedClaim(credentials);

    const credCoreClaim = cred.getCoreClaimFromProof(ProofType.BJJSignature);
    return { credential: cred, revStatus, credentialCoreClaim: credCoreClaim! };
  }

  private async findNonRevokedClaim(creds: W3CCredential[]): Promise<{
    cred: W3CCredential;
    revStatus: RevocationStatus;
  }> {
    for (const cred of creds) {
      const revStatus = await this._credentialWallet.getRevocationStatusFromCredential(cred);
      if (revStatus.mtp.existence) {
        continue;
      }
      return { cred, revStatus };
    }
    throw new Error(ErrAllClaimsRevoked);
  }

  private async prepareAuthBJJCredential(
    did: DID,
    proofReq: ZKPRequest
  ): Promise<PreparedAuthBJJCredential> {
    const authCredential = await this._credentialWallet.getAuthBJJCredential(did);

    const incProof = await this._identityWallet.generateClaimMtp(did, authCredential);

    const nonRevProof = await this._identityWallet.generateNonRevocationMtp(did, authCredential);

    const signature = await this._identityWallet.signChallenge(BigInt(proofReq.id), authCredential);

    const authCoreClaim = authCredential.getCoreClaimFromProof(
      ProofType.Iden3SparseMerkleTreeProof
    );
    if (!authCoreClaim) {
      throw new Error('auth core claim is not defined for auth bjj credential');
    }

    return { authCredential, incProof, nonRevProof, signature, authCoreClaim };
  }

  private async generateInputs(
    preparedAuthCredential: PreparedAuthBJJCredential,
    preparedCredential: PreparedCredential,
    identifier: DID,
    proofReq: ZKPRequest
  ): Promise<Uint8Array> {
    let inputs: Uint8Array;
    if (proofReq.circuitId === CircuitId.AtomicQueryMTPV2) {
      const circuitClaimData = await this.newCircuitClaimData(preparedCredential);

      circuitClaimData.nonRevProof = {
        treeState: {
          state: strMTHex(preparedCredential.revStatus.issuer.state),
          claimsRoot: strMTHex(preparedCredential.revStatus.issuer.claimsTreeRoot),
          revocationRoot: strMTHex(preparedCredential.revStatus.issuer.revocationTreeRoot),
          rootOfRoots: strMTHex(preparedCredential.revStatus.issuer.rootOfRoots)
        },
        proof: preparedCredential.revStatus.mtp
      };

      let circuitInputs = new AtomicQueryMTPV2Inputs();
      circuitInputs.id = identifier.id;
      circuitInputs.requestID = BigInt(proofReq.id);
      circuitInputs.query = await this.toCircuitsQuery(
        proofReq.query,
        preparedCredential.credential,
        preparedCredential.credentialCoreClaim
      );
      circuitInputs.claim = {
        claim: circuitClaimData.claim,
        incProof: { proof: circuitClaimData.proof, treeState: circuitClaimData.treeState },
        nonRevProof: circuitClaimData.nonRevProof
      };
      circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
      circuitInputs.claimSubjectProfileNonce = BigInt(0);
      circuitInputs.profileNonce = BigInt(0);
      circuitInputs.skipClaimRevocationCheck = false;

      inputs = await circuitInputs.inputsMarshal();
    } else if (proofReq.circuitId === CircuitId.AtomicQuerySigV2) {
      const circuitClaimData = await this.newCircuitClaimData(preparedCredential);

      const issuerAuthClaimNonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);

      circuitClaimData.signatureProof.issuerAuthNonRevProof = issuerAuthClaimNonRevProof;

      let circuitInputs = new AtomicQuerySigV2Inputs();
      circuitInputs.id = identifier.id;
      circuitInputs.claim = {
        issuerID: circuitClaimData.issuerId,
        signatureProof: circuitClaimData.signatureProof,
        claim: circuitClaimData.claim,
        nonRevProof:issuerAuthClaimNonRevProof
      };
      circuitInputs.requestID = BigInt(proofReq.id);
      circuitInputs.claimSubjectProfileNonce = BigInt(0);
      circuitInputs.profileNonce = BigInt(0);
      circuitInputs.skipClaimRevocationCheck = false;

      circuitInputs.query = await this.toCircuitsQuery(
        proofReq.query,
        preparedCredential.credential,
        preparedCredential.credentialCoreClaim
      );
      circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
      inputs = await circuitInputs.inputsMarshal();
    } else {
      throw new Error(`circuit with id ${proofReq.circuitId} is not supported by issuer`);
    }

    console.log(new TextDecoder().decode(inputs))
    return inputs;
  }

  // NewCircuitClaimData generates circuits claim structure
  private async newCircuitClaimData(prepareCredential: PreparedCredential): Promise<CircuitClaim> {
    const smtProof: Iden3SparseMerkleTreeProof | undefined =
      prepareCredential.credential.getIden3SparseMerkleTreeProof();

    const circuitClaim = new CircuitClaim();
    circuitClaim.claim = prepareCredential.credentialCoreClaim;
    circuitClaim.issuerId = DID.parse(prepareCredential.credential.issuer).id;

    if (smtProof) {
      circuitClaim.proof = smtProof.mtp;
      circuitClaim.treeState = {
        state: strMTHex(smtProof.issuerData.state?.value),
        claimsRoot: strMTHex(smtProof.issuerData.state?.claimsTreeRoot),
        revocationRoot: strMTHex(smtProof.issuerData.state?.revocationTreeRoot),
        rootOfRoots: strMTHex(smtProof.issuerData.state?.rootOfRoots)
      };
    }

    const sigProof = prepareCredential.credential.getBJJSignature2021Proof();

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

      circuitClaim.signatureProof = {
        signature,
        issuerAuthIncProof: {
          proof: sigProof.issuerData.mtp!,
          treeState: {
            state: strMTHex(sigProof.issuerData.state?.value),
            claimsRoot: strMTHex(sigProof.issuerData.state?.claimsTreeRoot),
            revocationRoot: strMTHex(sigProof.issuerData.state?.revocationTreeRoot),
            rootOfRoots: strMTHex(sigProof.issuerData.state?.rootOfRoots)
          }
        },
        issuerAuthClaim: new Claim().fromHex(sigProof.issuerData.authCoreClaim!),
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
    const parsedQuery = await this.parseRequest(query.req);

    const loader = new UniversalSchemaLoader('ipfs.io');
    const schema = await loader.load(credential['@context'][2]);

    const path = await getContextPathKey(
      new TextDecoder().decode(schema),
      credential.type[1],
      parsedQuery.fieldName
    );
    path.prepend(['https://www.w3.org/2018/credentials#credentialSubject']);

    const mk = await credential.merklize();
    const { proof, value } = await mk.proof(path);

    const pathKey = await path.mtEntry();
    parsedQuery.query.valueProof = new ValueProof();
    parsedQuery.query.valueProof.mtp = proof;
    parsedQuery.query.valueProof.path = pathKey;
    parsedQuery.query.valueProof.mtp = proof;
    parsedQuery.query.valueProof.value = BigInt(value.toString());


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

    if (Object.keys(query.req!).length > 1) {
      throw new Error('mulptiple requets are not suppored');
    }

    const parsedQuery = await this.parseRequest(query.req);

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

    let operator: number = 0;
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
}
// BJJSignatureFromHexString converts hex to  babyjub.Signature
export const bJJSignatureFromHexString = async (sigHex: string): Promise<Signature> => {
  const signatureBytes = Hex.decodeString(sigHex);
  const compressedSig = Uint8Array.from(signatureBytes).slice(0, 64);
  const bjjSig = Signature.newFromCompressed(compressedSig);
  return bjjSig as Signature;
};
