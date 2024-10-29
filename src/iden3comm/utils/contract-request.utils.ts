import { keccak256 } from 'ethers';
import { byteEncoder, hexToBytes, isEthereumIdentity } from '../../utils';
import { CircuitId } from '../../circuits';
import { Hex } from '@iden3/js-crypto';
import { DID } from '@iden3/js-iden3-core';
import { IProofService } from '../../proof';
import { ZeroKnowledgeProofResponse } from '../types';

/**
 * Retrieves the AuthV2 request ID.
 *
 * @returns The AuthV2 request ID.
 */
export function getAuthV2RequestId(): number {
  const circuitHash = keccak256(byteEncoder.encode(CircuitId.AuthV2));
  const dataView = new DataView(Hex.decodeString(circuitHash.replace('0x', '')).buffer);
  const id = dataView.getUint32(0);
  return id;
}

/**
 * Prepares the zero-knowledge proof response for the AuthV2 circuit.
 * @param address - The address associated with the request.
 * @param senderDid - The sender's decentralized identifier (DID).
 * @param proofService - The proof service used to generate the proof.
 * @returns A promise that resolves to an array of ZeroKnowledgeProofResponse objects.
 */
export async function prepareAuthV2ZeroKnowledgeResponse(
  address: string,
  senderDid: DID,
  proofService: IProofService
): Promise<ZeroKnowledgeProofResponse[]> {
  const circuitId = CircuitId.AuthV2;
  const id = getAuthV2RequestId();

  if (isEthereumIdentity(senderDid)) {
    return [
      {
        circuitId,
        id,
        pub_signals: [],
        proof: {
          pi_a: [],
          pi_b: [],
          pi_c: [],
          protocol: 'groth16'
        }
      }
    ];
  }
  const hash = Uint8Array.from([...hexToBytes(address), ...new Uint8Array(12)]).reverse();
  const authInputs = await proofService.generateAuthV2Inputs(hash, senderDid, CircuitId.AuthV2);

  const prover = proofService.getProver();

  const { proof, pub_signals } = await prover.generate(authInputs, CircuitId.AuthV2);

  return [
    {
      circuitId,
      id,
      pub_signals,
      proof
    }
  ];
}
