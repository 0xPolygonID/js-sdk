import axios from 'axios';
import { create, IPFSHTTPClient as IpfsHttpClient } from 'ipfs-http-client';

// Schema is a protocol schema
export interface Schema {
  hash?: string;
  url: string;
  type: string;
}

export interface SchemaLoadResult {
  schema: Uint8Array;
  extension: string;
}

export interface ISchemaLoader {
  load(schema: Schema): Promise<SchemaLoadResult>;
}

export class UniversalSchemaLoader implements ISchemaLoader {
  constructor(private ipfsUrl: string) {}
  public async load(schema: Schema): Promise<SchemaLoadResult> {
    const l = getLoader(schema.url, this.ipfsUrl);
    const schemaRes = await l.load(schema);
    return schemaRes;
  }
}

export class HttpSchemaLoader implements ISchemaLoader {
  public async load(schema: Schema): Promise<SchemaLoadResult> {
    const resp = await axios.get(schema.url, { responseType: 'arraybuffer' });
    return {
      schema: resp.data as Uint8Array,
      extension: 'json-ld',
    };
  }
}
export class IpfsSchemaLoader implements ISchemaLoader {
  private readonly client: IpfsHttpClient;
  constructor(private readonly url: string) {
    this.client = create({ url: this.url });
  }
  public async load(schema: Schema): Promise<SchemaLoadResult> {
    const uri = new URL(schema.url);

    const schemaRes = this.client.cat(uri.host);

    let schemaBytes: Uint8Array = Uint8Array.from([]);
    for await (const num of schemaRes) {
      schemaBytes = Uint8Array.from(num);
    }

    return {
      schema: schemaBytes,
      extension: 'json-ld',
    };
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
      return new IpfsSchemaLoader(ipfsConfigUrl!);

    default:
      throw new Error(`loader for ${uri.protocol} is not supported`);
  }
}
