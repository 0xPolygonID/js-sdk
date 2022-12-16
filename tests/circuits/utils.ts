import { merkelizeJSONLD, Merkelizer } from './../../src/schema-processor/merklize/merkelizer';
import {
  Claim,
  Id,
  SchemaHash,
  ClaimOptions,
  ElemBytes,
  Constants,
  NetworkId,
  DidMethod,
  Blockchain,
  buildDIDType,
  idenState,
  getDateFromUnixTimestamp
} from '@iden3/js-iden3-core';
import {
  Hash,
  hashElems,
  str2Bytes,
  ZERO_HASH,
  Merkletree,
  InMemoryDB,
  Proof,
  newHashFromBigInt,
  newHashFromString
} from '@iden3/js-merkletree';
import { Hex, poseidon, PrivateKey, Signature } from '@iden3/js-crypto';
import { TreeState } from '../../src/circuits';

const TestClaimDocument = `{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/citizenship/v1",
    "https://w3id.org/security/bbs/v1"
  ],
  "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
  "type": ["VerifiableCredential", "PermanentResidentCard"],
  "issuer": "did:example:489398593",
  "identifier": 83627465,
  "name": "Permanent Resident Card",
  "description": "Government of Example Permanent Resident Card.",
  "issuanceDate": "2019-12-03T12:19:52Z",
  "expirationDate": "2029-12-03T12:19:52Z",
  "credentialSubject": {
    "id": "did:example:b34ca6cd37bbf23",
    "type": ["PermanentResident", "Person"],
    "givenName": "JOHN",
    "familyName": "SMITH",
    "gender": "Male",
    "image": "data:image/png;base64,iVBORw0KGgokJggg==",
    "residentSince": "2015-01-01",
    "lprCategory": "C09",
    "lprNumber": "999-999-999",
    "commuterClassification": "C1",
    "birthCountry": "Bahamas",
    "birthDate": "1958-07-17"
  }
}`;

export function authClaimFromPubKey(x: bigint, y: bigint): Claim {
  const schemaHash = new SchemaHash(Hex.decodeString('ca938857241db9451ea329256b9c06e5'));
  // NOTE: We take nonce as hash of public key to make it random
  // We don't use random number here because this test vectors will be used for tests
  // and have randomization inside tests is usually a bad idea

  const revNonce = poseidon.hash([x]);
  return Claim.newClaim(
    schemaHash,
    ClaimOptions.withIndexDataInts(x, y),
    ClaimOptions.withRevocationNonce(revNonce)
  );
}

export function authV2ClaimFromPubKey(x: bigint, y: bigint): Claim {
  const schemaHash = new SchemaHash(Hex.decodeString('013fd3f623559d850fb5b02ff012d0e2'));

  // NOTE: We take nonce as hash of public key to make it random
  // We don't use random number here because this test vectors will be used for tests
  // and have randomization inside tests is usually a bad idea
  const revNonce = poseidon.hash([x]);
  return Claim.newClaim(
    schemaHash,
    ClaimOptions.withIndexDataInts(x, y),
    ClaimOptions.withRevocationNonce(revNonce)
  );
}

export function claimsIndexValueHashes(c: Claim): { indexHash: bigint; valueHash: bigint } {
  const { index, value } = c.rawSlots();
  const indexHash = poseidon.hash(ElemBytes.elemBytesToInts(index));

  const valueHash = poseidon.hash(ElemBytes.elemBytesToInts(value));
  return { indexHash, valueHash };
}

