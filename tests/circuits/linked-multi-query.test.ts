import {
  LinkedMultiQueryInputs,
  LinkedMultiQueryPubSignals,
  Operators,
  Query
} from '../../src/circuits';
import { IdentityTest, defaultUserClaim, userPK } from './utils';
import inputJson from './data/linked-multi-query-inputs.json';
import { describe, expect, it } from 'vitest';
import { byteDecoder, byteEncoder } from '../../src';

describe('linked-multi-query', () => {
  for (const queriesCount of [3, 5, 10]) {
    it(`TestLinkedMultiQueryInputs_InputsMarshal_${queriesCount}`, async () => {
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

      const inputs = new LinkedMultiQueryInputs(queriesCount);
      inputs.linkNonce = BigInt('35346346369657418');
      inputs.claim = claim;
      inputs.query = [query1, query2, query3];
      const bytesInputs = inputs.inputsMarshal();
      const actualJson = JSON.parse(byteDecoder.decode(bytesInputs));
      const expectedJson = {
        ...inputJson,
        claimPathMtp: inputJson.claimPathMtp.slice(0, queriesCount),
        claimPathMtpNoAux: inputJson.claimPathMtpNoAux.slice(0, queriesCount),
        claimPathMtpAuxHi: inputJson.claimPathMtpAuxHi.slice(0, queriesCount),
        claimPathMtpAuxHv: inputJson.claimPathMtpAuxHv.slice(0, queriesCount),
        claimPathKey: inputJson.claimPathKey.slice(0, queriesCount),
        claimPathValue: inputJson.claimPathValue.slice(0, queriesCount),
        slotIndex: inputJson.slotIndex.slice(0, queriesCount),
        operator: inputJson.operator.slice(0, queriesCount),
        value: inputJson.value.slice(0, queriesCount),
        valueArraySize: inputJson.valueArraySize.slice(0, queriesCount)
      };

      expect(actualJson).to.deep.equal(expectedJson);
    });

    it(`LinkedLinkedMultiQueryPubSignals_CircuitUnmarshal_${queriesCount}`, () => {
      const outs = {
        '3': [
          '11587660915189382633314527098062647837126752531205087409048618395969242885016',
          '0',
          '0',
          '0',
          '0',
          '9458417390459068300741864705379630488534450155484493792325907355745201035449',
          '10864698602219511323750171112812294233505545576258213541845435681330532958075',
          '5365138871441717895206514697230448654236988235704905467582456422975445794731'
        ],
        '5': [
          '20336008450539684768013573494073798243349685857640613070314041678185349736439',
          '1',
          '0',
          '0',
          '0',
          '0',
          '0',
          '3326382892536126749483088946048689911243394580824744244053752370464747528203',
          '9907132056133666096701539062450765284880813426582692863734448403438789333698',
          '13362042977965885903820557513534065802896288300017199700677633721405805677442',
          '13362042977965885903820557513534065802896288300017199700677633721405805677442',
          '13362042977965885903820557513534065802896288300017199700677633721405805677442'
        ],
        '10': [
          '11587660915189382633314527098062647837126752531205087409048618395969242885016',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0',
          '9458417390459068300741864705379630488534450155484493792325907355745201035449',
          '10864698602219511323750171112812294233505545576258213541845435681330532958075',
          '5365138871441717895206514697230448654236988235704905467582456422975445794731',
          '6552534440600411908158043655342660449140617599402291128616319085888035740680',
          '6552534440600411908158043655342660449140617599402291128616319085888035740680',
          '6552534440600411908158043655342660449140617599402291128616319085888035740680',
          '6552534440600411908158043655342660449140617599402291128616319085888035740680',
          '6552534440600411908158043655342660449140617599402291128616319085888035740680',
          '6552534440600411908158043655342660449140617599402291128616319085888035740680',
          '6552534440600411908158043655342660449140617599402291128616319085888035740680'
        ]
      };
      // generate mock Data.
      const out = outs[queriesCount];

      const ao = new LinkedMultiQueryPubSignals(queriesCount);
      ao.pubSignalsUnmarshal(byteEncoder.encode(JSON.stringify(out)));

      expect(ao.linkID).to.deep.equal(BigInt(out[0]));
      expect(ao.merklized).to.deep.equal(parseInt(out[1]));
      expect(ao.operatorOutput).to.deep.equal(out.slice(2, 2 + queriesCount).map(BigInt));
      expect(ao.circuitQueryHash).to.deep.equal(
        out.slice(2 + queriesCount, 2 + queriesCount * 2).map(BigInt)
      );
    });
  }
});
