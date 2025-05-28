import { ProofData } from '@iden3/js-jwz';
import { ethers } from 'ethers';

export const packZkpProof = (inputs: string[], a: string[], b: string[][], c: string[]): string => {
  return new ethers.AbiCoder().encode(
    ['uint256[] inputs', 'uint256[2]', 'uint256[2][2]', 'uint256[2]'],
    [inputs, a, b, c]
  );
};

export const prepareZkpProof = (proof: ProofData): { a: string[]; b: string[][]; c: string[] } => {
  return {
    a: proof.pi_a.slice(0, 2),
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]]
    ],
    c: proof.pi_c.slice(0, 2)
  };
};
