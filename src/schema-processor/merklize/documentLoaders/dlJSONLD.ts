'use strict';

import { RemoteDocument, Url } from 'jsonld/jsonld-spec';
import 'cross-fetch/polyfill';
import https from 'https';
import http from 'http';
import { parseLinkHeader } from 'jsonld/lib/util';
import { LINK_HEADER_CONTEXT } from 'jsonld/lib/constants';
import JsonLdError from 'jsonld/lib/JsonLdError';
import { prependBase } from 'jsonld/lib/url';

/**
 * Creates a built-in node document loader.
 *
 * @param options the options to use:
 *          [secure]: require all URLs to use HTTPS. (default: false)
 *          [strictSSL]: true to require SSL certificates to be valid,
 *            false not to. (default: true)
 *          [maxRedirects]: the maximum number of redirects to permit.
 *            (default: none)
 *          [headers]: an object (map) of headers which will be passed as
 *            request headers for the requested document. Accept is not
 *            allowed. (default: none).
 *          [httpAgent]: a Node.js `http.Agent` to use with 'http' requests.
 *            (default: none)
 *          [httpsAgent]: a Node.js `https.Agent` to use with 'https' requests.
 *            (default: An agent with rejectUnauthorized to the strictSSL
 *            value.ts)
 *
 * @return the node document loader.
 */
export class JsonLDLoader {
  httpAgent;
  httpsAgent = null;

  constructor(
    public readonly secure = false,
    public readonly strictSSL = true,
    public readonly maxRedirects = -1,
    public headers = {}
  ) {
    // if no default user-agent header, copy headers and set one
    if (!('user-agent' in this.headers)) {
      this.headers = Object.assign({}, headers, {
        'user-agent': 'jsonld.js'
      });
    }
  }

  async loadDocument(url, redirects = []) {
    const isHttp = url.startsWith('http:');
    const isHttps = url.startsWith('https:');
    if (!isHttp && !isHttps) {
      throw new JsonLdError(
        'URL could not be dereferenced; only "http" and "https" URLs are ' + 'supported.',
        'jsonld.InvalidUrl',
        { code: 'loading document failed', url }
      );
    }
    if (this.secure && !isHttps) {
      throw new JsonLdError(
        'URL could not be dereferenced; secure mode is enabled and ' +
          'the URL\'s scheme is not "https".',
        'jsonld.InvalidUrl',
        { code: 'loading document failed', url }
      );
    }
    // TODO: disable cache until HTTP caching implemented
    let doc = null; //cache.get(url);
    if (doc !== null) {
      return doc;
    }

    let alternate = null;

    const { res, body } = await _fetch({
      url,
      headers: this.headers,
      strictSSL: this.strictSSL,
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent
    });
    doc = { contextUrl: null, documentUrl: url, document: body || null };

    // handle error
    const statusText = http.STATUS_CODES[res.status];
    if (res.status >= 400) {
      throw new JsonLdError(
        `URL "${url}" could not be dereferenced: ${statusText}`,
        'jsonld.InvalidUrl',
        {
          code: 'loading document failed',
          url,
          httpStatusCode: res.status
        }
      );
    }
    const link = res.headers.get('link');
    let location = res.headers.get('location');
    const contentType = res.headers.get('content-type');

    // handle Link Header
    if (link && contentType !== 'application/ld+json' && contentType !== 'application/json') {
      // only 1 related link header permitted
      const linkHeaders = parseLinkHeader(link);
      const linkedContext = linkHeaders[LINK_HEADER_CONTEXT];
      if (Array.isArray(linkedContext)) {
        throw new JsonLdError(
          'URL could not be dereferenced, it has more than one associated ' + 'HTTP Link Header.',
          'jsonld.InvalidUrl',
          { code: 'multiple context link headers', url }
        );
      }
      if (linkedContext) {
        doc.contextUrl = linkedContext.target;
      }

      // "alternate" link header is a redirect
      alternate = linkHeaders.alternate;
      if (
        alternate &&
        alternate.type == 'application/ld+json' &&
        !(contentType || '').match(/^application\/(\w*\+)?json$/)
      ) {
        location = prependBase(url, alternate.target);
      }
    }

    // handle redirect
    if ((alternate || (res.status >= 300 && res.status < 400)) && location) {
      if (redirects.length === this.maxRedirects) {
        throw new JsonLdError(
          'URL could not be dereferenced; there were too many redirects.',
          'jsonld.TooManyRedirects',
          {
            code: 'loading document failed',
            url,
            httpStatusCode: res.status,
            redirects
          }
        );
      }
      if (redirects.indexOf(url) !== -1) {
        throw new JsonLdError(
          'URL could not be dereferenced; infinite redirection was detected.',
          'jsonld.InfiniteRedirectDetected',
          {
            code: 'recursive context inclusion',
            url,
            httpStatusCode: res.status,
            redirects
          }
        );
      }
      redirects.push(url);
      // location can be relative, turn into full url
      const nextUrl = new URL(location, url).href;
      return this.loadDocument(nextUrl, redirects);
    }

    // cache for each redirected URL
    redirects.push(url);
    // TODO: disable cache until HTTP caching implemented
    /*
    for(let i = 0; i < redirects.length; ++i) {
      cache.set(
        redirects[i],
        {contextUrl: null, documentUrl: redirects[i], document: body});
    }
    */

    return doc;
  }
}

async function _fetch({ url, headers, strictSSL, httpAgent, httpsAgent }) {
  try {
    const options: {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      headers: any;
      redirect: RequestRedirect;
      throwHttpErrors: boolean;
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      agent?: any;
    } = {
      headers,
      redirect: 'manual',
      // ky specific to avoid redirects throwing
      throwHttpErrors: false
    };
    const isHttps = url.startsWith('https:');
    if (isHttps) {
      options.agent = httpsAgent || new https.Agent({ rejectUnauthorized: strictSSL });
    } else {
      if (httpAgent) {
        options.agent = httpAgent;
      }
    }
    const res = await fetch(url, { headers, redirect: options.redirect });
    const body = await res.text();
    return { res, body };
  } catch (e) {
    // HTTP errors have a response in them
    // ky considers redirects HTTP errors
    if (e.response) {
      return { res: e.response, body: null };
    }
    throw new JsonLdError(
      'URL could not be dereferenced, an error occurred.',
      'jsonld.LoadDocumentError',
      { code: 'loading document failed', url, cause: e }
    );
  }
}

export const getJsonLdDocLoader = () => {
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  const docLoader = (url: Url, callback: (err: Error, remoteDoc: RemoteDocument) => void) => {
    const loader = new JsonLDLoader();
    return loader.loadDocument(url) as Promise<RemoteDocument>;
  };
  return docLoader;
};
