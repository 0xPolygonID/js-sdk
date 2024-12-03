import { Claim, DID, Id } from '@iden3/js-iden3-core';
import { NonMerklizedIssuerBase__factory } from '@iden3/onchain-non-merklized-issuer-base-abi';
import { NonMerklizedIssuerBase } from '@iden3/onchain-non-merklized-issuer-base-abi';
import { INonMerklizedIssuer } from '@iden3/onchain-non-merklized-issuer-base-abi';
import {
  CredentialStatusType,
  DisplayMethod,
  DisplayMethodType,
  Iden3SparseMerkleTreeProof,
  W3CCredential
} from '../../../../../../verifiable';
import { Merklizer, Path } from '@iden3/js-jsonld-merklization';
import { XSDNS } from '../../../../../../circuits';
import { Hash, Proof } from '@iden3/js-merkletree';
import { JsonDocumentObject } from '../../../../../../iden3comm';
import { ethers } from 'ethers';
import { getDateFromUnixTimestamp } from '@iden3/js-iden3-core';
import { Options } from '@iden3/js-jsonld-merklization';
import { EthConnectionConfig } from '../../../../state';

enum NonMerklizedIssuerInterfaces {
  InterfaceDetection = '0x01ffc9a7',
  InterfaceNonMerklizedIssuer = '0x58874949',
  InterfaceGetCredential = '0x5d1ca631'
}

enum ValueHashes {
  BooleanTrue = '18586133768512220936620570745912940619677854269274689475585506675881198879027',
  BooleanFalse = '19014214495641488759237505126948346942972912379615652741039992445865937985820'
}

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
   * @param ethConnectionConfig The configuration for the Ethereum connection.
   * @param issuerDid The decentralized identifier (DID) of the issuer.
   * @param merklizationOptions Optional settings for merklization.
   */
  constructor(
    ethConnectionConfig: EthConnectionConfig,
    issuerDid: DID,
    options?: {
      merklizationOptions?: Options;
    }
  ) {
    if (!ethConnectionConfig.chainId) {
      throw new Error('Chain ID is required');
    }
    this._chainId = ethConnectionConfig.chainId;

    this._contractAddress = ethers.getAddress(
      ethers.hexlify(Id.ethAddressFromId(DID.idFromDID(issuerDid)))
    );
    this._contract = NonMerklizedIssuerBase__factory.connect(
      this._contractAddress,
      new ethers.JsonRpcProvider(ethConnectionConfig.url)
    );

    this._issuerDid = issuerDid;
    this._merklizationOptions = options?.merklizationOptions;
  }

  /**
   * Checks if the contract supports required interfaces.
   * Throws an error if any required interface is unsupported.
   *
   * @throws Error - If required interfaces are not supported.
   */
  public async isInterfaceSupported() {
    const supportedInterfaces = [
      {
        name: 'Interface detection ERC-165',
        value: NonMerklizedIssuerInterfaces.InterfaceDetection
      },
      {
        name: 'Interface non-merklized issuer',
        value: NonMerklizedIssuerInterfaces.InterfaceNonMerklizedIssuer
      },
      {
        name: 'Interface get credential',
        value: NonMerklizedIssuerInterfaces.InterfaceGetCredential
      }
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
   * Retrieves the credential IDs of a user.
   * @param userId The user's core.Id.
   * @returns An array of credential IDs.
   */
  public async getUserCredentialsIds(userId: Id): Promise<bigint[]> {
    return this._contract.getUserCredentialIds(userId.bigInt());
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

    const credentialSubject = await this.convertCredentialSubject(
      c,
      credentialData.context,
      credentialData._type,
      credentialSubjectFields
    );

    const credentialRequest = {
      id: this.credentialId(credentialData.id),
      credentialSchema: credentialData.credentialSchema.id,
      type: credentialData._type,
      credentialSubject: credentialSubject,
      expiration: c.getExpirationDate()?.getTime(),
      displayMethod: this.convertDisplayMethod(credentialData.displayMethod),
      context: credentialData.context,
      revocationOpts: {
        id: this._contractAddress,
        nonce: Number(c.getRevocationNonce()),
        type: CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023
      },
      issuanceDate: getDateFromUnixTimestamp(Number(credentialData.issuanceDate)).getTime()
    };

    const existenceProof = await this.existenceProof(c);
    const w3c = W3CCredential.fromCredentialRequest(this._issuerDid, credentialRequest);
    w3c.proof = [existenceProof];
    return w3c;
  }

  private credentialId(id: bigint): string {
    return `urn:iden3:onchain:${this._chainId}:${this._contractAddress}:${id}`;
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
            case ValueHashes.BooleanTrue:
              credentialSubject[f.key] = true;
              break;
            case ValueHashes.BooleanFalse:
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
    if (!onchainDisplayMethod.id || !onchainDisplayMethod._type) {
      return undefined;
    }
    switch (onchainDisplayMethod._type) {
      case DisplayMethodType.Iden3BasicDisplayMethodV1: {
        return {
          id: onchainDisplayMethod.id,
          type: DisplayMethodType.Iden3BasicDisplayMethodV1
        };
      }
      default: {
        throw new Error(`Unsupported display method type ${onchainDisplayMethod._type}`);
      }
    }
  }
}
