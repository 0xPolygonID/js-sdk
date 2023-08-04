import { IDataSource } from '../interfaces/data-source';
/**
 * Generic Memory Data Source
 *
 * @public
 * @class InMemoryDataSource - class
 * @template Type
 */
export declare class InMemoryDataSource<Type> implements IDataSource<Type> {
    private _data;
    /** saves in the memory */
    save(key: string, value: Type, keyName?: string): Promise<void>;
    /** gets value from from the memory */
    get(key: string, keyName?: string): Promise<Type | undefined>;
    /** loads from value from the memory */
    load(): Promise<Type[]>;
    /** deletes from value from the memory */
    delete(key: string, keyName?: string): Promise<void>;
}
