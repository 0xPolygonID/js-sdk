import { Claim, DID, Id } from '@iden3/js-iden3-core';
import { NonMerklizedIssuerBase__factory } from './types/factories/NonMerklizedIssuerBase__factory';
import { NonMerklizedIssuerBase } from './types/NonMerklizedIssuerBase';
import { INonMerklizedIssuer } from './types/NonMerklizedIssuerBase';
import {
  CredentialStatus,
  CredentialStatusType,
  DisplayMethod,
  DisplayMethodType,
  Iden3SparseMerkleTreeProof,
  VerifiableConstants,
  W3CCredential
} from '../../../verifiable';
import { Merklizer, Path } from '@iden3/js-jsonld-merklization';
import { XSDNS } from '../../../circuits';
import { Hash, Proof } from '@iden3/js-merkletree';
import { JsonDocumentObject } from '../../../iden3comm';
import { ethers } from 'ethers';
import { getDateFromUnixTimestamp } from '@iden3/js-iden3-core';
import { Options } from '@iden3/js-jsonld-merklization';

const interfaceDetection = '0x01ffc9a7';
const interfaceNonMerklizedIssuer = '0x58874949';
const interfaceGetCredential = '0x5d1ca631';

const booleanHashTrue =
  '18586133768512220936620570745912940619677854269274689475585506675881198879027';
const booleanHashFalse =
  '19014214495641488759237505126948346942972912379615652741039992445865937985820';

/**
 * `OnchainNonMerklizedIssuerAdapter` provides functionality to interact with a non-merklized on-chain credential issuer.
 * This adapter enables interface detection, credential retrieval, and conversion to the W3C Verifiable Credential format.
 *
 * @public
 * @beta
 * @class OnchainNonMerklizedIssuerAdapter
 */
export class OnchainNonMerklizedIssuerAdapter {
  private readonly _contract: NonMerklizedIssuerBase;
  private readonly _contractAddress: string;
  private readonly _chainId: number;

  private readonly _issuerDid: DID;

  private readonly _merklizationOptions?: Options;

  /**
   * Initializes an instance of `OnchainNonMerklizedIssuerAdapter`.
   *
   * @param url The URL of the blockchain RPC provider.
   * @param contractAddress The contract address of the non-merklized issuer.
   * @param chainId The chain ID of the blockchain network.
   * @param issuerDid The decentralized identifier (DID) of the issuer.
   * @param merklizationOptions Optional settings for merklization.
   */
  constructor(
    url: string,
    contractAddress: string,
    chainId: number,
    issuerDid: DID,
    merklizationOptions?: Options
  ) {
    const rpcProvider = new ethers.JsonRpcProvider(url);
    this._contract = NonMerklizedIssuerBase__factory.connect(contractAddress, rpcProvider);
    this._contractAddress = contractAddress;
    this._chainId = chainId;
    this._issuerDid = issuerDid;
    this._merklizationOptions = merklizationOptions;
  }

  /**
   * Checks if the contract supports required interfaces.
   * Throws an error if any required interface is unsupported.
   *
   * @throws Error - If required interfaces are not supported.
   */
  public async isSupportsInterface() {
    const supportedInterfaces = [
      { name: 'Interface detection ERC-165', value: interfaceDetection },
      { name: 'Interface non-merklized issuer', value: interfaceNonMerklizedIssuer },
      { name: 'Interface get credential', value: interfaceGetCredential }
    ];

    const unsupportedInterfaces = await Promise.all(
      supportedInterfaces.map(async (interfaceObj) => {
        const isSupported = await this._contract.supportsInterface(interfaceObj.value);
        return isSupported ? null : interfaceObj.name;
      })
    );

    const unsupportedInterfacesFiltered = unsupportedInterfaces.filter(
      (interfaceName) => interfaceName !== null
    );

    if (unsupportedInterfacesFiltered.length > 0) {
      throw new Error(`Unsupported interfaces: ${unsupportedInterfacesFiltered.join(', ')}`);
    }
  }

