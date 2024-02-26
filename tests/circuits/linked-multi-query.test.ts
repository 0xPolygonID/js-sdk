import {
  LinkedMultiQueryInputs,
  LinkedMultiQueryPubSignals,
  Operators,
  Query
} from '../../src/circuits';
import { IdentityTest, defaultUserClaim, userPK } from './utils';
import expectedJson from './data/linked-multi-query-inputs.json';
import { expect } from 'chai';
import { byteDecoder, byteEncoder } from '../../src';

describe('linked-multi-query', () => {
  it('TestLinkedMultiQueryInputs_InputsMarshal', async () => {
    const user = await IdentityTest.newIdentity(userPK);
    const id = user.id;
    const claim = defaultUserClaim(id);

    const query1 = new Query();
    query1.operator = Operators.EQ;
    query1.slotIndex = 2;
    query1.values = [BigInt(10)];

    const query2 = new Query();
    query2.operator = Operators.LT;
    query2.slotIndex = 2;
    query2.values = [BigInt(133)];

    const query3 = new Query();
    query3.operator = Operators.LTE;
    query3.slotIndex = 2;
    query3.values = [BigInt(555)];

    const inputs = new LinkedMultiQueryInputs();
    inputs.linkNonce = BigInt('35346346369657418');
    inputs.claim = claim;
    inputs.query = [query1, query2, query3];
    const bytesInputs = inputs.inputsMarshal();
    const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));

    expect(actualJson).to.deep.equal(expectedJson);
  });

  it('LinkedLinkedMultiQueryPubSignals_CircuitUnmarshal', () => {
    // generate mock Data.
    const out = byteEncoder.encode(
      `[
			"443",
			"1",
			"1",
			"2",
			"3",
			"4",
			"5",
			"0",
			"0",
			"0",
			"0",
			"0",
			"100",
			"200",
			"300",
			"400",
			"500",
			"0",
			"0",
			"0",
			"0",
			"0",
      "1",
			"1",
			"1",
			"1",
			"1",
			"0",
			"0",
			"0",
			"0",
			"0"
		]`
    );

    const ao = new LinkedMultiQueryPubSignals();
    ao.pubSignalsUnmarshal(out);

    const exp = new LinkedMultiQueryPubSignals();
    exp.linkID = BigInt(443);
    exp.merklized = 1;

    const operatorOutput: bigint[] = [];
    const circuitQueryHash: bigint[] = [];
    const valueArraySize: number[] = [];
    for (let i = 1; i <= 10; i++) {
      const indx = i - 1;
      operatorOutput[indx] = BigInt(i);
      circuitQueryHash[indx] = BigInt(i * 100);
      valueArraySize[indx] = 1;

      if (i > 5) {
        operatorOutput[indx] = BigInt(0);
        circuitQueryHash[indx] = BigInt(0);
        valueArraySize[indx] = 0;
      }
    }

    exp.operatorOutput = operatorOutput;
    exp.circuitQueryHash = circuitQueryHash;
    exp.valueArraySize = valueArraySize;

    const expJson = JSON.stringify(exp, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    const actualJson = JSON.stringify(ao, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    expect(expJson).to.deep.equal(actualJson);
  });
});
