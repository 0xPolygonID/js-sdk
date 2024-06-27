import { BasicMessage } from '../packer';

/** InvitationMessage represent didcomm invitation message with iden3comm message attachments */
export type InvitationMessage = BasicMessage & {
  body: InvitationMessageResponseBody;
  from: string;
  attachments: {
    id: string;
    media_type: string;
    data: {
      json: BasicMessage;
    };
  }[];
};

export type InvitationMessageResponseBody = {
  goal_code: string;
  goal: string;
  accept: string[];
};
