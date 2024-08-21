import { Hex } from '@iden3/js-crypto';
import { Id, buildDIDType, genesisFromEthAddress, DID } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';
import { DIDResolutionResult, VerificationMethod } from 'did-resolver';
import { keccak256 } from 'js-sha3';
import { hexToBytes } from './encoding';
import { GlobalStateUpdate, IdentityStateUpdate } from '../storage';

/**
 * Checks if state is genesis state
 *
 * @param {DID} did - did
 * @param {bigint|string} state  - hash on bigInt or hex string format
 * @returns boolean
 */
export function isGenesisState(did: DID, state: bigint | string): boolean {
  if (typeof state === 'string') {
    state = Hash.fromHex(state).bigInt();
  }
  const id = DID.idFromDID(did);
  const { method, blockchain, networkId } = DID.decodePartsFromId(id);
  const type = buildDIDType(method, blockchain, networkId);
  const idFromState = Id.idGenesisFromIdenState(type, state);

  return id.bigInt().toString() === idFromState.bigInt().toString();
}

/**
 * Checks if DID is an ethereum identity
 *
 * @param {DID} did - did
 * @returns boolean
 */
export function isEthereumIdentity(did: DID): boolean {
  const issuerId = DID.idFromDID(did);
  try {
    Id.ethAddressFromId(issuerId);
    // is an ethereum identity
    return true;
  } catch {
    // not an ethereum identity (BabyJubJub or other)
    return false;
  }
}

export const buildVerifierId = (
  address: string,
  info: { method: string; blockchain: string; networkId: string }
): Id => {
  address = address.replace('0x', '');
  const ethAddrBytes = Hex.decodeString(address);
  const ethAddr = ethAddrBytes.slice(0, 20);
  const genesis = genesisFromEthAddress(ethAddr);

  const tp = buildDIDType(info.method, info.blockchain, info.networkId);

  return new Id(tp, genesis);
};

export const validateDIDDocumentAuth = async (did: DID, resolverURL: string, state: Hash) => {
  const vm = await resolveDIDDocumentAuth(did, resolverURL, state);
  if (!vm) {
    throw new Error(`can't resolve DID document`);
  }
  // published or genesis
  if (
    !(vm as VerificationMethod & { published: string }).published &&
    !isGenesisState(did, state.bigInt())
  ) {
    throw new Error(`issuer state not published and not genesis`);
  }
};

export const resolveDIDDocumentAuth = async (
  did: DID,
  resolveURL: string,
  state?: Hash
): Promise<VerificationMethod | undefined> => {
  let url = `${resolveURL}/${did.string().replace(/:/g, '%3A')}`;
  if (state) {
    url += `?state=${state.hex()}`;
  }
  const resp = await fetch(url);
  const didResolutionRes = (await resp.json()) as DIDResolutionResult;
  return didResolutionRes.didDocument?.verificationMethod?.find(
    (i) => i.type === 'Iden3StateInfo2023'
  );
};

function emptyStateDID(did: DID) {
  const id = DID.idFromDID(did);
  const didType = buildDIDType(
    DID.methodFromId(id),
    DID.blockchainFromId(id),
    DID.networkIdFromId(id)
  );
  const identifier = Id.idGenesisFromIdenState(didType, 0n);
  const emptyDID = DID.parseFromId(identifier);

  return emptyDID;
}

export const resolveDidDocumentEip712MessageAndSignature = async (
  did: DID,
  resolveURL: string,
  opts?: {
    state?: Hash;
    gist?: Hash;
  }
): Promise<IdentityStateUpdate | GlobalStateUpdate> => {
  let didString = did.string().replace(/:/g, '%3A');
  // for gist resolve we have to `hide` user did (look into resolver implementation)
  const isGistRequest = opts?.gist && !opts.state;
  if (isGistRequest) {
    didString = emptyStateDID(did).string();
  }
  let url = `${resolveURL}/1.0/identifiers/${didString}?signature=EthereumEip712Signature2021`;
  if (opts?.state) {
    url += `&state=${opts.state.hex()}`;
  }

  if (opts?.gist) {
    url += `&gist=${opts.gist.hex()}`;
  }
  const resp = await fetch(url);
  const data = await resp.json();
  const message = data.didResolutionMetadata.proof[0].eip712.message;
  const signature = data.didResolutionMetadata.proof[0].proofValue;

  if (isGistRequest) {
    return {
      globalStateMsg: {
        timestamp: message.timestamp,
        userID: message.userID,
        root: message.root,
        replacedAtTimestamp: message.replacedAtTimestamp
      },
      signature
    };
  }

  return {
    idStateMsg: {
      timestamp: message.timestamp,
      userID: message.userID,
      state: message.state,
      replacedAtTimestamp: message.replacedAtTimestamp
    },
    signature
  };
};

export const buildDIDFromEthPubKey = (didType: Uint8Array, pubKeyEth: string): DID => {
  // Use Keccak-256 hash function to get public key hash
  const hashOfPublicKey = keccak256(hexToBytes(pubKeyEth));
  // Convert hash to buffer
  const ethAddressBuffer = hexToBytes(hashOfPublicKey);
  // Ethereum Address is '0x' concatenated with last 20 bytes
  // of the public key hash
  const ethAddr = ethAddressBuffer.slice(-20);
  const genesis = genesisFromEthAddress(ethAddr);
  const identifier = new Id(didType, genesis);
  return DID.parseFromId(identifier);
};
