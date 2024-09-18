export type MessageModel = {
  id: string;
  createdAt: string;
  thid?: string;
  correlationId?: string;
  correlationThid?: string;
  type: string;
  status: 'pending' | 'processed' | 'failed';
  jsonString: string;
};

// message history
// from to
// parent thid
// cred offer request gets new thid
//
