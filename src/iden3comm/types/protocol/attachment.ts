import { MediaType } from '../../constants';
import { JsonDocumentObject } from '../packer';

export type Attachment = {
  id: string;
  description?: string;
  media_type: MediaType;
  data: AttachData;
};

export type AttachData = {
  json: JsonDocumentObject;
};
