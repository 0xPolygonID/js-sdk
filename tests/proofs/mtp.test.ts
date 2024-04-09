/* eslint-disable no-console */
import {
  CredentialStorage,
  FSCircuitStorage,
  Identity,
  IdentityStorage,
  IdentityWallet,
  Profile,
  byteEncoder
} from '../../src';
import { BjjProvider, KMS, KmsKeyType } from '../../src/kms';
import { InMemoryPrivateKeyStore } from '../../src/kms/store';
import { ICircuitStorage, IDataStorage, IStateStorage } from '../../src/storage/interfaces';
import { InMemoryDataSource, InMemoryMerkleTreeStorage } from '../../src/storage/memory';
import { CredentialRequest, CredentialWallet } from '../../src/credentials';
import { ProofService } from '../../src/proof';
import { CircuitId } from '../../src/circuits';
import { ethers } from 'ethers';
import { EthStateStorage } from '../../src/storage/blockchain/state';
import { RootInfo, StateProof } from '../../src/storage/entities/state';
import path from 'path';
import { CredentialStatusType, VerifiableConstants, W3CCredential } from '../../src/verifiable';
import { ZeroKnowledgeProofRequest, ZeroKnowledgeProofResponse } from '../../src/iden3comm';
import { expect } from 'chai';
import { CredentialStatusResolverRegistry } from '../../src/credentials';
import { RHSResolver } from '../../src/credentials';
import { SEED_USER, createIdentity } from '../helpers';

