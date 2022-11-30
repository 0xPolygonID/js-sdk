import { Claim, Id, SchemaHash, ClaimOptions, ElemBytes, Constants } from '@iden3/js-iden3-core';
import {
  Hash,
  hashElems,
  str2Bytes,
  ZERO_HASH,
  Merkletree,
  InMemoryDB,
  Proof
} from '@iden3/js-merkletree';
import { Hex, poseidon, PrivateKey, Signature } from '@iden3/js-crypto';

export function authClaimFromPubKey(x: bigint, y: bigint): Claim {
  const schemaHash = new SchemaHash(Hex.decodeString('ca938857241db9451ea329256b9c06e5'));
  // NOTE: We take nonce as hash of public key to make it random
  // We don't use random number here because this test vectors will be used for tests
  // and have randomization inside tests is usually a bad idea

  const revNonce = poseidon.hash([x]);
  return Claim.newClaim(
    schemaHash,
    ClaimOptions.withIndexDataInts(x, y),
    ClaimOptions.withRevocationNonce(Number(revNonce))
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

async function generate(privKeyHex: string): Promise<{
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

  claimsTree.add(indexHash, valueHash);

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
