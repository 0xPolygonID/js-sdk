import { byteDecoder } from './../iden3comm/utils/index';
import { MediaType } from './../iden3comm/constants';
import { ProofQuery } from '../verifiable/proof';
import { CircuitId } from '../circuits/models';
import { IProofService, ZKPRequest } from '../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../iden3comm/constants';

import {
  AuthorizationRequestMessage,
  AuthorizationRequestMessageBody,
  AuthorizationResponseMessage,
  IPackageManger,
  ZeroKnowledgeProofResponse
} from '../iden3comm';
import { DID } from '@iden3/js-iden3-core';
import { proving } from '@iden3/js-jwz';
import * as uuid from 'uuid';

export interface IAuthHandler {
  handleAuthorizationRequest(
    id: DID,
    request: Uint8Array
  ): Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }>;
}
export class AuthHandler implements IAuthHandler {
  constructor(
    private readonly _packerMgr: IPackageManger,
    private readonly _proofService: IProofService
  ) {}

  async handleAuthorizationRequest(
    did: DID,
    request: Uint8Array
  ): Promise<{
    token: string;
    authRequest: AuthorizationRequestMessage;
    authResponse: AuthorizationResponseMessage;
  }> {
    const { unpackedMessage: message } = await this._packerMgr.unpack(request);
    const authRequest = message as unknown as AuthorizationRequestMessage;
    if (message.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }
    const authRequestBody = message.body as unknown as AuthorizationRequestMessageBody;

    const guid = uuid.v4();
    const authResponse: AuthorizationResponseMessage = {
      id: guid,
      typ: MediaType.ZKPMessage,
      type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      thid: message.thid ?? guid,
      body: {
        did_doc: undefined, //  slipped for now, todo: get did doc for id
        message: authRequestBody.message,
        scope: []
      },
      from: did.toString(),
      to: message.from
    };
    for (const proofReq of authRequestBody.scope) {
      const zkpReq: ZKPRequest = {
        id: proofReq.id,
        circuitId: proofReq.circuitId as CircuitId,
        query: proofReq.query as ProofQuery
      };

      const { proof } = await this._proofService.generateProof(zkpReq, did);

      const zkpRes: ZeroKnowledgeProofResponse = {
        id: zkpReq.id,
        circuitId: zkpReq.circuitId,
        proof: proof.proof,
        pub_signals: proof.pub_signals
      };

      authResponse.body.scope.push(zkpRes);
    }
    const msgBytes = new TextEncoder().encode(JSON.stringify(authResponse));
    const token = byteDecoder.decode(
      await this._packerMgr.pack(MediaType.ZKPMessage, msgBytes, {
        senderID: did,
        provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
      })
    );
    return { authRequest, authResponse, token };
  }
}
