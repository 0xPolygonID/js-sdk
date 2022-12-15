import { Iri } from 'jsonld/jsonld-spec';
import { NodeID } from './nodeID';
import { Quad } from 'n3';

export class QuadKey {
  constructor(public subjectID: NodeID, public predicate: Iri) {}

  toString(): string {
    return JSON.stringify({ subjecID: this.subjectID, val: this.predicate });
  }

  static parseQuadKey(str: string): QuadKey {
    const obj = JSON.parse(str);
    if (!(obj.subjectID && obj.predicate)) {
      throw new Error('error: prased object is not of type QuadKey');
    }
    if (typeof obj.predicate === 'string') {
      throw new Error(`error: expected 'predicate' type tp be string, found ${typeof obj.tp}`);
    }

    return new QuadKey(NodeID.parseNodeID(obj.subjectID), obj.predicate);
  }
}

export const getQuadKey = (q: Quad): QuadKey => {
  if (!q) {
    throw new Error('error: quad is empty');
  }

  const subjectID = new NodeID(q.subject);

  const p = q.predicate;
  if (!p) {
    throw new Error('error: predicate is empty');
  }
  return new QuadKey(subjectID, p.value);
};
