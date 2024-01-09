import { IPackageManager } from '../../iden3comm';
import { StateInfo } from '../../storage';
import { Id } from '@iden3/js-iden3-core';
import { RevocationStatus } from '../credential';

export interface StatusOptions {
  resolver: CredStatusResolver;
  packageManager: IPackageManager;
}

export interface CredStatusResolver {
  getStateInfoByID: (id: Id) => Promise<StateInfo>;
  getRevocationStatus: (id: Id, nonce: bigint) => Promise<RevocationStatus | undefined>;
  getRevocationStatusByIDAndState: (
    id: Id,
    state: bigint,
    nonce: bigint
  ) => Promise<RevocationStatus | undefined>;
}
