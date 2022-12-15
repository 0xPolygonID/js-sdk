import {
  ERR_CONTEXT_NOT_DEFINED,
  ERR_CTX_TYP_IS_EMPTY,
  ERR_FIELD_PATH_IS_EMPTY,
  ERR_NO_ID_ATTR,
  ERR_PARSED_CONTEXT_IS_NULL,
  ERR_TERM_IS_NOT_DEFINED,
  ERR_UNEXPECTED_ARR_ELEMENT
} from '../errors';
import { IHasher, Parts } from '../types';
import { ContextParser, JsonLdContextNormalized } from 'jsonld-context-parser';
import { FetchDocumentLoader } from '../documentLoaders/dlContextParser';
import { DEFAULT_HASHER } from '../constants';
import { JsonLdDocument } from 'jsonld';

const re = /^\d+$/;
const sortArr = <T>(arr: Array<T>): Array<T> => {
  return arr.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
};

export class Path {
  constructor(public parts: Parts = [], public hasher: IHasher = DEFAULT_HASHER) {}

  reverse() {
    return this.parts.reverse();
  }

  append(p: Parts) {
    this.parts = this.parts.concat(p);
  }

  prepend(p: Parts) {
    this.parts = [...p, ...this.parts];
  }

  async mtEntry(): Promise<bigint> {
    let h = this.hasher;
    if (!h) {
      h = DEFAULT_HASHER;
    }

    const keyParts: Array<bigint> = [].fill(BigInt(0), 0, this.parts.length);

    for (let i = 0; i < this.parts.length; i += 1) {
      const p = this.parts[i];
      if (typeof p === 'string') {
        const b = new TextEncoder().encode(p);
        keyParts[i] = await h.HashBytes(b);
      } else if (typeof p === 'number') {
        // TODO: convert BigInt into 64 bit
        keyParts[i] = BigInt.asIntN(64, BigInt(p));
      } else {
        throw `error: unexpected type ${typeof p}`;
      }
    }

    return await h.Hash(keyParts);
  }

  async pathFromContext(docStr: string, path: string) {
    const doc = JSON.parse(docStr);
    const context = doc['@context'];
    if (!context) {
      throw ERR_CONTEXT_NOT_DEFINED;
    }
    const ctxParser = new ContextParser({ documentLoader: new FetchDocumentLoader() });
    let parsedCtx = await ctxParser.parse(doc['@context']);

    const parts = path.split('.');

    for (const i in parts) {
      const p = parts[i];
      if (re.test(p)) {
        this.parts.push(parseInt(p));
      } else {
        if (!parsedCtx) {
          throw ERR_PARSED_CONTEXT_IS_NULL;
        }
        const m = parsedCtx.getContextRaw()[p];
        if (typeof m !== 'object') {
          throw ERR_TERM_IS_NOT_DEFINED;
        }

        const id = m['@id'];
        if (!id) {
          throw ERR_NO_ID_ATTR;
        }

        const nextCtx = m['@context'];
        if (nextCtx) {
          parsedCtx = await ctxParser.parse(nextCtx);
        }
        this.parts.push(id);
      }
    }
  }
}

const pathFromDocument = async (
  ldCTX: JsonLdContextNormalized | null,
  doc: JsonLdDocument,
  pathParts: Array<string>,
  acceptArray: boolean
): Promise<Parts> => {
  if (pathParts.length === 0) {
    return [];
  }

  const term = pathParts[0];
  const newPathParts = pathParts.slice(1);

  const ctxParser = new ContextParser({ documentLoader: new FetchDocumentLoader() });

  if (re.test(term)) {
    const num = parseInt(term);
    const moreParts = await pathFromDocument(ldCTX, doc, newPathParts, true);

    return [num, ...moreParts];
  }

  if (typeof doc !== 'object') {
    throw `error: expected type object got ${typeof doc}`;
  }

  let docObjMap = {};

  if (Array.isArray(doc)) {
    if (doc.length === 0) {
      throw "errror: can't generate path on zero-sized array";
    }
    if (!acceptArray) {
      throw ERR_UNEXPECTED_ARR_ELEMENT;
    }

    return pathFromDocument(ldCTX, doc[0], pathParts, false);
  } else {
    docObjMap = doc;
  }

  const ctxData = docObjMap['@context'];
  if (ctxData) {
    ldCTX = await (ldCTX
      ? ctxParser.parse(ctxData, { parentContext: ldCTX.getContextRaw() })
      : ctxParser.parse(ctxData));
  }

  const elemKeys = sortArr(Object.keys(docObjMap));
  const typedScopedCtx = ldCTX;

  for (const k in elemKeys) {
    const key = elemKeys[k];
    const expandTerm = ldCTX.expandTerm(key, true);

    if (!(expandTerm === 'type' || expandTerm === '@type')) {
      continue;
    }

    let types: Array<string> = [];

    if (Array.isArray(docObjMap[key])) {
      docObjMap[key].forEach((e) => {
        if (typeof e !== 'string') {
          throw `error: @type value must be an array of strings: ${typeof e}`;
        }
        types.push(e as string);
        types = sortArr(types);
      });
    } else if (typeof docObjMap[key] === 'string') {
      types.push(docObjMap[key]);
    } else {
      throw `error: unexpected @type fied type: ${typeof docObjMap[key]}`;
    }

    for (const tt of types) {
      const td = typedScopedCtx.getContextRaw()[tt];
      if (typeof td === 'object') {
        if (td) {
          const ctxObj = td['@context'];
          if (ctxObj) {
            ldCTX = await ctxParser.parse(ctxObj, { parentContext: ldCTX.getContextRaw() });
          }
        }
      }
    }

    break;
  }

  const m = await ldCTX.getContextRaw()[term];
  const id = m['@id'];
  if (!id) {
    throw ERR_NO_ID_ATTR;
  }
  if (typeof id !== 'string') {
    throw `error: @id attr is not of type stirng: ${typeof id}`;
  }

  const moreParts = await pathFromDocument(ldCTX, docObjMap[term], newPathParts, true);

  return [id, ...moreParts];
};

export const newPath = (parts: Parts) => {
  const p = new Path();
  p.append(parts);
  return p;
};

export const newPathFromCtx = async (docStr: string, path: string): Promise<Path> => {
  const p = new Path();
  await p.pathFromContext(docStr, path);
  return p;
};

export const newFieldPathFromCtx = async (
  docStr: string,
  ctxTyp: string,
  fieldPath: string
): Promise<Path> => {
  if (ctxTyp === '') {
    throw ERR_CTX_TYP_IS_EMPTY;
  }
  if (fieldPath === '') {
    throw ERR_FIELD_PATH_IS_EMPTY;
  }

  const fullPath = await newPathFromCtx(docStr, `${ctxTyp}.${fieldPath}`);
  const typePath = await newPathFromCtx(docStr, ctxTyp);
  return new Path(fullPath.parts.slice(typePath.parts.length));
};

export const newPathFromDocument = async (
  ldCTX: JsonLdContextNormalized | null,
  docStr: string,
  path: string
): Promise<Path> => {
  const doc = JSON.parse(docStr);
  const pathParts = path.split('.');
  if (pathParts.length === 0) {
    throw ERR_FIELD_PATH_IS_EMPTY;
  }

  const p = await pathFromDocument(ldCTX, doc, pathParts, false);
  return new Path(p);
};