  /**
   * Retrieves a credential from the on-chain non-merklized contract.
   * @param userId The user's core.Id.
   * @param credentialId The unique identifier of the credential.
   */
  public async getCredential(
    userId: Id,
    credentialId: bigint
  ): Promise<{
    credentialData: INonMerklizedIssuer.CredentialDataStructOutput;
    coreClaimBigInts: bigint[];
    credentialSubjectFields: INonMerklizedIssuer.SubjectFieldStructOutput[];
  }> {
    const [credentialData, coreClaimBigInts, credentialSubjectFields] =
      await this._contract.getCredential(userId.bigInt(), credentialId);
    return { credentialData, coreClaimBigInts, credentialSubjectFields };
  }

  /**
   * Converts on-chain credential to a verifiable credential.
   *
   * @param credentialData Data structure of the credential from the contract.
   * @param coreClaimBigInts Claim data in bigint format.
   * @param credentialSubjectFields Subject fields of the credential.
   */
  public async convertOnChainInfoToW3CCredential(
    credentialData: INonMerklizedIssuer.CredentialDataStructOutput,
    coreClaimBigInts: bigint[],
    credentialSubjectFields: INonMerklizedIssuer.SubjectFieldStructOutput[]
  ): Promise<W3CCredential> {
    const c = new Claim().unMarshalJson(JSON.stringify(coreClaimBigInts.map((b) => b.toString())));

    const context = [
      VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018,
      VerifiableConstants.JSONLD_SCHEMA.IDEN3_CREDENTIAL,
      ...credentialData.context
    ];
    const credentialSubject = await this.convertCredentialSubject(
      c,
      credentialData.context,
      credentialData._type,
      credentialSubjectFields
    );
    const existenceProof = await this.existenceProof(c);
    const credentialStatus = this.credentialStatus(Number(c.getRevocationNonce()));

    const w3c = new W3CCredential();
    w3c.id = this.credentialId(credentialData.id);
    w3c['@context'] = context;
    w3c.credentialSubject = credentialSubject;
    w3c.credentialStatus = credentialStatus;
    w3c.issuer = this._issuerDid.string();
    w3c.credentialSchema = {
      id: credentialData.credentialSchema.id,
      type: credentialData.credentialSchema._type
    };
    w3c.proof = [existenceProof];
    w3c.type = [
      VerifiableConstants.CREDENTIAL_TYPE.W3C_VERIFIABLE_CREDENTIAL,
      credentialData._type
    ];
    w3c.issuanceDate = getDateFromUnixTimestamp(Number(credentialData.issuanceDate)).toISOString();
    w3c.expirationDate = c.getExpirationDate()?.toISOString();
    w3c.displayMethod = this.convertDisplayMethod(credentialData.displayMethod);

    return w3c;
  }

  private credentialId(id: bigint): string {
    return `urn:iden3:onchain:${this._chainId}:${this._contractAddress}:${id}`;
  }

  private credentialStatus(nonce: number): CredentialStatus {
    const id = `${this._issuerDid.string()}/credentialStatus?revocationNonce=${nonce}&contractAddress=${
      this._chainId
    }:${this._contractAddress}`;
    return {
      id: id,
      type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
      revocationNonce: nonce
    };
  }

