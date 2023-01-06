import { IPacker } from '../iden3comm/types/packer';
import { ProofQuery } from '../verifiable/proof';
import { CircuitId } from '../circuits/models';
import { IProofService, ZKPRequest } from '../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../iden3comm/constants';

import {
  AuthorizationRequestMessageBody,
  AuthorizationResponseMessage,
  ZeroKnowledgeProofResponse
} from '../iden3comm';
import { DID } from '@iden3/js-iden3-core';
import { ProvingMethodAlg } from '@iden3/js-jwz';
export class AuthHandler {
  constructor(private readonly _packer: IPacker, private readonly _proofService: IProofService) {}

  async handleAuthorizationRequest(id: DID, request: Uint8Array): Promise<Uint8Array> {
    const message = await this._packer.unpack(request);
    //todo: check if this check is necessary
    if (message.type !== PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_V2_REQUEST_MESSAGE_TYPE) {
      throw new Error('Invalid media type');
    }

    const authRequestBody = message.body as unknown as AuthorizationRequestMessageBody;

    const authResponse: AuthorizationResponseMessage = {
      id: message.id,
      typ: message.typ,
      type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
      thid: message.thid,
      body: {
        did_doc: authRequestBody.did_doc,
        message: authRequestBody.message,
        scope: []
      },
      from: message.from,
      to: message.to
    };
    for (const proofReq of authRequestBody.scope) {
      const zkpReq: ZKPRequest = {
        id: proofReq.id,
        circuitId: proofReq.circuitId as CircuitId,
        query: proofReq.query as ProofQuery
      };

      const { proof } = await this._proofService.generateProof(zkpReq, id);

      const zkpRes: ZeroKnowledgeProofResponse = {
        id: zkpReq.id,
        circuitId: zkpReq.circuitId,
        proof: proof.proof,
        pub_signals: proof.pub_signals
      };

      authResponse.body.scope.push(zkpRes);
    }
    const msgBytes = new TextEncoder().encode(JSON.stringify(authResponse));

    return await this._packer.pack(msgBytes, {
      senderID: id,
      provingMethodAlg: new ProvingMethodAlg('groth16', 'authV2')
    });
  }

  async verifyState(id: CircuitId, signals: string[]): Promise<boolean> {
    return Promise.resolve(true);
  }
}
