import { DocumentLoader, Options, getDocumentLoader } from '@iden3/js-jsonld-merklization';
import { RemoteDocument, Url } from 'jsonld/jsonld-spec';
import { VerifiableConstants } from '../../verifiable';

/**
 * cacheLoader returns a remote document with additional logic for caching the urls remote documents.
 * If the same url is called more then once, remote document will be not downloaded again but will returned from memory cache.
 * @param {Options } context - JSONLD loader options
 * @returns Promise<DocumentLoader>
 */

const doc = JSON.parse(VerifiableConstants.JSONLD_SCHEMA.W3C_VC_DOCUMENT_2018);

export const cacheLoader = (opts?: Options): DocumentLoader => {
  const cache = new Map<string, RemoteDocument>();
  cache.set(VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018, {
    document: doc,
    documentUrl: VerifiableConstants.JSONLD_SCHEMA.W3C_CREDENTIAL_2018
  });

  return async (url: Url): Promise<RemoteDocument> => {
    let remoteDoc = cache.get(url);
    if (remoteDoc) {
      return remoteDoc;
    }
    remoteDoc = await getDocumentLoader(opts)(url);
    cache.set(url, remoteDoc);
    return remoteDoc;
  };
};
