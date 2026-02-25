import { PROTOCOL_MESSAGE_TYPE } from '../../constants';
import { BasicMessage } from '../packer';

/** ProblemReportMessage is struct for problem report message */
export type ProblemReportMessage = BasicMessage & {
  body: ProblemReportMessageBody;
  pthid?: string;
  ack?: string[];
  type: typeof PROTOCOL_MESSAGE_TYPE.PROBLEM_REPORT_MESSAGE_TYPE;
};

/** ProblemReportMessageBody is struct for problem report message body */
export type ProblemReportMessageBody = {
  code: string;
  comment?: string;
  args?: string[];
  escalate_to?: string;
};
