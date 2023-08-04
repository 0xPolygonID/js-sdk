import { ClaimNonRevStatus, GISTProof } from '../circuits';
import { StateProof } from '../storage/entities/state';
import { RevocationStatus } from '../verifiable';
/**
 * converts verifiable RevocationStatus model to circuits structure
 *
 * @param {RevocationStatus} - credential.status of the verifiable credential
 * @returns {ClaimNonRevStatus}
 */
export declare const toClaimNonRevStatus: (s: RevocationStatus) => ClaimNonRevStatus;
/**
 * converts state info from smart contract to gist proof
 *
 * @param {StateProof} smtProof  - state proof from smart contract
 * @returns {GISTProof}
 */
export declare const toGISTProof: (smtProof: StateProof) => GISTProof;
