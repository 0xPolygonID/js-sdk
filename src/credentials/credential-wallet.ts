import { buildDIDType, BytesHelper, DID, Id } from '@iden3/js-iden3-core';

import axios from 'axios';
import { IDataStorage } from '../storage/interfaces';
import {
  W3CCredential,
  ProofQuery,
  VerifiableConstants,
  SubjectPosition,
  MerklizedRootPosition,
  CredentialStatus,
  RHSCredentialStatus,
  RevocationStatus,
  CredentialStatusType,
  IssuerData
} from './../verifiable';

import { Schema } from '../schema-processor';
import * as uuid from 'uuid';
import { getStatusFromRHS } from './revocation';
import { Proof } from '@iden3/js-merkletree';

export interface ClaimRequest {
  credentialSchema: string;
  type: string;
  credentialSubject: { [key: string]: string | object | number };
  expiration?: number;
  version?: number;
  revNonce?: number;
  subjectPosition?: SubjectPosition;
  merklizedRootPosition?: MerklizedRootPosition;
}

export interface ICredentialWallet {
  list(): Promise<W3CCredential[]>;
  save(credential: W3CCredential): Promise<void>;
  saveAll(credential: W3CCredential[]): Promise<void>;
  remove(id: string): Promise<void>;
  findByQuery(query: ProofQuery): Promise<W3CCredential[]>;
  findById(id: string): Promise<W3CCredential | undefined>;
  findByContextType(context: string, type: string): Promise<W3CCredential[]>;

  getAuthBJJCredential(did: DID): Promise<W3CCredential>;
  getRevocationStatusFromCredential(cred: W3CCredential): Promise<RevocationStatus>;
  getRevocationStatus(
    credStatus: CredentialStatus | RHSCredentialStatus,
    issuerDID: DID,
    issuerData: IssuerData
  ): Promise<RevocationStatus>;
  createCredential(
    hostUrl: string,
    issuer: DID,
    request: ClaimRequest,
    schema: Schema,
    rhsUrl?: string
  ): W3CCredential;
}

export class CredentialWallet implements ICredentialWallet {
  constructor(private readonly _storage: IDataStorage) {}

  async getAuthBJJCredential(did: DID): Promise<W3CCredential> {
    // filter where issuer of auth credential is current did

    const authBJJCredsOfIssuer = await this._storage.credential.findCredentialsByQuery({
      context: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_SCHEMA_JSONLD_URL,
      type: VerifiableConstants.AUTH.AUTH_BJJ_CREDENTIAL_TYPE,
      allowedIssuers: [did.toString()]
    });

    if (!authBJJCredsOfIssuer.length) {
      throw new Error('no auth credentials found');
    }

    for (let index = 0; index < authBJJCredsOfIssuer.length; index++) {
      const authCred = authBJJCredsOfIssuer[index];
      const revocationStatus = await this.getRevocationStatusFromCredential(authCred);

      if (!revocationStatus.mtp.existence) {
        return authCred;
      }
    }
    throw new Error('all auth bjj credentials are revoked');
  }

  async getRevocationStatusFromCredential(cred: W3CCredential): Promise<RevocationStatus> {
    const mtpProof = cred.getIden3SparseMerkleTreeProof();
    const sigProof = cred.getBJJSignature2021Proof();

    const issuerData: IssuerData | undefined = mtpProof ? mtpProof.issuerData : sigProof.issuerData;
    if (!issuerData) {
      throw new Error('no sig / mtp proof to check issuer info');
    }
    const issuerDID = DID.parse(cred.issuer);

    return await this.getRevocationStatus(cred.credentialStatus, issuerDID, issuerData);
  }

