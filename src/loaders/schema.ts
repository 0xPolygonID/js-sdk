import axios from 'axios';
import { create, IPFSHTTPClient as IpfsHttpClient } from 'ipfs-http-client';

export interface ISchemaLoader {
  load(url: string): Promise<Uint8Array>;
}

export class UniversalSchemaLoader implements ISchemaLoader {
  constructor(private ipfsUrl: string) {}
  public async load(url: string): Promise<Uint8Array> {
    const l = getLoader(url, this.ipfsUrl);
    const schemaRes = await l.load(url);
    return schemaRes;
  }
}

export class HttpSchemaLoader implements ISchemaLoader {
  public async load(url: string): Promise<Uint8Array> {
    const resp = await axios.get(url, { responseType: 'arraybuffer' });
    return resp.data as Uint8Array;
  }
}
export class IpfsSchemaLoader implements ISchemaLoader {
  private readonly client: IpfsHttpClient;
  constructor(private readonly url: string) {
    this.client = create({ url: this.url });
  }
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

// TODO: IPFS URL FOR BROWSER
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
