import { Hash } from '@iden3/js-merkletree';
import { DIDDocument, VerificationMethod } from '../../iden3comm';
import { resolveDidDocument } from '../../utils';
import { RootInfo, StateInfo, StateProof } from '../entities';
import { IStateStorage } from '../interfaces';
import { DID, Id } from '@iden3/js-iden3-core';
import { JsonRpcProvider } from 'ethers';

export class DidResolverReadonlyStorage implements IStateStorage {
  constructor(private readonly resolverUrl: string) {}
  async getLatestStateById(id: bigint): Promise<StateInfo> {
    return this.getStateInfo(id);
  }
  async getStateInfoByIdAndState(id: bigint, state: bigint): Promise<StateInfo> {
    return this.getStateInfo(id, state);
  }

  async getGISTRootInfo(root: bigint, userId: bigint): Promise<RootInfo> {
    const { didDocument } = await resolveDidDocument(
      DID.parseFromId(Id.fromBigInt(userId)),
      this.resolverUrl,
      {
        gist: Hash.fromBigInt(root)
      }
    );
    const vm = (didDocument as DIDDocument).verificationMethod?.find(
      (i) => i.type === 'Iden3StateInfo2023'
    );
    if (!vm) {
      throw new Error('Iden3StateInfo2023 verification method not found');
    }
    const { global } = vm as VerificationMethod;
    if (!global) {
      throw new Error('GIST root not found');
    }
    return global;
  }

  async getGISTProof(): Promise<StateProof> {
    throw new Error('Method not implemented.');
  }
  getRpcProvider(): JsonRpcProvider {
    throw new Error('Method not implemented.');
  }
  publishState(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  publishStateGeneric(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  private async getStateInfo(id: bigint, state?: bigint): Promise<StateInfo> {
    const opts = state ? { state: Hash.fromBigInt(state) } : undefined;
    const { didDocument } = await resolveDidDocument(
      DID.parseFromId(Id.fromBigInt(id)),
      this.resolverUrl,
      opts
    );
    const vm = (didDocument as DIDDocument).verificationMethod?.find(
      (i) => i.type === 'Iden3StateInfo2023'
    );
    if (!vm) {
      throw new Error('Iden3StateInfo2023 verification method not found');
    }
    const { info } = vm as VerificationMethod;
    return { ...info };
  }
}
