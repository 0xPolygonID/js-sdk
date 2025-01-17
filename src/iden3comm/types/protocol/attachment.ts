import { MediaType } from '../../constants';

export type Attachment = {
  id: string;
  description?: string;
  media_type: MediaType;
  data: AttachData;
};

export type AttachData = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any;
};
