import { Hash } from '@iden3/js-merkletree';
import { DIDDocument, VerificationMethod } from '../../iden3comm';
import { resolveDidDocument } from '../../utils';
import { RootInfo, StateInfo, StateProof } from '../entities';
import { IStateStorage } from '../interfaces';
import { DID, Id } from '@iden3/js-iden3-core';
import { JsonRpcProvider } from 'ethers';
import { VerifiableConstants } from '../../verifiable';

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
    const { global } = this.getIden3StateInfo2023(didDocument);
    if (!global) {
      throw new Error('GIST root not found');
    }
    const { proof } = global;
    if (!proof) {
      throw new Error('GIST proof not found');
    }
    return {
      root: global.root,
      existence: proof.existence,
      siblings: proof.siblings?.map((sibling) => BigInt(sibling)),
      index: BigInt(0),
      value: BigInt(0),
      auxExistence: !!proof.node_aux,
      auxIndex: proof.node_aux ? BigInt(proof.node_aux.key) : BigInt(0),
      auxValue: proof.node_aux ? BigInt(proof.node_aux.value) : BigInt(0)
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
    const { global } = this.getIden3StateInfo2023(didDocument);
    if (!global) {
      throw new Error('GIST root not found');
    }
    return global;
  }

  getRpcProvider(): JsonRpcProvider {
    return new JsonRpcProvider();
  }

  publishState(): Promise<string> {
    throw new Error('publishState method not implemented.');
  }

  publishStateGeneric(): Promise<string> {
    throw new Error('publishStateGeneric method not implemented.');
  }

  private async getStateInfo(id: bigint, state?: bigint): Promise<StateInfo> {
    const opts = state ? { state: Hash.fromBigInt(state) } : undefined;
    const { didDocument } = await resolveDidDocument(
      DID.parseFromId(Id.fromBigInt(id)),
      this.resolverUrl,
      opts
    );
    const { info, published } = this.getIden3StateInfo2023(didDocument);
    if (!info && !published) {
      throw new Error(VerifiableConstants.ERRORS.STATE_DOES_NOT_EXIST);
    }
    if (info) {
      info.id = id; // info id from resolver is DID
      info.state = opts?.state.bigInt(); // state in hex from resolver
    }
    return { ...info };
  }

  private getIden3StateInfo2023(didDocument: DIDDocument): VerificationMethod {
    const vm: VerificationMethod | undefined = didDocument.verificationMethod?.find(
      (i: VerificationMethod) => i.type === 'Iden3StateInfo2023'
    );
    if (!vm) {
      throw new Error('Iden3StateInfo2023 verification method not found');
    }
    return vm;
  }
}
