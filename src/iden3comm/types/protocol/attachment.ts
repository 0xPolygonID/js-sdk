import { JsonDocumentObject } from '../packer';

export type Attachment = {
  id: string;
  description?: string;
  media_type?: string;
  data: AttachData;
};

export type AttachData = {
  json: JsonDocumentObject;
};
