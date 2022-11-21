import { IdentityWallet } from './identity-wallet';
export * from './identity-wallet';

export function getIdentityWallet(): IdentityWallet {
  return new IdentityWallet();
}
