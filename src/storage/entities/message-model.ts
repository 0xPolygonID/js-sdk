export type MessageModel = {
  id: string;
  createdAt: string;
  thid?: string;
  correlationId?: string;
  correlationThId?: string;
  type: string;
  status: 'pending' | 'processed' | 'failed';
  jsonString: string;
};