  private async convertCredentialSubject(
    coreClaim: Claim,
    contractContexts: string[],
    credentialType: string,
    credentialSubjectFields: INonMerklizedIssuer.SubjectFieldStructOutput[]
  ): Promise<JsonDocumentObject> {
    const contractContextsStr = JSON.stringify({
      '@context': contractContexts
    });

    const credentialSubject = {} as JsonDocumentObject;
    for (const f of credentialSubjectFields) {
      const dataType = await Path.newTypeFromContext(
        contractContextsStr,
        `${credentialType}.${f.key}`,
        this._merklizationOptions
      );
      switch (dataType) {
        case XSDNS.Boolean: {
          switch (f.rawValue.toString()) {
            case booleanHashTrue:
              credentialSubject[f.key] = true;
              break;
            case booleanHashFalse:
              credentialSubject[f.key] = false;
              break;
          }
          break;
        }
        case (XSDNS.NonNegativeInteger,
        XSDNS.NonPositiveInteger,
        XSDNS.NegativeInteger,
        XSDNS.PositiveInteger): {
          credentialSubject[f.key] = f.value.toString();
          break;
        }
        case XSDNS.Integer: {
          credentialSubject[f.key] = Number(f.value);
          break;
        }
        case XSDNS.String: {
          this.validateSourceValue(dataType, f.value, f.rawValue);
          credentialSubject[f.key] = f.rawValue;
          break;
        }
        case XSDNS.DateTime: {
          const timestamp = BigInt(f.rawValue);
          const sourceTimestamp = getDateFromUnixTimestamp(Number(timestamp)).toISOString();
          this.validateSourceValue(dataType, f.value, sourceTimestamp);
          credentialSubject[f.key] = sourceTimestamp;
          break;
        }
        case XSDNS.Double: {
          const rawFloat = Number(f.rawValue);
          this.validateSourceValue(dataType, f.value, rawFloat);
          credentialSubject[f.key] = rawFloat;
          break;
        }
        default: {
          throw new Error(`Unsupported data type ${dataType}`);
        }
      }
    }
    credentialSubject['type'] = credentialType;

    const subjectId = coreClaim.getId();
    const subjectDid = DID.parseFromId(subjectId);
    credentialSubject['id'] = subjectDid.string();

    return credentialSubject;
  }

  private async existenceProof(coreClaim: Claim): Promise<Iden3SparseMerkleTreeProof> {
    const [mtpProof, stateInfo] = await this._contract.getClaimProofWithStateInfo(
      coreClaim.hIndex()
    );
    if (!mtpProof.existence) {
      throw new Error('Claim does not exist');
    }
    const latestStateHash = Hash.fromBigInt(stateInfo.state);
    const latestClaimsOfRootHash = Hash.fromBigInt(stateInfo.claimsRoot);
    const latestRevocationOfRootHash = Hash.fromBigInt(stateInfo.revocationsRoot);
    const latestRootsOfRootHash = Hash.fromBigInt(stateInfo.rootsRoot);

    const p = new Proof({
      siblings: mtpProof.siblings.map((s) => Hash.fromBigInt(s)),
      existence: mtpProof.existence,
      nodeAux: mtpProof.auxExistence
        ? {
            key: Hash.fromBigInt(mtpProof.auxIndex),
            value: Hash.fromBigInt(mtpProof.auxValue)
          }
        : undefined
    });

    return new Iden3SparseMerkleTreeProof({
      issuerData: {
        id: this._issuerDid,
        state: {
          value: latestStateHash,
          claimsTreeRoot: latestClaimsOfRootHash,
          revocationTreeRoot: latestRevocationOfRootHash,
          rootOfRoots: latestRootsOfRootHash
        }
      },
      mtp: p,
      coreClaim: coreClaim
    });
  }

  private async validateSourceValue(dataType: string, originHash: bigint, source: unknown) {
    const sourceHash = await Merklizer.hashValue(dataType, source);
    if (sourceHash !== originHash) {
      throw new Error(`Invalid source value for ${dataType} type`);
    }
  }

  private convertDisplayMethod(
    onchainDisplayMethod: INonMerklizedIssuer.DisplayMethodStructOutput
  ): DisplayMethod | undefined {
    if (onchainDisplayMethod.id === '' && onchainDisplayMethod._type === '') {
      return undefined;
    }
    switch (onchainDisplayMethod._type) {
      case DisplayMethodType.Iden3BasicDisplayMethodV1: {
        return {
          id: onchainDisplayMethod.id,
          type: DisplayMethodType.Iden3BasicDisplayMethodV1
        };
      }
    }
  }
}