describe('mtp proofs', () => {
  let idWallet: IdentityWallet;
  let credWallet: CredentialWallet;

  let dataStorage: IDataStorage;
  let proofService: ProofService;
  let circuitStorage: ICircuitStorage;

  const rhsUrl = process.env.RHS_URL as string;
  const walletKey = process.env.WALLET_KEY as string;

  const mockStateStorage: IStateStorage = {
    getLatestStateById: async () => {
      return {
        id: 25191641634853875207018381290409317860151551336133597267061715643603096065n,
        state: 5224437024673068498206105743424598123651101873588696368477339341771571761791n,
        replacedByState: 0n,
        createdAtTimestamp: 1672245326n,
        replacedAtTimestamp: 0n,
        createdAtBlock: 30258020n,
        replacedAtBlock: 0n
      };
    },
    getStateInfoByIdAndState: async () => {
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

    circuitStorage = new FSCircuitStorage({
      dirname: path.join(__dirname, './testdata')
    });

    /*
    To use ethereum storage 

    const conf = defaultEthConnectionConfig;
    conf.url = infuraUrl; 
    conf.contractAddress = '0xf6781AD281d9892Df285cf86dF4F6eBec2042d71';
    ethStorage = new EthStateStorage(conf);
    dataStorage.states = ethStorage;

    */
    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states)
    );
    credWallet = new CredentialWallet(dataStorage, resolvers);
    idWallet = new IdentityWallet(kms, dataStorage, credWallet);

    proofService = new ProofService(idWallet, credWallet, circuitStorage, mockStateStorage);
  });

  it('mtpv2-non-merklized', async () => {
    await nonMerklizedTest(CircuitId.AtomicQueryMTPV2);
  });

  const nonMerklizedTest = async (circuitId: CircuitId) => {
    const { did: userDID } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet);
    await credWallet.save(issuerAuthCredential);

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/kyc-nonmerklized.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        nonce: 1000,
        id: rhsUrl
      }
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const res = await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    // publish to rhs

    await idWallet.publishStateToRHS(issuerDID, rhsUrl);

    // you must store stat info (e.g. state and it's roots)

    const ethSigner = new ethers.Wallet(
      walletKey,
      (dataStorage.states as EthStateStorage).provider
    );
    const txId = await proofService.transitState(
      issuerDID,
      res.oldTreeState,
      true,
      dataStorage.states,
      ethSigner
    );

    const credsWithIden3MTPProof = await idWallet.generateIden3SparseMerkleTreeProof(
      issuerDID,
      res.credentials,
      txId
    );

    await credWallet.saveAll(credsWithIden3MTPProof);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId: circuitId,
      optional: false,
      query: {
        allowedIssuers: ['*'],
        type: claimReq.type,
        context:
          'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
        credentialSubject: {
          documentType: {
            $eq: 99
          }
        }
      }
    };

    const creds = await credWallet.findByQuery(proofReq.query);
    expect(creds.length).to.not.equal(0);

    const { proof, pub_signals, vp } = await proofService.generateProof(proofReq, userDID);
    expect(vp).to.be.undefined;

    const isValid = await proofService.verifyProof({ proof, pub_signals }, circuitId);
    expect(isValid).to.be.true;
  };

  it('mtpv2-merklized', async () => {
    await merklizedTest(CircuitId.AtomicQueryMTPV2);
  });

  const merklizedTest = async (circuitId: CircuitId) => {
    const seedPhraseIssuer: Uint8Array = byteEncoder.encode('seedseedseedseedseedseedseedsnew');

    const { did: userDID } = await createIdentity(idWallet, {
      seed: SEED_USER
    });

    const { did: issuerDID, credential: issuerAuthCredential } = await createIdentity(idWallet, {
      seed: seedPhraseIssuer
    });
    await credWallet.save(issuerAuthCredential);

    const claimReq: CredentialRequest = {
      credentialSchema:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json',
      type: 'KYCAgeCredential',
      credentialSubject: {
        id: userDID.string(),
        birthday: 19960424,
        documentType: 99
      },
      expiration: 2793526400,
      revocationOpts: {
        type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
        nonce: 1000,
        id: rhsUrl
      }
    };

    const issuerCred = await idWallet.issueCredential(issuerDID, claimReq);

    await credWallet.save(issuerCred);

    const res = await idWallet.addCredentialsToMerkleTree([issuerCred], issuerDID);

    await idWallet.publishStateToRHS(issuerDID, rhsUrl);

    // you must store stat info (e.g. state and it's roots)

    const ethSigner = new ethers.Wallet(
      walletKey,
      (dataStorage.states as EthStateStorage).provider
    );

    const txId = await proofService.transitState(
      issuerDID,
      res.oldTreeState,
      true,
      dataStorage.states,
      ethSigner
    );

    const credsWithIden3MTPProof = await idWallet.generateIden3SparseMerkleTreeProof(
      issuerDID,
      res.credentials,
      txId
    );

    await credWallet.saveAll(credsWithIden3MTPProof);

    const proofReq: ZeroKnowledgeProofRequest = {
      id: 1,
      circuitId,
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

    const { proof, pub_signals, vp } = await proofService.generateProof(proofReq, userDID, {
      credential: credsForMyUserDID[0],
      skipRevocation: false
    });
    expect(vp).to.be.undefined;

    const isValid = await proofService.verifyProof({ proof, pub_signals }, circuitId);
    expect(isValid).to.be.true;
  };

  it('mtpv3-non-merklized', async () => {
    await nonMerklizedTest(CircuitId.AtomicQueryV3);
  });

  it('mtpv3-merklized', async () => {
    await merklizedTest(CircuitId.AtomicQueryV3);
  });

  it('should not throw when resolving not latest state', async () => {
    const mockStateStorage = {
      getStateInfoByIdAndState: async () => {
        return {
          id: 25198543381200665770805816046271594885604002445105767653616878167826895617n,
          state: 5224437024673068498206105743424598123651101873588696368477339341771571761791n,
          replacedByState: 0n,
          createdAtTimestamp: 1672245326n,
          replacedAtTimestamp: 1672246326n,
          createdAtBlock: 30258020n,
          replacedAtBlock: 0n
        };
      }
    } as unknown as IStateStorage;
    const proofService = new ProofService(idWallet, credWallet, circuitStorage, mockStateStorage);
    const response: ZeroKnowledgeProofResponse = JSON.parse(
      `{"id":1,"circuitId":"credentialAtomicQuerySigV2","proof":{"pi_a":["1692621919535462098029340422338985117387349922432058572912503289494740072544","5849832527522776520992910317111843161659287939749030678875104723725167741629","1"],"pi_b":[["9073804311318969142382194823200861430394532493054777280144376515679156840294","320345546718280141355625312977249941988595053000873620335373153762333347618"],["21818506300133624706104504788964095807930130277005378306774974876198233822873","20508916211207310005669939018224159176090237395847319407804660514445244746059"],["1","0"]],"pi_c":["75773990211509807568779994083842535776985171363939633486110559284258142402","21708643189390101987073995679050930953292947427942962697950732212904750632605","1"],"protocol":"groth16","curve":"bn128"},"pub_signals":["0","21575127216236248869702276246037557119007466180301957762196593786733007617","4487386332479489158003597844990487984925471813907462483907054425759564175341","1","25198543381200665770805816046271594885604002445105767653616878167826895617","1","4487386332479489158003597844990487984925471813907462483907054425759564175341","1712671029","198285726510688200335207273836123338699","1","0","3","1","99","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"]}`
    );
    const query = {
      allowedIssuers: ['*'],
      type: 'KYCAgeCredential',
      context:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-nonmerklized.jsonld',
      credentialSubject: {
        documentType: {
          $eq: 99
        }
      }
    };
    const sender = 'did:iden3:polygon:amoy:x7Z95VkUuyo6mqraJw2VGwCfqTzdqhM1RVjRHzcpK';
    await expect(proofService.verifyZKPResponse(response, { query, sender })).to.be.rejectedWith(
      'issuer state is outdated'
    );
  });
});
