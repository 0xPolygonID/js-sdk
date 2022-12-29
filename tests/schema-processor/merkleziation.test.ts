import {
  entriesFromRDF,
  getDataSet,
  merkelizeJSONLD
} from '../../src/schema-processor/merklize/merkelizer';
import { cred_v1, cred_v2, testDocument } from './data/data';
import { DEFAULT_HASHER } from '../../src/schema-processor/merklize/constants';
import {
  newFieldPathFromCtx,
  newPath,
  newPathFromCtx,
  newPathFromDocument
} from '../../src/schema-processor/merklize/internal/path';
import {
  addEntriesToMerkleTree,
  getMerkleTreeInitParam,
  mkValueMtEntry
} from '../../src/schema-processor/merklize/internal/merkleTree';
import { newRDFEntry } from '../../src/schema-processor/merklize/internal/rdfEntry';
import { Merkletree, verifyProof } from '@iden3/js-merkletree';

jest.setTimeout(50 * 60_00);

describe('tests merkelization', () => {
  it('checks dataset creation', async () => {
    const dataSet = await getDataSet(testDocument);
    const res = await entriesFromRDF(dataSet, DEFAULT_HASHER);
  });

  it('new path creation from document', async () => {
    const docStr = JSON.stringify(cred_v1);
    const p = `VerifiableCredential.credentialSchema.JsonSchemaValidator2018`;

    const path = await newPathFromCtx(docStr, p);
    const expPath = newPath([
      'https://www.w3.org/2018/credentials#VerifiableCredential',
      'https://www.w3.org/2018/credentials#credentialSchema',
      'https://www.w3.org/2018/credentials#JsonSchemaValidator2018'
    ]);

    path.parts.forEach((p, i) => {
      expect(p).toEqual(expPath.parts[i]);
    });
  });

  it('new field path from document context', async () => {
    const docStr = JSON.stringify(cred_v2);
    const typ = 'KYCAgeCredential';
    const fieldPath = 'birthday';

    const res = await newFieldPathFromCtx(docStr, typ, fieldPath);

    const expPath = newPath([
      'https://github.com/iden3/claim-schema-vocab/blob/main/credentials/kyc.md#birthday'
    ]);

    res.parts.forEach((p, i) => {
      expect(p).toEqual(expPath.parts[i]);
    });
  });

  it('new path from document', async () => {
    const docStr = JSON.stringify(testDocument);
    const inp = 'credentialSubject.1.birthDate';
    const ldCTX = null;

    const res = await newPathFromDocument(ldCTX, docStr, inp);
    const expPath = newPath([
      'https://www.w3.org/2018/credentials#credentialSubject',
      1,
      'http://schema.org/birthDate'
    ]);

    res.parts.forEach((p, i) => {
      expect(p).toEqual(expPath.parts[i]);
    });
  });

  it('test proof', async () => {
    const dataSet = await getDataSet(testDocument);

    const entries = await entriesFromRDF(dataSet, DEFAULT_HASHER);

    const { db, writable, maxLevels } = getMerkleTreeInitParam();
    const mt = new Merkletree(db, writable, maxLevels);
    await addEntriesToMerkleTree(mt, entries);

    const path = newPath([
      'https://www.w3.org/2018/credentials#credentialSubject',
      0,
      'http://schema.org/birthDate'
    ]);

    const birthDate = new Date(Date.UTC(1958, 6, 17, 0, 0, 0, 0));
    const entry = newRDFEntry(path, birthDate);

    const { k, v } = await entry.getKeyValueMTEntry();
    const { proof } = await mt.generateProof(k);

    const ok = await verifyProof(mt.root, proof, k, v);
    expect(ok).toBeTruthy();
  });

  it('test proof integer', async () => {
    const dataSet = await getDataSet(testDocument);
    const entries = await entriesFromRDF(dataSet, DEFAULT_HASHER);

    const { db, writable, maxLevels } = getMerkleTreeInitParam();
    const mt = new Merkletree(db, writable, maxLevels);
    await addEntriesToMerkleTree(mt, entries);

    const path = newPath(['http://schema.org/identifier']);

    const entry = newRDFEntry(path, 83627465);

    const { k, v } = await entry.getKeyValueMTEntry();
    const { proof } = await mt.generateProof(k);

    const ok = await verifyProof(mt.root, proof, k, v);
    expect(ok).toBeTruthy();
  });

  it('test merkelizer with path as a Path', async () => {
    const mz = await merkelizeJSONLD(JSON.stringify(testDocument));
    const path = newPath([
      'https://www.w3.org/2018/credentials#credentialSubject',
      1,
      'http://schema.org/birthDate'
    ]);
    const { proof, value } = await mz.proof(path);

    const pathMTEntry = await path.mtEntry();

    expect(value).toBeInstanceOf(Date);
    const valueD = value as Date;

    const birthDate = new Date(Date.UTC(1958, 6, 18, 0, 0, 0, 0));
    expect(birthDate.toUTCString()).toEqual(valueD.toUTCString());

    const valueMTEntry = await mkValueMtEntry(DEFAULT_HASHER, valueD);
    const ok = verifyProof(mz.mt!.root, proof, pathMTEntry, valueMTEntry);
    expect(ok).toBeTruthy();

    expect(mz.root().hex()).toEqual(
      'd001de1d1b74d3b24b394566511da50df18532264c473845ea51e915a588b02a'
    );
  });

  it('test merkelizer with path as shortcut string', async () => {
    const mz = await merkelizeJSONLD(JSON.stringify(testDocument));
    const path = await mz.resolveDocPath('credentialSubject.1.birthCountry');

    const { proof, value } = await mz.proof(path);

    const pathMTEntry = await path.mtEntry();

    expect(typeof value).toEqual('string');
    const valueStr = value as string;
    expect(valueStr).toEqual('Bahamas');

    const valueMTEntry = await mkValueMtEntry(DEFAULT_HASHER, valueStr);
    const ok = verifyProof(mz.root(), proof, pathMTEntry, valueMTEntry);
    expect(ok).toBeTruthy();

    expect(mz.root().hex()).toEqual(
      'd001de1d1b74d3b24b394566511da50df18532264c473845ea51e915a588b02a'
    );
  });
});
