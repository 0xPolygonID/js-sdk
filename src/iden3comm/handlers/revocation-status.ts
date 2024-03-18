import { PROTOCOL_MESSAGE_TYPE } from '../constants';
import { MediaType } from '../constants';
import { IPackageManager, RevocationStatusRequestMessage } from '../types';

import { DID } from '@iden3/js-iden3-core';
import * as uuid from 'uuid';
import { RevocationStatus } from '../../verifiable';
import { IMerkleTreeStorage, MerkleTreeType } from '../../storage';
import { hashElems } from '@iden3/js-merkletree';
import { TreeState } from '../../circuits';
import { byteEncoder } from '../../utils';

/**
 * Interface that allows the processing of the revocation status
 *
 * @beta
 * @interface IRevocationStatusHandler
 */
export interface IRevocationStatusHandler {
  /**
   * unpacks revocation status request
   * @beta
   * @param {Uint8Array} request - raw byte message
   * @returns `Promise<RevocationStatusRequestMessage>`
   */
  parseRevocationStatusRequest(request: Uint8Array): Promise<RevocationStatusRequestMessage>;

  /**
   * handle revocation status request
   * @beta
   * @param {did} did  - sender DID
   * @param {Uint8Array} request - raw byte message
   * @param {RevocationStatusHandlerOptions} opts - handler options
   * @returns {Promise<Uint8Array>}` - revocation status response message
   */
  handleRevocationStatusRequest(
    did: DID,
    request: Uint8Array,
    opts?: RevocationStatusHandlerOptions
  ): Promise<Uint8Array>;
}

/** RevocationStatusHandlerOptions represents revocation status handler options */
export type RevocationStatusHandlerOptions = {
  treeState?: TreeState;
};

/**
 *
 * Allows to process RevocationStatusRequest protocol message
 *
 * @beta

 * @class RevocationStatusHandler
 * @implements implements IRevocationStatusHandler interface
 */
export class RevocationStatusHandler implements IRevocationStatusHandler {
  /**
   * Creates an instance of RevocationStatusHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   * @param {IMerkleTreeStorage} _mt - merkle tree storage
   *
   */

  constructor(
    private readonly _packerMgr: IPackageManager,
    private readonly _mt: IMerkleTreeStorage
  ) {}

  /**
   * @inheritdoc IRevocationStatusHandler#parseRevocationStatusRequest
   */
  async parseRevocationStatusRequest(request: Uint8Array): Promise<RevocationStatusRequestMessage> {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const ciRequest = message as unknown as RevocationStatusRequestMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    return ciRequest;
  }

  /**
   * @inheritdoc IRevocationStatusHandler#handleRevocationStatusRequest
   */
  async handleRevocationStatusRequest(
    did: DID,
    request: Uint8Array,
    opts?: RevocationStatusHandlerOptions
  ): Promise<Uint8Array> {
    const rsRequest = await this.parseRevocationStatusRequest(request);

    if (!rsRequest.to) {
      throw new Error(`failed request. empty 'to' field`);
    }

    if (!rsRequest.from) {
      throw new Error(`failed request. empty 'from' field`);
    }

    if (!rsRequest.body?.revocation_nonce) {
      throw new Error(`failed request. empty 'revocation_nonce' field`);
    }

    const issuerDID = DID.parse(rsRequest.to);

    const revStatus = await this.getRevocationNonceMTP(
      issuerDID,
      rsRequest.body?.revocation_nonce,
      opts?.treeState
    );

    const guid = uuid.v4();

    return this._packerMgr.pack(
      MediaType.PlainMessage,
      byteEncoder.encode(
        JSON.stringify({
          id: guid,
          typ: MediaType.PlainMessage,
          type: PROTOCOL_MESSAGE_TYPE.REVOCATION_STATUS_RESPONSE_MESSAGE_TYPE,
          thid: rsRequest.thid ?? guid,
          body: revStatus,
          from: did.string(),
          to: rsRequest.from
        })
      ),
      {}
    );
  }

  private async getRevocationNonceMTP(
    did: DID,
    nonce: number,
    treeState?: TreeState
  ): Promise<RevocationStatus> {
    const didStr = did.string();

    const claimsTree = await this._mt.getMerkleTreeByIdentifierAndType(
      didStr,
      MerkleTreeType.Claims
    );
    const revocationTree = await this._mt.getMerkleTreeByIdentifierAndType(
      didStr,
      MerkleTreeType.Revocations
    );
    const rootsTree = await this._mt.getMerkleTreeByIdentifierAndType(didStr, MerkleTreeType.Roots);

    const claimsTreeRoot = await claimsTree.root();
    const revocationTreeRoot = await revocationTree.root();
    const rootsTreeRoot = await rootsTree.root();

    const state = hashElems([
      claimsTreeRoot.bigInt(),
      revocationTreeRoot.bigInt(),
      rootsTreeRoot.bigInt()
    ]);

    const { proof } = await revocationTree.generateProof(
      BigInt(nonce),
      treeState ? treeState.revocationRoot : revocationTreeRoot
    );

    const revStatus: RevocationStatus = {
      issuer: {
        state: state?.toString(),
        claimsTreeRoot: claimsTreeRoot.string(),
        revocationTreeRoot: revocationTreeRoot.string(),
        rootOfRoots: rootsTreeRoot.string()
      },
      mtp: proof
    };
    return revStatus;
  }
}
