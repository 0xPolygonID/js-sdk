export enum KmsKeyType {
  BabyJubJub = 'BJJ',
  Ethereum = 'ETH'
}

export interface KmsKeyId {
  type: KmsKeyType;
  id: string;
}
