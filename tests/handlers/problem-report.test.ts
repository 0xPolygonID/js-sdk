import { createProblemReportMessage } from '../../src';
import { describe, expect, it, beforeEach } from 'vitest';

describe('Problem Report Handler', () => {
  it('should create problem report', () => {
    const example = `{
        "typ": "application/iden3comm-plain-json",
        "type": "https://didcomm.org/report-problem/2.0/problem-report",
        "pthid": "5333207e-7338-4ab3-ac34-bf9a20dab6ab",
        "ack": [
            "23b610b3-aec8-4d1c-8a75-3b22e5483fb0",
            "86fe7cc6-adcd-4530-8e07-92c060b427c8"
        ],
        "body": {
            "code": "e.me.remote-server-down",
            "comment": "Remote server {1} is down when connecting from {2}",
            "args": [
                "https://remote-server.org",
                "https://my-server.org"
            ],
            "escalate_to": "admin@remote-server.org"
        },
        "from": "did:polygonid:polygon:mumbai:2qJG6RYgN1u6v7JAYSdfixSwktnZ7hMzd4t21SCdNu",
        "to": "did:polygonid:polygon:mumbai:2qFroxB5kwgCxgVrNGUM6EW3khJgCdHHnKTr3VnTcp"
    }`;
    const problemReport = createProblemReportMessage(
      '5333207e-7338-4ab3-ac34-bf9a20dab6ab',
      'e.me.remote-server-down',
      {
        from: 'did:polygonid:polygon:mumbai:2qJG6RYgN1u6v7JAYSdfixSwktnZ7hMzd4t21SCdNu',
        to: 'did:polygonid:polygon:mumbai:2qFroxB5kwgCxgVrNGUM6EW3khJgCdHHnKTr3VnTcp',
        args: ['https://remote-server.org', 'https://my-server.org'],
        escalate_to: 'admin@remote-server.org',
        ack: ['23b610b3-aec8-4d1c-8a75-3b22e5483fb0', '86fe7cc6-adcd-4530-8e07-92c060b427c8'],
        comment: 'Remote server {1} is down when connecting from {2}'
      }
    );
    // Remove the id field if it exists to match the expected format
    if ('id' in problemReport) {
      delete (problemReport as any)['id'];
    }
    const expected = JSON.parse(example);
    expect(problemReport).to.be.deep.equal(expected);
  });
});