/*
This method is to generate auth claim, identity, all its trees, state
and sign a challenge with the claim private key.
*/
export async function authClaimFullInfo(
  privKeyHex: string,
  challenge: bigint
): Promise<{
  id: Id;
  claim: Claim;
  state: Hash;
  claimsTree: Merkletree;
  revTree: Merkletree;
  rootsTree: Merkletree;
  claimEntryMTP: Proof;
  claimNonRevMTP: Proof;
  challengeSignature: Signature;
}> {
  const data = await generate(privKeyHex);

  //Proof claim exists
  const { indexHash } = await claimsIndexValueHashes(data.authClaim);
  const claimEntryMTP = await data.claimsTree.generateProof(indexHash, data.claimsTree.root);

  //Proof claim not revoked
  const revNonce = data.authClaim.getRevocationNonce();
  const revNonceInt = BigInt(revNonce);
  const claimNonRevMTP = await data.revTree.generateProof(revNonceInt, data.revTree.root);

  //Calculate state
  const state = await calcStateFromRoots(data.claimsTree, data.revTree, data.rootsTree);

  //Calculate signature
  const challengeSignature = await data.privateKey.signPoseidon(challenge);

  return {
    id: data.identity,
    claim: data.authClaim,
    state,
    claimsTree: data.claimsTree,
    revTree: data.revTree,
    rootsTree: data.rootsTree,
    claimEntryMTP: claimEntryMTP.proof,
    claimNonRevMTP: claimNonRevMTP.proof,
    challengeSignature
  };
}

export async function generate(privKeyHex: string): Promise<{
  identity: Id;
  claimsTree: Merkletree;
  revTree: Merkletree;
  rootsTree: Merkletree;
  authClaim: Claim;
  privateKey: PrivateKey;
}> {
  // extract pubKey
  const privateKey: PrivateKey = new PrivateKey(Hex.decodeString(privKeyHex));
  const pubKey = privateKey.public();
  const x = pubKey.p[0];
  const y = pubKey.p[1];

  // init claims tree
  const claimsTree = new Merkletree(new InMemoryDB(str2Bytes('')), true, 40);
  // create auth claim
  const authClaim = authClaimFromPubKey(x, y);

  // add auth claim to claimsMT
  const { indexHash, valueHash } = claimsIndexValueHashes(authClaim);
  await claimsTree.add(indexHash, valueHash);

  const state = poseidon.hash([claimsTree.root.bigInt(), BigInt(0), BigInt(0)]);
  // create new identity
  const identity = Id.idGenesisFromIdenState(Constants.ID.TYPE_DEFAULT, state);

  const revTree = new Merkletree(new InMemoryDB(str2Bytes('')), true, 40);
  const rootsTree = new Merkletree(new InMemoryDB(str2Bytes('')), true, 40);

  return { identity, claimsTree, revTree, rootsTree, authClaim, privateKey };
}

async function calcStateFromRoots(claimsTree: Merkletree, ...args: Merkletree[]): Promise<Hash> {
  let revTreeRoot = ZERO_HASH.bigInt();
  let rootsTreeRoot = ZERO_HASH.bigInt();
  if (args.length > 0) {
    revTreeRoot = args[0].root.bigInt();
  }
  if (args.length > 0) {
    rootsTreeRoot = args[1].root.bigInt();
  }
  const state = await hashElems([claimsTree.root.bigInt(), revTreeRoot, rootsTreeRoot]);
  return state;
}

export class IdentityTest {
  id: Id;
  clt: Merkletree;
  ret: Merkletree;
  rot: Merkletree;
  authClaim: Claim;
  pk: PrivateKey;

  /**
   *
   */
  constructor(privKHex: string) {
    this.pk = new PrivateKey(Hex.decodeString(privKHex));
  }

  async addClaim(claim: Claim) {
    // add claim to claimsMT
    const { hi, hv } = claim.hiHv();
    await this.clt.add(hi, hv);
  }

  async claimMTPRaw(claim: Claim): Promise<{ proof: Proof; value: bigint }> {
    const { hi } = claim.hiHv();
    return await this.clt.generateProof(hi, ZERO_HASH);
  }

  async claimRevMTPRaw(claim: Claim): Promise<{ proof: Proof; value: bigint }> {
    const revNonce = claim.getRevocationNonce();
    return await this.ret.generateProof(revNonce, ZERO_HASH);
  }

  signClaim(claim: Claim): Signature {
    const { hi, hv } = claim.hiHv();

    const commonHash = poseidon.hash([hi, hv]);

    return this.pk.signPoseidon(commonHash);
  }

  signBJJ(int: bigint): Signature {
    return this.pk.signPoseidon(int);
  }

