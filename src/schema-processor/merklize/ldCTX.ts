import {
  ContextParser,
  IJsonLdContextNormalizedRaw,
  JsonLdContext,
  JsonLdContextNormalized
} from 'jsonld-context-parser';
import { FetchDocumentLoader } from './documentLoaders/dlContextParser';

export default class LDCtx {
  context: IJsonLdContextNormalizedRaw;
  #parser: ContextParser;

  constructor() {
    this.#parser = new ContextParser({ documentLoader: new FetchDocumentLoader() });
    this.context = null;
  }

  async parse(ctxObj: JsonLdContext) {
    const ctx = await this.#parser.parse(ctxObj);
    const rawCtx = ctx.getContextRaw();
    this.context = { ...this.context, ...rawCtx };
  }

  getTermDefinition(k: string) {
    return this.context[k];
  }

  expandTerm(k: string, expandVocab = false) {
    const ctx = new JsonLdContextNormalized(this.context);
    return ctx.expandTerm(k, expandVocab);
  }
}
