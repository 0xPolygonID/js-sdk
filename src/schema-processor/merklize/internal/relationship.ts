import { Iri } from 'jsonld/jsonld-spec';
import { Hasher } from '../types';
import { DEFAULT_HASHER } from '../constants';
import { NamedNode, Quad, Variable } from 'n3';
import { Path } from './path';
import { NodeId } from './node';

import { getQuadKey, QuadKey } from './quadKey';

class Relationship {
  constructor(
    // string should be derived from instance of NodeID for the below maps
    public parents: Map<string, QuadKey> = new Map(),
    public children: Map<string, Map<Iri, Array<NodeId>>> = new Map(),
    public hasher: Hasher = DEFAULT_HASHER
  ) {}

  getParent(k: NodeId): QuadKey | undefined {
    return this.parents.get(k.toString());
  }

  setParent(k: NodeId, v: QuadKey): void {
    this.parents.set(k.toString(), v);
  }

  getChildren(k: NodeId): Map<string, NodeId[]> | undefined {
    return this.children.get(k.toString());
  }

  setChildren(k: NodeId, v: Map<Iri, Array<NodeId>>): void {
    this.children.set(k.toString(), v);
  }

  path(n: Quad, idx: number): Path {
    const k = new Path();

    const subID = new NodeId(n.subject);

    let predicate: NamedNode | Variable;

    switch (n.predicate.termType) {
      case 'NamedNode':
      case 'Variable':
        if (!n.predicate.value) {
          throw new Error('predicate is full');
        }
        predicate = n.predicate;
        break;
      default:
        throw new Error("unexpected quad's predicate type");
    }

    if (!isNaN(idx)) {
      k.append([idx]);
    }

    k.append([predicate.value]);

    let nextKey = subID;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const parent = this.getParent(nextKey);
      if (!parent) {
        break;
      }
      const termChildren = this.getChildren(parent.subjectID);
      const children = termChildren.get(parent.predicate) ?? [];

      if (children.length === 1) {
        k.append([parent.predicate]);
      } else {
        let found = false;
        for (let i = 0; i < children.length; i += 1) {
          const c = children[i];
          if (c.toString() === nextKey.toString()) {
            found = true;
            k.append([i, parent.predicate]);
            break;
          }
        }
        if (!found) {
          throw new Error("error: [assertion] child not found in parent's relations");
        }
      }
      nextKey = parent.subjectID;
    }
    k.reverse();
    return k;
  }
}

export const newRelationship = async (
  quads: Array<Quad>,
  hasher: Hasher
): Promise<Relationship> => {
  const r = new Relationship(new Map(), new Map(), hasher ? hasher : DEFAULT_HASHER);

  const subjectSet: Map<string, number> = new Map();
  quads.forEach((q) => {
    const subjID = new NodeId(q.subject);
    subjectSet.set(subjID.toString(), 0);
  });

  quads.forEach((q) => {
    const objID = new NodeId(q.object);
    if (subjectSet.has(objID.toString())) {
      const qk = getQuadKey(q);
      r.setParent(objID, qk);
      let termChildren = r.getChildren(qk.subjectID);
      if (!termChildren) {
        termChildren = new Map();
      }
      termChildren.set(
        qk.predicate,
        termChildren.has(qk.predicate)
          ? [...(termChildren.get(qk.predicate) ?? []), objID]
          : [objID]
      );
      r.setChildren(qk.subjectID, termChildren);
    }
  });

  return r;
};
