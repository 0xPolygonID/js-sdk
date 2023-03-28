import { expect } from 'chai';
import { CircuitId, ZeroKnowledgeProofRequest } from '../../src';

export async function checkVerifiablePresentation(
  type: string,
  userDID,
  cred,
  proofService,
  circuitId: CircuitId
) {
  const vpProofReq: ZeroKnowledgeProofRequest = {
    id: 1,
    circuitId,
    optional: false,
    query: {
      allowedIssuers: ['*'],
      type,
      context:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
      credentialSubject: {
        documentType: {}
      }
    }
  };
  const { vp: vp2 } = await proofService.generateProof(vpProofReq, userDID, cred);
  expect(vp2).to.deep.equal({
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    '@type': 'VerifiablePresentation',
    verifiableCredential: {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld'
      ],
      '@type': ['VerifiableCredential', 'KYCAgeCredential'],
      credentialSubject: {
        '@type': 'KYCAgeCredential',
        documentType: 99
      }
    }
  });
}
