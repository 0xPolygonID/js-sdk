import { ProblemReportMessage } from '../types/protocol/problem-report';
/**
 * @beta
 * createProblemReport is a function to create didcomm protocol problem report message
 * @param code - problem report code
 * @param opts - problem report options
 * @returns `ProblemReportMessage`
 */
export declare function createProblemReport(code: string, opts?: {
    pthid?: string;
    comment?: string;
    ack?: string[];
    args?: string[];
    escalate_to?: string;
    from?: string;
    to?: string;
}): ProblemReportMessage;
/**
 * @beta
 * @deprecated use createProblemReport
 * createProblemReportMessage is a function to create didcomm protocol problem report message
 * @param pthid - parent thread id
 * @param code - problem report code
 * @param opts - problem report options
 * @returns `ProblemReportMessage`
 */
export declare function createProblemReportMessage(pthid: string, code: string, opts?: {
    comment?: string;
    ack?: string[];
    args?: string[];
    escalate_to?: string;
    from?: string;
    to?: string;
}): ProblemReportMessage;
//# sourceMappingURL=problem-report.d.ts.map