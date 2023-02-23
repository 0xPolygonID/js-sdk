import { byteDecoder } from './../iden3comm/utils/index';
import { MediaType } from './../iden3comm/constants';
import { CircuitId } from '../circuits/models';
import { IProofService } from '../proof/proof-service';
import { PROTOCOL_MESSAGE_TYPE } from '../iden3comm/constants';

import {
  AuthorizationRequestMessage,
  AuthorizationRequestMessageBody,
  AuthorizationResponseMessage,
  CredentialsOfferMessage,
  IPackageManager,
  MessageFetchRequestMessage,
  MessageFetchRequestMessageBody,
  ZeroKnowledgeProofRequest,
  ZeroKnowledgeProofResponse,
  ZKPPackerParams
} from '../iden3comm';
import { DID } from '@iden3/js-iden3-core';
import { proving } from '@iden3/js-jwz';

import * as uuid from 'uuid';
import { ICredentialWallet } from '../credentials';
import { W3CCredential } from '../verifiable';
import axios from 'axios';

/**
 * Interface that allows the processing of the credential offer in the raw format for given identifier
 *
 * @export
 * @beta
 * @interface IFetchHandler
 */
export interface IFetchHandler {
  /**
   * Handle credential offer request protocol message
   *
   * @param {DID} id - identifier that will handle offer
   * @param {CredentialsOfferMessage} offer - offer message
   * @returns `Promise<W3CCredential>`
   */
  handleCredentialOffer(did: DID, offer: CredentialsOfferMessage): Promise<W3CCredential[]>;
}
/**
 *
 * Allows to handle Credential offer protocol message and return fetched credential
 *
 * @export
 * @beta

 * @class FetchHandler
 * @implements implements IFetchHandler interface
 */
export class FetchHandler implements IFetchHandler {
  /**
   * Creates an instance of AuthHandler.
   * @param {IPackageManager} _packerMgr - package manager to unpack message envelope
   */
  constructor(private readonly _packerMgr: IPackageManager) {}

  /**
   * Handles only messages with authorization/v1.0/request type
   * Generates all requested proofs and wraps authorization response message to JWZ token
   * works when profiles are not supported
   * @param {DID} did - an identity that will process the request
   * @param {Uint8Array} request - raw request
   * @returns `Promise<{token: string; authRequest: AuthorizationRequestMessage; authResponse: AuthorizationResponseMessage;}>` JWZ token, parsed request and response
   */
  async handleCredentialOffer(did: DID, offer: CredentialsOfferMessage): Promise<W3CCredential[]> {
    
    // each credential info in the offer we need to fetch

    let credentials: W3CCredential[] = [];

    for (let index = 0; index < offer.body.credentials.length; index++) {
      const credentialInfo = offer.body.credentials[index];

      const guid = uuid.v4();
      const fetchRequest: MessageFetchRequestMessage = {
        id: guid,
        typ: MediaType.ZKPMessage,
        type: PROTOCOL_MESSAGE_TYPE.AUTHORIZATION_RESPONSE_MESSAGE_TYPE,
        thid: offer.thid ?? guid,
        body: {
          id: credentialInfo.id
        },
        from: did.toString(),
        to: did.toString()
      };

      const msgBytes = new TextEncoder().encode(JSON.stringify(fetchRequest));
      const token = byteDecoder.decode(
        await this._packerMgr.pack(MediaType.ZKPMessage, msgBytes, {
          senderDID: did,
          profileNonce: 0,
          provingMethodAlg: proving.provingMethodGroth16AuthV2Instance.methodAlg
        } as ZKPPackerParams)
      );

      const resp = await axios.post<W3CCredential>(credentialInfo.id);
      if (resp.status != 200) {
        throw new Error(`could not fetch W3C credential, ${credentialInfo.id}`);
      }
      credentials.push(resp.data);
    }

    return credentials;
  }
}
