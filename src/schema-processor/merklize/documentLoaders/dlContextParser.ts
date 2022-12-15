import 'cross-fetch/polyfill';
import { IDocumentLoader, IJsonLdContext, ERROR_CODES, ErrorCoded } from 'jsonld-context-parser';
import { parse as parseLinkHeader } from 'http-link-header';
import { resolve } from 'relative-to-absolute-iri';

/**
 * Loads documents via the fetch API.
 */
export class FetchDocumentLoader implements IDocumentLoader {
  private readonly fetcher?: (url: string, init: RequestInit) => Promise<Response>;

  constructor(fetcher?: (url: string, init: RequestInit) => Promise<Response>) {
    this.fetcher = fetcher;
  }

  public async load(url: string): Promise<IJsonLdContext> {
    const response: Response = await (this.fetcher || fetch)(url, {
      headers: new Headers({ accept: 'application/json, application/ld+json' })
    });
    if (response.ok && response.headers) {
      let mediaType = response.headers.get('Content-Type');
      if (mediaType) {
        const colonPos = mediaType.indexOf(';');
        if (colonPos > 0) {
          mediaType = mediaType.substr(0, colonPos);
        }
      }
      if (mediaType === 'application/json' || mediaType === 'application/ld+json') {
        // Return JSON-LD if proper content type was returned
        return await response.json();
      } else {
        // Check for alternate link for a non-JSON-LD response
        if (response.headers.has('Link')) {
          let alternateUrl: string | undefined;
          response.headers.forEach((value, key) => {
            if (key === 'link') {
              const linkHeader = parseLinkHeader(value);
              const v1 = linkHeader.get('type', 'application/ld+json');
              const v2 = linkHeader.get('type', 'application/json');
              for (const link of v1 ? v1 : v2) {
                if (link.rel === 'alternate') {
                  if (alternateUrl) {
                    throw new Error('Multiple JSON-LD alternate links were found on ' + url);
                  }
                  alternateUrl = resolve(link.uri, url);
                }
              }
            }
          });
          if (alternateUrl) {
            return this.load(alternateUrl);
          }
        }

        throw new ErrorCoded(
          `Unsupported JSON-LD media type ${mediaType}`,
          ERROR_CODES.LOADING_DOCUMENT_FAILED
        );
      }
    } else {
      throw new Error(response.statusText || `Status code: ${response.status}`);
    }
  }
}
