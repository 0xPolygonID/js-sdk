import * as fs from 'fs';

/**
 * Loader interface to load from different sources
 *
 * @export
 * @beta
 * @interface   IKeyLoader
 */
export interface IKeyLoader {
  /**
   * loads file as a byte array
   *
   * @param {string} path - path to file
   * @returns `Promise<Uint8Array>`
   */
  load(path: string): Promise<Uint8Array>;
}
const isBrowser = new Function('try {return this===window;}catch(e){ return false;}');

/**
 * Loader from file system
 *
 * @export
 * @beta
 * @class FSKeyLoader
 * @implements implements IKeyLoader interface
 */
export class FSKeyLoader implements IKeyLoader {
  constructor(public readonly dir: string) {}
  public async load(path: string): Promise<Uint8Array> {
    if (isBrowser()) {
      throw new Error('can not use fs loader in the browser');
    }
    const data = await fs.readFileSync(`${this.dir}/${path}`);
    return new Uint8Array(data);
  }
}
