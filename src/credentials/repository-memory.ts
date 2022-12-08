import { IRepository, RepositoryError } from './repository';
import { W3CCredential } from '../schema-processor';
import { ProofQuery } from '../proof';
import { createFiltersForCredentials } from './utils';

export class RepositoryInMemory implements IRepository {
	_data: {
		[v in string]: W3CCredential[]
	};
	constructor(
		private secret: string = 'main'
	) {
		this._data = {};
		this._data[secret] = [];
	}
	
	get data() {
		return this._data[this.secret];
	}
	
	set data(v) {
		this._data[this.secret] = v;
	}
	
	async list(): Promise<W3CCredential[]> {
		return this.data;
	}
	
	async save(credential: W3CCredential): Promise<void> {
		// todo check if present the same id before save
		this._data[this.secret].push(credential);
	}
	
	async saveAll(credentials: W3CCredential[]): Promise<void> {
		this._data[this.secret].push(...credentials);
	}
	
	async remove(id: string): Promise<void> {
		const newData = this.data.filter((credential) => credential.id !== id);
		
		if(newData.length === this.data.length) {
			throw new Error(RepositoryError.NotFoundCredentialForRemove);
		}
		
		this.data = newData;
	}
	
	async findById(id:string): Promise<W3CCredential | undefined> {
		return this.data.find((cred) => cred.id === id);
	}
	
	async findByQuery(query: ProofQuery): Promise<W3CCredential[]> {
		const filters = createFiltersForCredentials(query);
		return this.data.filter((credential) => filters.every((f) => f(credential)));
	}
}
