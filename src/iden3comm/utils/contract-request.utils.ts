import { keccak256 } from 'ethers';
import { byteEncoder, hexToBytes, isEthereumIdentity } from '../../utils';
import { CircuitId } from '../../circuits';
import { Hex } from '@iden3/js-crypto';
import { DID } from '@iden3/js-iden3-core';
import { IProofService } from '../../proof';
import { ZeroKnowledgeProofResponse } from '../types';

/**
 * @beta
 * Retrieves the request ID from circuit string.
 * CircuitId.AuthV2 - 940499666
 * @returns The request ID.
 */
export function calculateRequestIdForCircuit(circuitId: CircuitId): number {
  const circuitHash = keccak256(byteEncoder.encode(circuitId));
  const dataView = new DataView(Hex.decodeString(circuitHash.replace('0x', '')).buffer);
  const id = dataView.getUint32(0);
  return id;
}

/**
 * Prepares the zero-knowledge proof response for the AuthV2 circuit.
 * @beta
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

  //  this is now hardcoded calculated value for 'authV2' that can be changed in the future.
  const id = 940499666;

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
  const { proof, pub_signals } = await proofService.generateAuthV2Proof(hash, senderDid);

  return [
    {
      circuitId,
      id,
      pub_signals,
      proof
    }
  ];
}
