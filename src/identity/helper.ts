import { Iden3Credential, MerklizedRootPosition, Schema, SubjectPosition } from '../schema-processor';
import { DID, Id } from '@iden3/js-iden3-core';
import { defineMerklizedRootPosition } from './common';
import { models } from '../constants';

export interface ClaimRequest {
	credentialSchema: string;
	type: string;
	credentialSubject: { [key: string]: any };
	expiration?: number;
	version: number;
	revNonce: number;
	subjectPosition?: SubjectPosition;
	merklizedRootPosition?: MerklizedRootPosition;
}

export const createIden3Credential = (issuer: Id, request: ClaimRequest, schema: Schema): Iden3Credential => {
	const context = [
		models.W3CCredentialSchemaURL2018,
		models.Iden3CredentialSchemaURL,
		schema.$metadata.uris['jsonLdContext']
	];
	const credentialType = [
		models.W3CVerifiableCredential,
		models.Iden3Credential,
		request.type
	];
	
	const merklizedRootPosition = defineMerklizedRootPosition(schema.$metadata, request.merklizedRootPosition);
	
	const expirationDate = request.expiration;
	const issuanceDate = Date.now();
	const issuerDID = DID.parseFromId(issuer);
	const credentialSubject = request.credentialSubject;
	credentialSubject['type'] = request.type;
	
	const cr = new Iden3Credential();
	cr.id = 'some id'; // url?
	cr['@context'] = context;
	cr.type = credentialType;
	cr.expirationDate = expirationDate;
	cr.issuanceDate = issuanceDate;
	cr.updatable = true;
	cr.version = request.version;
	cr.revNonce = request.revNonce;
	cr.credentialSubject = credentialSubject;
	cr.subjectPosition = request.subjectPosition;
	cr.merklizedRootPosition = merklizedRootPosition;
	cr.issuer = issuerDID.toString();
	cr.credentialSchema = {
		type: request.credentialSchema,
		id: models.AuthBJJCredentialURL // confirm
	};
	
	return cr;
};
