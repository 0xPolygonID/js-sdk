import { JsonDocumentObject } from '../iden3comm';
import {
  CredentialStatusType,
  DisplayMethod,
  MerklizedRootPosition,
  RefreshService,
  SubjectPosition
} from '../verifiable';

/**
 * Represents the publish mode for identity wallet.
 * It can be one of the following values: 'sync', 'async', or 'callback'.
 * 'sync' - publish the status synchronously
 * 'async' - publish the status asynchronously via message bus
 * 'callback' - publish the status with a txCallback
 */
export type PublishMode = 'sync' | 'async' | 'callback';

/**
 * Request to core library to create Core Claim from W3C Verifiable Credential
 *
 * @public
 * @interface CredentialRequest
 */
export interface CredentialRequest {
  /**
   * JSON credential schema
   */
  credentialSchema: string;
  /**
   * Credential type
   */
  type: string;
  /**
   * Credential subject, usually contains claims and identifier
   */
  credentialSubject: JsonDocumentObject;
  /**
   * expiration time
   */
  expiration?: number;
  /**
   * refreshService
   */
  refreshService?: RefreshService;
  /**
   * displayMethod
   */
  displayMethod?: DisplayMethod;
  /**
   * optional custom context (for not iden3 refres service or display method)
   */
  context?: string[];
  /**
   * claim version
   */
  version?: number;

  /**
   * subject position (index / value / none)
   */
  subjectPosition?: SubjectPosition;
  /**
   * merklizedRootPosition (index / value / none)
   */
  merklizedRootPosition?: MerklizedRootPosition;

  /**
   * Revocation options
   *
   * @type {{
   *     id: string;
   *     nonce?: number;
   *     type: CredentialStatusType;
   *     issuerState?: string;
   *   }}
   * @memberof CredentialRequest
   */
  revocationOpts: {
    id: string;
    nonce?: number;
    type: CredentialStatusType;
    issuerState?: string;
  };
}
