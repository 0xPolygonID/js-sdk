import { create, IPFSHTTPClient } from 'ipfs-http-client';

/**
 * Loader interface to load schema
 *
 * @export
 * @beta
 * @interface   ISchemaLoader
 */
export interface ISchemaLoader {
  /**
   * loads schema by its url
   *
   * @param {string} url
   * @returns `Promise<Uint8Array>`
   */
  load(url: string): Promise<Uint8Array>;
}

/**
 * loads schemas from ipfs and http sources
 *
 * @export
 * @beta
 * @class UniversalSchemaLoader
 * @implements implements ISchemaLoader interface
 */
export class UniversalSchemaLoader implements ISchemaLoader {
  constructor(private ipfsUrl: string) {}

  /**
   * loads schema by URL
   *
   * @param {string} url - schema URL
   * @returns `Promise<Uint8Array>`
   */
  public async load(url: string): Promise<Uint8Array> {
    const l = getLoader(url, this.ipfsUrl);
    const schemaRes = await l.load(url);
    return schemaRes;
  }
}

/**
 * loads schemas from http source
 *
 * @export
 * @beta
 * @class HttpSchemaLoader
 * @implements implements ISchemaLoader interface
 */
export class HttpSchemaLoader implements ISchemaLoader {
  /**
   *
   *
   * @param {string} url - schema URL
   * @returns `Promise<Uint8Array>`
   */
  public async load(url: string): Promise<Uint8Array> {
    const resp = await fetch(url);
    return new Uint8Array(await resp.arrayBuffer());
  }
}
/**
 * loads schemas from ipfs source
 *
 * @export
 * @beta
 * @class IpfsSchemaLoader
 * @implements implements ISchemaLoader interface
 */
export class IpfsSchemaLoader implements ISchemaLoader {
  private readonly client: IPFSHTTPClient;
  /**
   * Creates an instance of IpfsSchemaLoader.
   * @param {string} url - host of the ipfs node
   */
  constructor(private readonly url: string) {
    this.client = create({ url: this.url });
  }
  /**
   * loads schema from ipfs by its identifier
   *
   * @param {string} url - schema IPFS identifier
   * @returns `Promise<Uint8Array>`
   */
  public async load(url: string): Promise<Uint8Array> {
    const uri = new URL(url);

    const schemaRes = this.client.cat(uri.host);

    let schemaBytes: Uint8Array = Uint8Array.from([]);
    for await (const num of schemaRes) {
      schemaBytes = Uint8Array.from(num);
    }

    return schemaBytes;
  }
}

/**
 * returns loader for schemas based on the URL protocol
 *
 * @export
 * @param {string} url - schema url
 * @param {string} [ipfsConfigUrl] - ipfs node host url
 * @returns ISchemaLoader
 */
export function getLoader(url: string, ipfsConfigUrl?: string): ISchemaLoader {
  const uri = new URL(url);

  switch (uri.protocol) {
    case 'http:':
    case 'https:':
      return new HttpSchemaLoader();
    case 'ipfs:':
      return new IpfsSchemaLoader(ipfsConfigUrl);

    default:
      throw new Error(`loader for ${uri.protocol} is not supported`);
  }
}
