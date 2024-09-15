export type Metadata = {
  id: string;
  date: string;
  thid: string;
  type: 'directive';
  purpose: string;
  status: 'pending' | 'completed' | 'failed' | 'not applicable';
  jsonString: string;
};
