import {
    CircuitStorage,
    CredentialStorage,
    Identity,
    IdentityStorage,
    IdentityWallet,
    Profile
  } from '../../src';
  import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
  import { InMemoryPrivateKeyStore } from '../../src/kms/store';
  import { IDataStorage, IStateStorage } from '../../src/storage/interfaces';
  import { InMemoryDataSource, InMemoryMerkleTreeStorage } from '../../src/storage/memory';
  import { CredentialRequest, CredentialWallet } from '../../src/credentials';
  import { ProofService } from '../../src/proof';
  import { CircuitId } from '../../src/circuits';
  import { FSKeyLoader } from '../../src/loaders';
  import { CredentialStatusType, VerifiableConstants, W3CCredential } from '../../src/verifiable';
  import { RootInfo, StateProof } from '../../src/storage/entities/state';
  import path from 'path';
  import { byteEncoder } from '../../src';
  import { ZeroKnowledgeProofRequest } from '../../src/iden3comm';
  import { CircuitData } from '../../src/storage/entities/circuitData';
  import { Blockchain, DidMethod, NetworkId } from '@iden3/js-iden3-core';
  import { expect } from 'chai';
  import { checkVerifiablePresentation } from './common';
  
  describe('sig onchain proofs', () => {
    let idWallet: IdentityWallet;
    let credWallet: CredentialWallet;
  
    let dataStorage: IDataStorage;
    let proofService: ProofService;
    const rhsUrl = process.env.RHS_URL as string;
  
    const mockStateStorage: IStateStorage = {
      getLatestStateById: async () => {
        throw new Error(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST);
      },
      publishState: async () => {
        return '0xc837f95c984892dbcc3ac41812ecb145fedc26d7003202c50e1b87e226a9b33c';
      },
      getGISTProof: (): Promise<StateProof> => {
        return Promise.resolve({
          root: 0n,
          existence: false,
          siblings: [],
          index: 0n,
          value: 0n,
          auxExistence: false,
          auxIndex: 0n,
          auxValue: 0n
        });
      },
      getGISTRootInfo: (): Promise<RootInfo> => {
        return Promise.resolve({
          root: 0n,
          replacedByRoot: 0n,
          createdAtTimestamp: 0n,
          replacedAtTimestamp: 0n,
          createdAtBlock: 0n,
          replacedAtBlock: 0n
        });
      }
    };
  
    beforeEach(async () => {
      const memoryKeyStore = new InMemoryPrivateKeyStore();
      const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
      const kms = new KMS();
      kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);
  
      dataStorage = {
        credential: new CredentialStorage(new InMemoryDataSource<W3CCredential>()),
        identity: new IdentityStorage(
          new InMemoryDataSource<Identity>(),
          new InMemoryDataSource<Profile>()
        ),
        mt: new InMemoryMerkleTreeStorage(40),
        states: mockStateStorage
      };
  
      const circuitStorage = new CircuitStorage(new InMemoryDataSource<CircuitData>());
  
      const loader = new FSKeyLoader(path.join(__dirname, './testdata'));
  
      await circuitStorage.saveCircuitData(CircuitId.AuthV2, {
        circuitId: CircuitId.AuthV2,
        wasm: await loader.load(`${CircuitId.AuthV2.toString()}/circuit.wasm`),
        provingKey: await loader.load(`${CircuitId.AuthV2.toString()}/circuit_final.zkey`),
        verificationKey: await loader.load(`${CircuitId.AuthV2.toString()}/verification_key.json`)
      });
  
      await circuitStorage.saveCircuitData(CircuitId.AtomicQuerySigV2OnChain, {
        circuitId: CircuitId.AtomicQuerySigV2OnChain,
        wasm: await loader.load(`${CircuitId.AtomicQuerySigV2OnChain.toString()}/circuit.wasm`),
        provingKey: await loader.load(`${CircuitId.AtomicQuerySigV2OnChain.toString()}/circuit_final.zkey`),
        verificationKey: await loader.load(
          `${CircuitId.AtomicQuerySigV2OnChain.toString()}/verification_key.json`
        )
      });
  
      await circuitStorage.saveCircuitData(CircuitId.StateTransition, {
        circuitId: CircuitId.StateTransition,
        wasm: await loader.load(`${CircuitId.StateTransition.toString()}/circuit.wasm`),
        provingKey: await loader.load(`${CircuitId.StateTransition.toString()}/circuit_final.zkey`),
        verificationKey: await loader.load(
          `${CircuitId.AtomicQueryMTPV2.toString()}/verification_key.json`
        )
      });
  
      credWallet = new CredentialWallet(dataStorage);
      idWallet = new IdentityWallet(kms, dataStorage, credWallet);
  
      proofService = new ProofService(idWallet, credWallet, circuitStorage, mockStateStorage);
    });
  
    it('sigv2-onchain-merklized', async () => {
      const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedseed');
      const seedPhrase: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseeduser');
  
      const { did: userDID } = await idWallet.createIdentity({
        method: DidMethod.Iden3,
        blockchain: Blockchain.Polygon,
        networkId: NetworkId.Mumbai,
        seed: seedPhrase,
        revocationOpts: {
          type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
          id: rhsUrl
        }
      });
  
      const { did: issuerDID } = await idWallet.createIdentity({
        method: DidMethod.Iden3,
        blockchain: Blockchain.Polygon,
        networkId: NetworkId.Mumbai,
        seed: seedPhraseIssuer,
        revocationOpts: {
          type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
          id: rhsUrl
        }
      });
      const claimReq: CredentialRequest = {
        credentialSchema:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
        type: 'KYCAgeCredential',
        credentialSubject: {
          id: userDID.toString(),
          birthday: 19960424,
          documentType: 99
        },
        expiration: 1693526400,
        revocationOpts: {
          type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
          id: rhsUrl
        }
      };
      const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);
  
      await credWallet.save(issuerCred);
  
      const proofReq: ZeroKnowledgeProofRequest = {
        id: 1,
        circuitId: CircuitId.AtomicQuerySigV2OnChain,
        optional: false,
        query: {
          allowedIssuers: ['*'],
          type: claimReq.type,
          context:
            'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
          credentialSubject: {
            documentType: {
              $eq: 99
            }
          }
        }
      };
  
      const creds = await credWallet.findByQuery(proofReq.query);
      expect(creds.length).to.not.equal(0);
  
      const credsForMyUserDID = await credWallet.filterByCredentialSubject(creds, userDID);
      expect(creds.length).to.equal(1);
  
      const { proof, vp } = await proofService.generateProof(proofReq, userDID, credsForMyUserDID[0]);
      console.log(proof);
  
      expect(vp).to.be.undefined;
  
      await checkVerifiablePresentation(
        claimReq.type,
        userDID,
        credsForMyUserDID[0],
        proofService,
        CircuitId.AtomicQuerySigV2OnChain
      );
    });
  });
  