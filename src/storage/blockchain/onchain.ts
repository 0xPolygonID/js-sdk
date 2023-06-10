import { HistoricalRoots, StateProof } from './../entities/state';
import { BigNumber, ethers } from 'ethers';
import abi from './onchain-abi.json';

// TODO(illia-korotia): make as global map with overrides
const chainResolvers = {
  80001: 'https://polygon-mumbai.g.alchemy.com/v2/6S0RiH55rrmlnrkMiEm0IL2Zy4O-VrnQ' // mumbai testnet
};

export class OnChainIssuer {
  public readonly onchainContract: ethers.Contract;
  public readonly provider: ethers.providers.JsonRpcProvider;

  constructor(contractAddress: string, chainID: number) {
    const rpcURL = chainResolvers[chainID];
    if (!rpcURL) {
      throw new Error(`ChainID ${chainID} is not supported`);
    }

    this.provider = new ethers.providers.JsonRpcProvider(rpcURL);
    this.onchainContract = new ethers.Contract(contractAddress, abi, this.provider);
  }

  // getHistroricalStatus
  async getRootsByState(state: bigint): Promise<HistoricalRoots> {
    const response = await this.onchainContract.getRootsByState(state);

    console.log('historical states:', response);

    const historicalRoots: HistoricalRoots = {
      claimsRoot: BigNumber.from(response[0]).toBigInt(),
      revocationsRoot: BigNumber.from(response[1]).toBigInt(),
      rootsRoot: BigNumber.from(response[2]).toBigInt()
    };

    return historicalRoots;
  }

  // getRevocationProof
  async getRevocationProofByRoot(revocationNonce: number, state: bigint): Promise<StateProof> {
    const data = await this.onchainContract.getRevocationProofByRoot(revocationNonce, state);

    return {
      root: BigInt(data.root.toString()),
      existence: data.existence,
      siblings: data.siblings?.map((sibling) => BigInt(sibling.toString())),
      index: BigInt(data.index.toString()),
      value: BigInt(data.value.toString()),
      auxExistence: data.auxExistence,
      auxIndex: BigInt(data.auxIndex.toString()),
      auxValue: BigInt(data.auxValue.toString())
    };
  }
}
