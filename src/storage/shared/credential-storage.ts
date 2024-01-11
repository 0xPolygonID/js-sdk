import { ProofQuery, RefreshServiceType, W3CCredential } from '../../verifiable';
import { CredentialRefreshService } from '../../verifiable/refresh-service';
import { StandardJSONCredentialsQueryFilter } from '../filters';
import { ICredentialStorage } from '../interfaces/credentials';
import { IDataSource } from '../interfaces/data-source';

/**
 * Implementation of ICredentialStorage with KV Data source
 *
 * @public
 * @class CredentialStorage
 * @implements {ICredentialStorage}
 */
export class CredentialStorage implements ICredentialStorage {
  /**
   * key for storage
   *
   * @static
   */
  static readonly storageKey = 'credentials';
  /**
   * Creates an instance of CredentialStorage.
   * @param {IDataSource<W3CCredential>} _dataSource - W3CCredential credential KV data source
   */
  constructor(
    private readonly _dataSource: IDataSource<W3CCredential>,
    private readonly _refreshService?: CredentialRefreshService
  ) {}

  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async listCredentials(): Promise<W3CCredential[]> {
    const creds = await this._dataSource.load();
    return creds.filter((i) => i !== undefined).map((cred) => cred && W3CCredential.fromJSON(cred));
  }

  /** @inheritdoc */
  async saveCredential(credential: W3CCredential): Promise<void> {
    return this._dataSource.save(credential.id, credential.toJSON());
  }

  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async saveAllCredentials(credentials: W3CCredential[]): Promise<void> {
    for (const credential of credentials) {
      await this.saveCredential(credential);
    }
  }

  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async removeCredential(id: string): Promise<void> {
    return this._dataSource.delete(id);
  }

  /** {@inheritdoc ICredentialStorage.listCredentials } */
  async findCredentialById(id: string): Promise<W3CCredential | undefined> {
    const cred = await this._dataSource.get(id);
    return cred && W3CCredential.fromJSON(cred);
  }

  /** {@inheritdoc ICredentialStorage.listCredentials }
   * uses JSON query
   */
  async findCredentialsByQuery(query: ProofQuery): Promise<W3CCredential[]> {
    let filters = StandardJSONCredentialsQueryFilter(query);
    const allClaims = await this._dataSource.load();
    let creds = allClaims.filter((credential) =>
      filters.every((filter) => filter.execute(credential))
    );

    if (this._refreshService) {
      let skippedCredSubjectFilter;
      // if no creds found, let's skip credentialSubject filter and try to refresh expired creds
      if (!creds.length && query.credentialSubject) {
        skippedCredSubjectFilter = query.credentialSubject;
        query.credentialSubject = undefined;
        filters = StandardJSONCredentialsQueryFilter(query);
        creds = allClaims.filter((credential) =>
          filters.every((filter) => filter.execute(credential))
        );
      }

      // all expired creds
      const expiredCreds = creds.filter(
        (c) =>
          c.expirationDate &&
          new Date(c.expirationDate) > new Date() &&
          c.refreshService &&
          c.refreshService.type === RefreshServiceType.Iden3RefreshService2023
      );

      // refresh and update storage
      for (let i = 0; i < expiredCreds.length; i++) {
        const refreshedCred = await this._refreshService.refresh(expiredCreds[i]);
        await this.removeCredential(expiredCreds[i].id);
        await this.saveCredential(refreshedCred);
        creds = creds.filter((c) => c.id == expiredCreds[i].id);
        creds.push(refreshedCred);
      }

      // apply skipped credentialSubject filter
      if (skippedCredSubjectFilter) {
        query.credentialSubject = skippedCredSubjectFilter;
        filters = StandardJSONCredentialsQueryFilter(query);
        creds = creds.filter((credential) => filters.every((filter) => filter.execute(credential)));
      }
    }

    const mappedCreds = creds
      .filter((i) => i !== undefined)
      .map((cred) => W3CCredential.fromJSON(cred));

    return mappedCreds;
  }
}