  async getRevocationStatus(
    credStatus: CredentialStatus | RHSCredentialStatus,
    issuerDID: DID,
    issuerData: IssuerData
  ): Promise<RevocationStatus> {
    if (credStatus.type === CredentialStatusType.SparseMerkleTreeProof) {
      return (await axios.get<RevocationStatus>(credStatus.id)).data;
    }

    if (credStatus.type === CredentialStatusType.Iden3ReverseSparseMerkleTreeProof) {
      try {
        return await getStatusFromRHS(issuerDID, credStatus, this._storage.states);
      } catch (e) {
        const errMsg = e['reason'] ?? e.message;
        if (
          errMsg.includes(VerifiableConstants.ERRORS.IDENENTITY_DOES_NOT_EXIST) &&
          isIssuerGenesis(issuerDID.toString(), issuerData.state.value)
        ) {
          return {
            mtp: new Proof(),
            issuer: {
              state: issuerData.state.value,
              revocationTreeRoot: issuerData.state.revocationTreeRoot,
              rootOfRoots: issuerData.state.rootOfRoots,
              claimsTreeRoot: issuerData.state.claimsTreeRoot
            }
          };
        }

        const status = credStatus as RHSCredentialStatus;
        if (status?.statusIssuer?.type === CredentialStatusType.SparseMerkleTreeProof) {
          return (await axios.get<RevocationStatus>(credStatus.id)).data;
        }
        throw new Error(`can't fetch revocation status`);
      }
    }
    throw new Error('revocation status unknown');
  }

  createCredential = (
    hostUrl: string,
    issuer: DID,
    request: ClaimRequest,
    schema: Schema,
    rhsUrl?: string
  ): W3CCredential => {
    const context = [
      VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018,
      VerifiableConstants.JSONLD_SCHEMA.IDEN3_CREDENTIAL,
      schema.$metadata.uris['jsonLdContext']
    ];
    const credentialType = [VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE, request.type];

    const expirationDate =
      !request.expiration || request.expiration == 0 ? null : request.expiration;

    const issuerDID = issuer.toString();
    const credentialSubject = request.credentialSubject;
    credentialSubject['type'] = request.type;

    const cr = new W3CCredential();
    cr.id = `${hostUrl}/${uuid.v4()}`;
    cr['@context'] = context;
    cr.type = credentialType;
    cr.expirationDate = expirationDate ? new Date(expirationDate * 1000).toISOString() : undefined;
    cr.issuanceDate = new Date().toISOString();
    cr.credentialSubject = credentialSubject;
    cr.issuer = issuerDID.toString();
    cr.credentialSchema = {
      id: request.credentialSchema,
      type: VerifiableConstants.JSON_SCHEMA_VALIDATOR
    };

    if (rhsUrl) {
      cr.credentialStatus = {
        id: `${rhsUrl}`,
        revocationNonce: request.revNonce,
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof
      };
    } else {
      cr.credentialStatus = {
        id: `${hostUrl}/revocation/${request.revNonce}`,
        revocationNonce: request.revNonce,
        type: CredentialStatusType.SparseMerkleTreeProof
      };
    }

    return cr;
  };

  async findById(id: string): Promise<W3CCredential | undefined> {
    return this._storage.credential.findCredentialById(id);
  }

  async findByContextType(context: string, type: string): Promise<W3CCredential[]> {
    return this._storage.credential.findCredentialsByQuery({ context, type });
  }

  async save(credential: W3CCredential): Promise<void> {
    return this._storage.credential.saveCredential(credential);
  }

  async saveAll(credentials: W3CCredential[]): Promise<void> {
    return this._storage.credential.saveAllCredentials(credentials);
  }

  async remove(id): Promise<void> {
    return this._storage.credential.removeCredential(id);
  }

  async list(): Promise<W3CCredential[]> {
    return this._storage.credential.listCredentials();
  }

  async findByQuery(query: ProofQuery): Promise<W3CCredential[]> {
    return this._storage.credential.findCredentialsByQuery(query);
  }
}

export function isIssuerGenesis(issuer: string, state: string): boolean {
  const did = DID.parse(issuer);
  const arr = BytesHelper.hexToBytes(state);
  const stateBigInt = BytesHelper.bytesToInt(arr);
  const type = buildDIDType(did.method, did.blockchain, did.networkId);
  return isGenesisStateId(did.id.bigInt(), stateBigInt, type);
}

export function isGenesisStateId(id: bigint, state: bigint, type: Uint8Array): boolean {
  const idFromState = Id.idGenesisFromIdenState(type, state);
  return id.toString() === idFromState.bigInt().toString();
}
