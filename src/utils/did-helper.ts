import { Hex } from '@iden3/js-crypto';
import { Id, buildDIDType, genesisFromEthAddress } from '@iden3/js-iden3-core';

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
