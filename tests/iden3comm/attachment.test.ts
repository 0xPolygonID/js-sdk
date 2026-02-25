import {
  Attachment,
  AuthorizationRequestMessage,
  BasicMessage,
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
  ProposalRequestMessage
} from '../../src';
import * as uuid from 'uuid';
import { getRandomBytes } from '@iden3/js-crypto';
import { Blockchain, buildDIDType, DID, DidMethod, Id, NetworkId } from '@iden3/js-iden3-core';
import { describe, it, vi, expect } from 'vitest';
import { MediaType } from '../../src/iden3comm/constants';

describe('Attachments', () => {
  const didType = buildDIDType(DidMethod.Iden3, Blockchain.Polygon, NetworkId.Amoy);

  const creds = [
    {
      context: 'https://schema.iden3.io/transparent-payment/1.0.0/schema.json',
      type: 'TransparentCredential'
    },
    {
      context: 'ipfs://QmWDmZQrtvidcNK7d6rJwq7ZSi8SUygJaKepN7NhKtGryc',
      type: 'operators'
    }
  ];

  const [verifierDid, userDid, issuerDid] = [
    getRandomBytes(27),
    getRandomBytes(27),
    getRandomBytes(27)
  ].map((seed) => DID.parseFromId(new Id(didType, seed)).string());
  const tokenPayload = {
    sub: userDid,
    aud: issuerDid,
    iat: new Date().getTime(),
    iss: userDid,
    exp: new Date().getTime() + 1000 * 60 * 60 * 24 * 30
  };

  const verifierFlow = () => {
    const id = uuid.v4();

    const attachment: Attachment = {
      id: id,
      data: {
        json: {
          type: 'SponsoredPaymentInstructionV0.1',
          token: `headers.${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}.signature`
        }
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
      credentials: creds,
      attachments: authRequest.attachments
    });
  };

  const issuerFlow = async (proposalRequest: ProposalRequestMessage) => {
    const pkgManager = {
      pack: () => null,
      unpack: () => ({ unpackedMessage: proposalRequest })
    } as unknown as IPackageManager;

    const identityWallet = new IdentityWallet(
      new KMS(),
      {
        states: {
          getRpcProvider: () => null
        }
      } as unknown as IDataStorage,
      {
        findByQuery: () => Promise.reject(new Error('no credential satisfied query'))
      } as unknown as ICredentialWallet
    );
    // expect proposalResolverFn to have called 2 times
    const spy = vi.fn();
    const proposalResolverFn = (context: string, type: string, opts?: { msg?: BasicMessage }) => {
      const token = (opts?.msg?.attachments?.[0]?.data?.json as { token: string }).token;
      const [, body] = token.split('.');
      // verify signature of token and token.iss field
      const decodedBody = JSON.parse(Buffer.from(body, 'base64').toString('utf-8'));
      expect(decodedBody).toEqual(tokenPayload);

      // handle token here
      const { from, to } = opts?.msg as BasicMessage;
      expect(from).toBe(decodedBody.sub);
      expect(to).toBe(decodedBody.aud);
      spy();
      return Promise.resolve({} as Proposal);
    };

    const credentialProposalHandler = new CredentialProposalHandler(pkgManager, identityWallet, {
      agentUrl: 'http://issuer.com',
      packerParams: {
        mediaType: MediaType.PlainMessage
      },
      proposalResolverFn
    });

    const response = await credentialProposalHandler.handleProposalRequest(
      byteEncoder.encode(JSON.stringify(proposalRequest)),
      {}
    );

    expect(spy).toHaveBeenCalledTimes(2);

    return response;
  };

  it('verifier transparent payment instruction flow', async () => {
    const authRequest = verifierFlow();
    const proposalRequest = userFlow(authRequest);
    await issuerFlow(proposalRequest);
  });
});