  static async newIdentity(privKHex: string): Promise<IdentityTest> {
    const it = new IdentityTest(privKHex);
    // init claims tree
    it.clt = new Merkletree(new InMemoryDB(str2Bytes('')), true, 32);
    it.ret = new Merkletree(new InMemoryDB(str2Bytes('')), true, 32);
    it.rot = new Merkletree(new InMemoryDB(str2Bytes('')), true, 32);

    // extract pubKey
    const { key, x, y } = extractPubXY(privKHex);

    // create auth claim
    const authClaim = authV2ClaimFromPubKey(x, y);
    it.authClaim = authClaim;

    // add auth claim to claimsMT
    const { hi, hv } = authClaim.hiHv();

    await it.clt.add(hi, hv);

    const state = it.state();

    it.id = idFromState(state.bigInt());

    return it;
  }

  state(): Hash {
    const state = idenState(this.clt.root.bigInt(), this.ret.root.bigInt(), this.rot.root.bigInt());
    const hash = newHashFromBigInt(state);
    return hash;
  }
}

export function extractPubXY(privKHex: string): { key: PrivateKey; x: bigint; y: bigint } {
  const k = new PrivateKey(Hex.decodeString(privKHex));
  const pk = k.public();
  return { key: k, x: pk.p[0], y: pk.p[1] };
}

export function idFromState(state: bigint): Id {
  const typ = buildDIDType(DidMethod.Iden3, Blockchain.NoChain, NetworkId.NoNetwork);
  // create new identity
  return Id.idGenesisFromIdenState(typ, state);
}

export async function defaultJSONUserClaim(subject: Id): Promise<{ mz: Merkelizer; claim: Claim }> {
  const mz = await merkelizeJSONLD(TestClaimDocument);

  const schemaHash = new SchemaHash(Hex.decodeString('ce6bb12c96bfd1544c02c289c6b4b987'));
  const nonce = BigInt(10);

  const claim = Claim.newClaim(
    schemaHash,
    ClaimOptions.withIndexId(subject),
    ClaimOptions.withExpirationDate(getDateFromUnixTimestamp(1669884010)), //Thu Dec 01 2022 08:40:10 GMT+0000
    ClaimOptions.withRevocationNonce(nonce),
    ClaimOptions.withIndexMerklizedRoot(mz.root().bigInt())
  );

  return { mz, claim };
}

export const getTreeState = (it: IdentityTest): TreeState => ({
  state: it.state(),
  claimsRoot: it.clt.root,
  revocationRoot: it.ret.root,
  rootOfRoots: it.rot.root
});

export const userPK = '28156abe7fe2fd433dc9df969286b96666489bac508612d0e16593e944c4f69f';
export const issuerPK = '21a5e7321d0e2f3ca1cc6504396e6594a2211544b08c206847cdee96f832421a';
export const timestamp = 1642074362;

export function defaultUserClaim(subject: Id): Claim {
  const dataSlotA = ElemBytes.fromInt(BigInt(10));
  const nonce = BigInt(1);
  const schemaHash = new SchemaHash(Hex.decodeString('ce6bb12c96bfd1544c02c289c6b4b987'));
  const claim = Claim.newClaim(
    schemaHash,
    ClaimOptions.withIndexId(subject),
    ClaimOptions.withIndexData(dataSlotA, new ElemBytes()),
    ClaimOptions.withExpirationDate(getDateFromUnixTimestamp(1669884010)), //Thu Dec 01 2022 08:40:10 GMT+0000
    ClaimOptions.withRevocationNonce(nonce)
  );

  return claim;
}

export function prepareIntArray(arr: bigint[], length: number): bigint[] {
  // Add the rest of empty levels to the array
  for (let i = arr.length; i < length; i++) {
    arr.push(BigInt(0));
  }
  return arr;
}

export function mtHashFromStr(hashStr: string): Hash {
  return newHashFromString(hashStr);
}

export const JSONSerializer = (key, value) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (value instanceof Id) {
    return value.bigInt().toString();
  }
  if (value instanceof SchemaHash) {
    return value.bigInt().toString();
  }
  return value;
};

export const globalTree = () => new Merkletree(new InMemoryDB(str2Bytes('')), true, 32);
