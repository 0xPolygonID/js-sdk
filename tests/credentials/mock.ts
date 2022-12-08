import { W3CCredential } from '../../src/schema-processor';

export const createTestCredential = (credData: object) => {
	const cred: W3CCredential = new W3CCredential();
	Object.assign(cred, credData);
	return cred;
};

export const cred1 = createTestCredential({
	id: 'test1',
	'@context': [
		'context1',
		'context2',
		'context3',
	],
	credentialSchema: {
		id: 'credentialSchemaId',
		type: 'credentialSchemaType',
	},
	proof: ['some proof'],
	type: [
		'type1_1',
		'type1_2',
		'type1_3',
	],
	credentialStatus: {},
	issuer: 'issuer1',
	credentialSubject: {
		birthday: 20000101
	},
	expirationDate: '2023-11-11',
	issuanceDate: '2022-11-11',
});

export const cred2 = createTestCredential({
	id: 'test2',
	'@context': [
		'context2_1',
		'context2_2',
		'context2_3',
	],
	credentialSchema: {
		id: 'credentialSchemaId',
		type: 'credentialSchemaType',
	},
	proof: ['some proof2'],
	type: [
		'type2_1',
		'type2_2',
		'type2_3',
	],
	credentialStatus: {},
	issuer: 'issuer2',
	credentialSubject: {
		birthday: 20000101
	},
	expirationDate: '2023-11-11',
	issuanceDate: '2022-11-11',
});

export const cred3 = createTestCredential({
	id: 'test3',
	'@context': [
		'context3_1',
		'context3_2',
		'context3_3',
	],
	credentialSchema: {
		id: 'credentialSchemaId',
		type: 'credentialSchemaType',
	},
	proof: ['some proof3'],
	type: [
		'type3_1',
		'type3_2',
		'type3_3',
	],
	credentialStatus: {},
	issuer: 'issuer3',
	credentialSubject: {
		countryCode: 120
	},
	expirationDate: '2023-11-11',
	issuanceDate: '2022-11-11',
});
