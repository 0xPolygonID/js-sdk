import { Hash } from '@iden3/js-merkletree';
import { DIDDocument, VerificationMethod } from '../../iden3comm';
import { resolveDidDocument } from '../../utils';
import { RootInfo, StateInfo, StateProof } from '../entities';
import { IStateStorage } from '../interfaces';
import { DID, Id } from '@iden3/js-iden3-core';
import { JsonRpcProvider } from 'ethers';

export class DidResolverStateReadonlyStorage implements IStateStorage {
  constructor(private readonly resolverUrl: string) {}
  async getLatestStateById(id: bigint): Promise<StateInfo> {
    return this.getStateInfo(id);
  }
  async getStateInfoByIdAndState(id: bigint, state: bigint): Promise<StateInfo> {
    return this.getStateInfo(id, state);
  }

  async getGISTProof(id: bigint): Promise<StateProof> {
    const { didDocument } = await resolveDidDocument(
      DID.parseFromId(Id.fromBigInt(id)),
      this.resolverUrl
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
    const { proof } = global;
    return {
      root: BigInt(proof.root),
      existence: proof.existence,
      siblings: proof.siblings?.map((sibling) => BigInt(sibling)),
      index: BigInt(proof.index),
      value: BigInt(proof.value),
      auxExistence: proof.auxExistence,
      auxIndex: BigInt(proof.auxIndex),
      auxValue: BigInt(proof.auxValue)
    };
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
