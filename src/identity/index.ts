import { IdentityWallet } from './identity-wallet';
export * from './identity-wallet';

export function getIdentityWallet(): IdentityWallet {
  return new IdentityWallet();
}

// IdentityStatus represents type for state Status
export enum IdentityStatus {
  Created = 'created',
  // StatusTransacted is a status for state that was published but result is not known
  Transacted = 'transacted',
  // StatusConfirmed is a status for confirmed transaction
  Confirmed = 'confirmed',
  // StatusFailed is a status for failed transaction
  Failed = 'failed'
}

// IdentityState identity state model
export interface IdentityState {
  stateId: number;
  identifier: string;
  state?: string;
  rootOfRoots?: string;
  claimsTreeRoot?: string;
  revocationTreeRoot?: string;
  blockTimestamp?: number;
  blockNumber?: number;
  txId?: string;
  previousState?: string;
  status?: IdentityStatus;
  modifiedAt?: string;
  createdAt?: string;
}
