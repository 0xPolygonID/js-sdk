import { JsonLdDocument, ParsedCtx } from 'jsonld';
declare module 'jsonld' {
  export function processContext(
    activeCtx: ParsedCtx | null,
    localCtx: JsonLdDocument | null,
    opts: jsonLDOpts
  ): Promise<ParsedCtx>;
}
