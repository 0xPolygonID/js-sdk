import { Hex, Poseidon, Signature } from '@iden3/js-crypto';
import { BytesHelper, Claim, DID, getUnixTimestamp, MerklizedRootPosition } from '@iden3/js-iden3-core';
import { newHashFromString } from '@iden3/js-merkletree';
import { AtomicQueryMTPV2Inputs, AtomicQueryMTPV2OnChainInputs, AtomicQuerySigV2Inputs, AtomicQuerySigV2OnChainInputs, AuthV2Inputs, CircuitClaim, CircuitId, Query, QueryOperators, StateTransitionInputs, strMTHex, ValueProof } from '../circuits';
import { createVerifiablePresentation, ProofType, verifiablePresentationFromCred } from '../verifiable';
import { toClaimNonRevStatus, toGISTProof } from './common';
import { NativeProver } from './prover';
import { Merklizer, Path, getDocumentLoader } from '@iden3/js-jsonld-merklization';
import { Parser } from '../schema-processor';
import { byteEncoder } from '../utils/encoding';
/**
 * Proof service is an implementation of IProofService
 * that works with a native groth16 prover
 *
 * @public
 * @class ProofService
 * @implements implements IProofService interface
 */
export class ProofService {
    /**
     * Creates an instance of ProofService.
     * @param {IIdentityWallet} _identityWallet - identity wallet
     * @param {ICredentialWallet} _credentialWallet - credential wallet
     * @param {ICircuitStorage} _circuitStorage - circuit storage to load proving / verification files
     * @param {IStateStorage} _stateStorage - state storage to get GIST proof / publish state
     */
    constructor(_identityWallet, _credentialWallet, _circuitStorage, _stateStorage, opts) {
        this._identityWallet = _identityWallet;
        this._credentialWallet = _credentialWallet;
        this._stateStorage = _stateStorage;
        this._prover = new NativeProver(_circuitStorage);
        this._ldLoader = getDocumentLoader(opts);
    }
    /** {@inheritdoc IProofService.verifyProof} */
    async verifyProof(zkp, circuitId) {
        return this._prover.verify(zkp, circuitId);
    }
    /** {@inheritdoc IProofService.generateProof} */
    async generateProof(proofReq, identifier, opts) {
        if (!opts) {
            opts = {
                skipRevocation: false,
                challenge: 0n
            };
        }
        // find credential
        const credential = opts.credential ?? (await this.findCredential(identifier, proofReq.query));
        const { nonce: authProfileNonce, genesisDID } = await this._identityWallet.getGenesisDIDMetadata(identifier);
        const preparedCredential = await this.getPreparedCredential(credential);
        const subjectDID = DID.parse(preparedCredential.credential.credentialSubject['id']);
        const { nonce: credentialSubjectProfileNonce, genesisDID: subjectGenesisDID } = await this._identityWallet.getGenesisDIDMetadata(subjectDID);
        if (subjectGenesisDID.string() !== genesisDID.string()) {
            throw new Error('subject and auth profiles are not derived from the same did');
        }
        const { inputs, vp } = await this.generateInputs(preparedCredential, genesisDID, proofReq, {
            ...opts,
            authProfileNonce,
            credentialSubjectProfileNonce
        });
        const { proof, pub_signals } = await this._prover.generate(inputs, proofReq.circuitId);
        return {
            id: proofReq.id,
            circuitId: proofReq.circuitId,
            vp,
            proof,
            pub_signals
        };
    }
    /** {@inheritdoc IProofService.transitState} */
    async transitState(did, oldTreeState, isOldStateGenesis, stateStorage, ethSigner) {
        const authInfo = await this.prepareAuthBJJCredential(did, oldTreeState);
        const newTreeModel = await this._identityWallet.getDIDTreeModel(did);
        const claimsRoot = await newTreeModel.claimsTree.root();
        const rootOfRoots = await newTreeModel.rootsTree.root();
        const revocationRoot = await newTreeModel.revocationTree.root();
        const newTreeState = {
            revocationRoot,
            claimsRoot,
            state: newTreeModel.state,
            rootOfRoots
        };
        const challenge = Poseidon.hash([oldTreeState.state.bigInt(), newTreeState.state.bigInt()]);
        const signature = await this._identityWallet.signChallenge(challenge, authInfo.authCredential);
        const circuitInputs = new StateTransitionInputs();
        circuitInputs.id = DID.idFromDID(did);
        circuitInputs.signature = signature;
        circuitInputs.isOldStateGenesis = isOldStateGenesis;
        const authClaimIncProofNewState = await this._identityWallet.generateCredentialMtp(did, authInfo.authCredential, newTreeState);
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
    async getPreparedCredential(credential) {
        const revStatus = await this._credentialWallet.getRevocationStatusFromCredential(credential);
        const credCoreClaim = await this._identityWallet.getCoreClaimFromCredential(credential);
        return { credential, revStatus, credentialCoreClaim: credCoreClaim };
    }
    async prepareAuthBJJCredential(did, treeStateInfo) {
        const authCredential = await this._credentialWallet.getAuthBJJCredential(did);
        const incProof = await this._identityWallet.generateCredentialMtp(did, authCredential, treeStateInfo);
        const nonRevProof = await this._identityWallet.generateNonRevocationMtp(did, authCredential, treeStateInfo);
        const authCoreClaim = authCredential.getCoreClaimFromProof(ProofType.Iden3SparseMerkleTreeProof);
        if (!authCoreClaim) {
            throw new Error('auth core claim is not defined for auth bjj credential');
        }
        return { authCredential, incProof, nonRevProof, authCoreClaim };
    }
    async generateInputs(preparedCredential, identifier, proofReq, params) {
        let generateInputFn;
        switch (proofReq.circuitId) {
            case CircuitId.AtomicQueryMTPV2:
                generateInputFn = this.generateMTPV2Inputs.bind(this);
                break;
            case CircuitId.AtomicQueryMTPV2OnChain:
                generateInputFn = this.generateMTPV2OnChainInputs.bind(this);
                break;
            case CircuitId.AtomicQuerySigV2:
                generateInputFn = this.generateQuerySigV2Inputs.bind(this);
                break;
            case CircuitId.AtomicQuerySigV2OnChain:
                generateInputFn = this.generateQuerySigV2OnChainInputs.bind(this);
                break;
            default:
                throw new Error(`circuit with id ${proofReq.circuitId} is not supported by issuer`);
        }
        return generateInputFn(preparedCredential, identifier, proofReq, params);
    }
    async generateMTPV2Inputs(preparedCredential, identifier, proofReq, params) {
        const circuitClaimData = await this.newCircuitClaimData(preparedCredential.credential, preparedCredential.credentialCoreClaim);
        circuitClaimData.nonRevProof = toClaimNonRevStatus(preparedCredential.revStatus);
        const circuitInputs = new AtomicQueryMTPV2Inputs();
        circuitInputs.id = DID.idFromDID(identifier);
        circuitInputs.requestID = BigInt(proofReq.id);
        const { query, vp } = await this.toCircuitsQuery(proofReq.query, preparedCredential.credential, preparedCredential.credentialCoreClaim, { documentLoader: this._ldLoader });
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
        return { inputs: circuitInputs.inputsMarshal(), vp };
    }
    async generateMTPV2OnChainInputs(preparedCredential, identifier, proofReq, params) {
        const circuitClaimData = await this.newCircuitClaimData(preparedCredential.credential, preparedCredential.credentialCoreClaim);
        const authPrepared = await this.prepareAuthBJJCredential(identifier);
        const authClaimData = await this.newCircuitClaimData(authPrepared.authCredential, authPrepared.authCoreClaim);
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
        circuitInputs.authClaimNonRevMtp = authPrepared.nonRevProof.proof;
        if (!params.challenge) {
            throw new Error('challenge must be provided for onchain circuits');
        }
        const signature = await this._identityWallet.signChallenge(params.challenge, authPrepared.authCredential);
        circuitInputs.signature = signature;
        circuitInputs.challenge = params.challenge;
        const { query, vp } = await this.toCircuitsQuery(proofReq.query, preparedCredential.credential, preparedCredential.credentialCoreClaim, { documentLoader: this._ldLoader });
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
        return { inputs: circuitInputs.inputsMarshal(), vp };
    }
    async generateQuerySigV2Inputs(preparedCredential, identifier, proofReq, params) {
        const circuitClaimData = await this.newCircuitClaimData(preparedCredential.credential, preparedCredential.credentialCoreClaim);
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
        const { query, vp } = await this.toCircuitsQuery(proofReq.query, preparedCredential.credential, preparedCredential.credentialCoreClaim, { documentLoader: this._ldLoader });
        circuitInputs.query = query;
        circuitInputs.currentTimeStamp = getUnixTimestamp(new Date());
        return { inputs: circuitInputs.inputsMarshal(), vp };
    }
    async generateQuerySigV2OnChainInputs(preparedCredential, identifier, proofReq, params) {
        const circuitClaimData = await this.newCircuitClaimData(preparedCredential.credential, preparedCredential.credentialCoreClaim);
        const authPrepared = await this.prepareAuthBJJCredential(identifier);
        const authClaimData = await this.newCircuitClaimData(authPrepared.authCredential, authPrepared.authCoreClaim);
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
        const { query, vp } = await this.toCircuitsQuery(proofReq.query, preparedCredential.credential, preparedCredential.credentialCoreClaim, { documentLoader: this._ldLoader });
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
        circuitInputs.authClaimNonRevMtp = authPrepared.nonRevProof.proof;
        if (!params.challenge) {
            throw new Error('challenge must be provided for onchain circuits');
        }
        const signature = await this._identityWallet.signChallenge(params.challenge, authPrepared.authCredential);
        circuitInputs.signature = signature;
        circuitInputs.challenge = params.challenge;
        return { inputs: circuitInputs.inputsMarshal(), vp };
    }
    // NewCircuitClaimData generates circuits claim structure
    async newCircuitClaimData(credential, coreClaim) {
        const smtProof = credential.getIden3SparseMerkleTreeProof();
        const circuitClaim = new CircuitClaim();
        circuitClaim.claim = coreClaim;
        circuitClaim.issuerId = DID.idFromDID(DID.parse(credential.issuer));
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
            const issuerDID = DID.parse(sigProof.issuerData.id);
            let userDID;
            if (!credential.credentialSubject.id) {
                userDID = issuerDID;
            }
            else {
                if (typeof credential.credentialSubject.id !== 'string') {
                    throw new Error('credential status `id` is not a string');
                }
                userDID = DID.parse(credential.credentialSubject.id);
            }
            let rs;
            if (sigProof.issuerData.credentialStatus) {
                const opts = {
                    issuerData: sigProof.issuerData,
                    issuerDID,
                    userDID
                };
                rs = await this._credentialWallet.getRevocationStatus(sigProof.issuerData.credentialStatus, opts);
            }
            const issuerAuthNonRevProof = {
                treeState: {
                    state: strMTHex(rs?.issuer.state),
                    claimsRoot: strMTHex(rs?.issuer.claimsTreeRoot),
                    revocationRoot: strMTHex(rs?.issuer.revocationTreeRoot),
                    rootOfRoots: strMTHex(rs?.issuer.rootOfRoots)
                },
                proof: rs?.mtp
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
    async toCircuitsQuery(query, credential, coreClaim, opts) {
        const mtPosition = coreClaim.getMerklizedPosition();
        return mtPosition === MerklizedRootPosition.None
            ? this.prepareNonMerklizedQuery(query, credential, opts)
            : this.prepareMerklizedQuery(query, credential, mtPosition, opts);
    }
    async prepareMerklizedQuery(query, credential, merklizedPosition, opts) {
        const parsedQuery = await this.parseRequest(query.credentialSubject);
        const loader = getDocumentLoader(opts);
        let schema;
        try {
            schema = (await loader(credential['@context'][2])).document;
        }
        catch (e) {
            throw new Error(`can't load credential schema ${credential['@context'][2]}`);
        }
        let path = new Path();
        if (parsedQuery.fieldName) {
            path = await Path.getContextPathKey(JSON.stringify(schema), credential.type[1], parsedQuery.fieldName, opts);
        }
        path.prepend(['https://www.w3.org/2018/credentials#credentialSubject']);
        const mk = await credential.merklize(opts);
        const { proof, value: mtValue } = await mk.proof(path);
        const pathKey = await path.mtEntry();
        parsedQuery.query.valueProof = new ValueProof();
        parsedQuery.query.valueProof.mtp = proof;
        parsedQuery.query.valueProof.path = pathKey;
        parsedQuery.query.valueProof.mtp = proof;
        const mtEntry = await mtValue?.mtEntry();
        if (!mtEntry) {
            throw new Error(`can't merklize credential: no merkle tree entry found`);
        }
        parsedQuery.query.valueProof.value = mtEntry;
        // for merklized credentials slotIndex in query must be equal to zero
        // and not a position of merklization root.
        // it has no influence on check in the off-chain circuits, but it aligns with onchain verification standard
        parsedQuery.query.slotIndex = 0;
        if (!parsedQuery.fieldName) {
            const resultQuery = parsedQuery.query;
            resultQuery.operator = QueryOperators.$eq;
            resultQuery.values = [mtEntry];
            return { query: resultQuery };
        }
        if (parsedQuery.isSelectiveDisclosure) {
            const rawValue = mk.rawValue(path);
            const vp = createVerifiablePresentation(query.context ?? '', query.type ?? '', parsedQuery.fieldName, rawValue);
            const resultQuery = parsedQuery.query;
            resultQuery.operator = QueryOperators.$eq;
            resultQuery.values = [mtEntry];
            return { query: resultQuery, vp };
        }
        if (parsedQuery.rawValue === null || parsedQuery.rawValue === undefined) {
            throw new Error('value is not presented in the query');
        }
        const ldType = await mk.jsonLDType(path);
        parsedQuery.query.values = await this.transformQueryValueToBigInts(parsedQuery.rawValue, ldType);
        return { query: parsedQuery.query };
    }
    async prepareNonMerklizedQuery(query, credential, opts) {
        const loader = getDocumentLoader(opts);
        let schema;
        try {
            schema = (await loader(credential.credentialSchema.id)).document;
        }
        catch (e) {
            throw new Error(`can't load credential schema ${credential['@context'][2]}`);
        }
        if (query.credentialSubject && Object.keys(query.credentialSubject).length > 1) {
            throw new Error('multiple requests are not supported');
        }
        const parsedQuery = await this.parseRequest(query.credentialSubject);
        parsedQuery.query.slotIndex = new Parser().getFieldSlotIndex(parsedQuery.fieldName, byteEncoder.encode(JSON.stringify(schema)));
        const { vp, mzValue, dataType } = await verifiablePresentationFromCred(credential, query, parsedQuery.fieldName, opts);
        if (parsedQuery.isSelectiveDisclosure) {
            const resultQuery = parsedQuery.query;
            resultQuery.operator = QueryOperators.$eq;
            resultQuery.values = [await mzValue.mtEntry()];
            return { query: resultQuery, vp };
        }
        if (parsedQuery.rawValue === null || parsedQuery.rawValue === undefined) {
            throw new Error('value is not presented in the query');
        }
        parsedQuery.query.values = await this.transformQueryValueToBigInts(parsedQuery.rawValue, dataType);
        return { query: parsedQuery.query };
    }
    async parseRequest(req) {
        if (!req) {
            const query = new Query();
            query.operator = QueryOperators.$eq;
            return { query, fieldName: '' };
        }
        const entries = Object.entries(req);
        if (entries.length > 1) {
            throw new Error(`multiple requests  not supported`);
        }
        const [fieldName, fieldReq] = entries[0];
        const fieldReqEntries = Object.entries(fieldReq);
        if (fieldReqEntries.length > 1) {
            throw new Error(`multiple predicates for one field not supported`);
        }
        const isSelectiveDisclosure = fieldReqEntries.length === 0;
        const query = new Query();
        if (isSelectiveDisclosure) {
            return { query, fieldName, isSelectiveDisclosure };
        }
        let operator = 0;
        const [key, value] = fieldReqEntries[0];
        if (!QueryOperators[key]) {
            throw new Error(`operator is not supported by lib`);
        }
        operator = QueryOperators[key];
        query.operator = operator;
        return { query, fieldName, rawValue: value };
    }
    async transformQueryValueToBigInts(value, ldType) {
        const values = new Array(64).fill(BigInt(0));
        if (Array.isArray(value)) {
            for (let index = 0; index < value.length; index++) {
                values[index] = await Merklizer.hashValue(ldType, value[index]);
            }
        }
        else {
            values[0] = await Merklizer.hashValue(ldType, value);
        }
        return values;
    }
    /** {@inheritdoc IProofService.generateAuthV2Inputs} */
    async generateAuthV2Inputs(hash, did, circuitId) {
        if (circuitId !== CircuitId.AuthV2) {
            throw new Error('CircuitId is not supported');
        }
        const { nonce: authProfileNonce, genesisDID } = await this._identityWallet.getGenesisDIDMetadata(did);
        //
        // todo: check if bigint is correct
        const challenge = BytesHelper.bytesToInt(hash.reverse());
        const authPrepared = await this.prepareAuthBJJCredential(genesisDID);
        const authClaimData = await this.newCircuitClaimData(authPrepared.authCredential, authPrepared.authCoreClaim);
        const signature = await this._identityWallet.signChallenge(challenge, authPrepared.authCredential);
        const id = DID.idFromDID(genesisDID);
        const stateProof = await this._stateStorage.getGISTProof(id.bigInt());
        const gistProof = toGISTProof(stateProof);
        const authInputs = new AuthV2Inputs();
        authInputs.genesisID = id;
        authInputs.profileNonce = BigInt(authProfileNonce);
        authInputs.authClaim = authClaimData.claim;
        authInputs.authClaimIncMtp = authClaimData.proof;
        authInputs.authClaimNonRevMtp = authPrepared.nonRevProof.proof;
        authInputs.treeState = authClaimData.treeState;
        authInputs.signature = signature;
        authInputs.challenge = challenge;
        authInputs.gistProof = gistProof;
        return authInputs.inputsMarshal();
    }
    async verifyState(circuitId, pubSignals) {
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
    async findCredential(did, query) {
        const credentials = await this._identityWallet.findOwnedCredentialsByDID(did, query);
        if (!credentials.length) {
            throw new Error(`no credentials belong to did ot its profiles`);
        }
        //  For EQ / IN / NIN / LT / GT operations selective if credential satisfies query - we can get any.
        // TODO: choose credential for selective credentials
        const credential = query.skipClaimRevocationCheck
            ? credentials[0]
            : (await this._credentialWallet.findNonRevokedCredential(credentials)).cred;
        return credential;
    }
}
// BJJSignatureFromHexString converts hex to  babyjub.Signature
export const bJJSignatureFromHexString = async (sigHex) => {
    const signatureBytes = Hex.decodeString(sigHex);
    const compressedSig = Uint8Array.from(signatureBytes).slice(0, 64);
    const bjjSig = Signature.newFromCompressed(compressedSig);
    return bjjSig;
};
//# sourceMappingURL=proof-service.js.map