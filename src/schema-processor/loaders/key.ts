import { promises as fs } from 'fs';
import { TextEncoder } from 'node:util';

export interface IKeyLoader {
  load(circuitId: string): Promise<Uint8Array>;
}

export class FSKeyLoader implements IKeyLoader {
  constructor(public readonly dir: string) {}
  public async load(circuitId: string): Promise<Uint8Array> {
    const data = await fs.readFile(`${this.dir}/${circuitId}.json`, 'utf8');
    const enc = new TextEncoder();
    return enc.encode(data);
  }
}
