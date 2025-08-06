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
import { MediaType } from '../../src/iden3comm/constants';
import { describe, it, vi, expect } from 'vitest';

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

  const verifierFlow = () => {
    const id = uuid.v4();

    const attachment: Attachment = {
      id: id,
      media_type: MediaType.PlainMessage,
      data: {
        json: {
          type: 'SponsoredPaymentInstructionV0.1',
          token: 'fake.jwt.string'
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
      expect(token).toBe('fake.jwt.string');
      // handle token here
      const sender = opts?.msg?.from;
      expect(sender).toBe(userDid);
      spy();
      return Promise.resolve({} as Proposal);
    };

    const credentialProposalHandler = new CredentialProposalHandler(pkgManager, identityWallet, {
      agentUrl: 'http://issuer.com',
      packerParams: {},
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
