import { Hex } from '@iden3/js-crypto';
import { Id, buildDIDType, genesisFromEthAddress, DID } from '@iden3/js-iden3-core';
import { Hash } from '@iden3/js-merkletree';
import { DIDResolutionResult, VerificationMethod } from 'did-resolver';
import { isGenesisState } from '../credentials';

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
  if (!(vm as any).published && !isGenesisState(did, state.bigInt())) {
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
