declare module 'jsonld/lib' {
  function processContext(
    activeCtx: unknown,
    localCtx: unknown,
    opts: unknown
  ): Promise<{ mappings: Map<string, Record<string, unknown>> }>;
}

declare module 'jsonld/lib/context' {
  function getInitialContext(opts: unknown): Map<string, object>;
}
