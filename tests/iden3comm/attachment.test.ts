import {
  Attachment,
  AuthorizationRequestMessage,
  byteEncoder,
  createAuthorizationRequest,
  createProposalRequest,
  CredentialProposalHandler,
  ICredentialWallet,
  IDataStorage,
  IdentityWallet,
  IPackageManager,
  KMS,
  Proposal,
  ProposalRequestMessage,
  TransparentPaymentData,
  TransparentPaymentInstructionMessage
} from '../../src';
import * as uuid from 'uuid';
import { getRandomBytes } from '@iden3/js-crypto';
import { Blockchain, buildDIDType, DID, DidMethod, Id, NetworkId } from '@iden3/js-iden3-core';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../../src/iden3comm/constants';
import { expect } from 'chai';

describe('Attachments', () => {
  const didType = buildDIDType(DidMethod.Iden3, Blockchain.Polygon, NetworkId.Amoy);

  const cred = {
    context: 'https://schema.iden3.io/transparent-payment/1.0.0/schema.json',
    type: 'TransparentCredential'
  };

  const paymentData = {
    type: 'TransparentPaymentData',
    signature: '0x0000000000000000000000000000000000000000000000000000000000000000',
    recipient: '0x0000000000000000000000000000000000000000',
    amount: '100',
    token: 'USDT',
    expiration: 1716153600,
    nonce: 1,
    metadata: '0x'
  };

  const [verifierDid, userDid, issuerDid] = [
    getRandomBytes(27),
    getRandomBytes(27),
    getRandomBytes(27)
  ].map((seed) => DID.parseFromId(new Id(didType, seed)).string());

  const verifierFlow = () => {
    const id = uuid.v4();
    const transparentPaymentInstructionMessage: TransparentPaymentInstructionMessage = {
      id,
      thid: id,
      from: verifierDid,
      to: issuerDid,
      typ: MediaType.PlainMessage,
      type: PROTOCOL_MESSAGE_TYPE.TRANSPARENT_PAYMENT_INSTRUCTION_MESSAGE_TYPE,
      body: {
        goal_code: PROTOCOL_MESSAGE_TYPE.PROPOSAL_REQUEST_MESSAGE_TYPE,
        did: userDid,
        credentials: [cred],
        paymentData
      }
    };

    const attachment: Attachment = {
      id: id,
      media_type: MediaType.PlainMessage,
      data: {
        json: transparentPaymentInstructionMessage
      }
    };
    // verifier creates auth request with attachment
    const authRequest = createAuthorizationRequest(
      'transparent payment',
      verifierDid,
      'http://verifier.com/callback',
      {
        attachments: [attachment]
      }
    );

    return authRequest;
  };

  const userFlow = (authRequest: AuthorizationRequestMessage): ProposalRequestMessage => {
    // checks no credential
    // creates cred proposal request
    return createProposalRequest(DID.parse(userDid), DID.parse(issuerDid), {
      credentials: [cred],
      attachments: authRequest.attachments
    });
  };

  const issuerFlow = async (proposalRequest: ProposalRequestMessage) => {
    const credentialProposalHandler = new CredentialProposalHandler(
      {
        pack: () => null,
        unpack: () => ({ unpackedMessage: proposalRequest })
      } as unknown as IPackageManager,
      new IdentityWallet(
        new KMS(),
        {
          states: {
            getRpcProvider: () => null
          }
        } as unknown as IDataStorage,
        {
          findByQuery: () => Promise.reject(new Error('no credential satisfied query'))
        } as unknown as ICredentialWallet
      ),
      {
        agentUrl: 'http://issuer.com',
        packerParams: {},
        proposalResolverFn: (
          context: string,
          type: string,
          opts: { paymentInfo?: TransparentPaymentData } | undefined
        ) => {
          expect(opts?.paymentInfo).to.be.deep.equal(paymentData);

          return Promise.resolve({} as Proposal);
        }
      }
    );

    return credentialProposalHandler.handleProposalRequest(
      byteEncoder.encode(JSON.stringify(proposalRequest)),
      {}
    );
  };

  it('verifier transparent payment instruction flow', async () => {
    const authRequest = verifierFlow();
    const proposalRequest = userFlow(authRequest);
    await issuerFlow(proposalRequest);
  });
});
