import { W3CCredential } from '../schema-processor';
import { ProofQuery } from '../proof';

export enum RepositoryError {
	NotDefinedQueryKey = 'not defined query key',
	NotDefinedComparator = 'not defined comparator',
	NotFoundCredentialForRemove = 'not found credential for delete',
}
export interface IRepository {
	save(credential: W3CCredential): Promise<void>;
	saveAll(credentials: W3CCredential[]): Promise<void>;
	list(): Promise<W3CCredential[]>;
	remove(id: string): Promise<void>;
	findByQuery(query: ProofQuery): Promise<W3CCredential[]>;
	findById(id: string): Promise<W3CCredential | undefined>;
}

export const comparatorOptions = {
	// todo check $noop operator
	$noop: (a, b) => true,
	$eq: (a, b) => a === b,
	$in: (a: string, b: string[]) => b.includes(a),
	$nin: (a: string, b: string[]) => !b.includes(a),
	$gt: (a: number, b: number) => a > b,
	$lt: (a: number, b: number) => a < b,
};


