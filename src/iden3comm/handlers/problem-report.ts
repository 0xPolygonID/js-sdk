import * as uuid from 'uuid';
import { ProblemReportMessage } from '../types/protocol/problem-report';
import { MediaType, PROTOCOL_MESSAGE_TYPE } from '../constants';

/**
 * @beta
 * createProblemReport is a function to create didcomm protocol problem report message
 * @param code - problem report code
 * @param opts - problem report options
 * @returns `ProblemReportMessage`
 */
export function createProblemReport(
  code: string,
  opts?: {
    pthid?: string;
    comment?: string;
    ack?: string[];
    args?: string[];
    escalate_to?: string;
    from?: string;
    to?: string;
  }
): ProblemReportMessage {
  const uuidv4 = uuid.v4();
  return {
    id: uuidv4,
    pthid: opts?.pthid,
    typ: MediaType.PlainMessage,
    type: PROTOCOL_MESSAGE_TYPE.PROBLEM_REPORT_MESSAGE_TYPE,
    ack: opts?.ack,
    body: {
      code: code,
      comment: opts?.comment,
      args: opts?.args,
      escalate_to: opts?.escalate_to
    },
    from: opts?.from,
    to: opts?.to
  };
}

/**
 * @beta
 * @deprecated use createProblemReport
 * createProblemReportMessage is a function to create didcomm protocol problem report message
 * @param pthid - parent thread id
 * @param code - problem report code
 * @param opts - problem report options
 * @returns `ProblemReportMessage`
 */
export function createProblemReportMessage(
  pthid: string,
  code: string,
  opts?: {
    comment?: string;
    ack?: string[];
    args?: string[];
    escalate_to?: string;
    from?: string;
    to?: string;
  }
): ProblemReportMessage {
  return createProblemReport(code, {
    pthid,
    ...opts
  });
}
