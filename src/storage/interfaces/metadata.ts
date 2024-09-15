import { Metadata } from '../entities/metadata';
import { IDataSource } from './data-source';

export interface IMetadataStorage extends IDataSource<Metadata> {
  getUnprocessedMetadataForThreadIdAndPurpose(thid: string, purpose: string): Promise<Metadata[]>;
}
