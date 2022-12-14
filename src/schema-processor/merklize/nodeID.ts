export class NodeID {
  constructor(public tp: string, public val: string) {}
  toString() {
    return JSON.stringify({ tp: this.tp, val: this.val });
  }

  static parseNodeID(str: string) {
    const obj = JSON.parse(str);
    if (!(obj.tp && obj.val)) {
      throw 'error: prased object is not of type NodeID';
    }
    if (typeof obj.tp === 'string') {
      throw `error: expected 'tp' type tp be string, found ${typeof obj.tp}`;
    }
    if (typeof obj.val === 'string') {
      throw `error: expected 'val' type tp be string, found ${typeof obj.val}`;
    }

    return new NodeID(obj.to, obj.val);
  }
}
export const newNodeId = (n: { termType: string; value: string }): NodeID => {
  if (!n) {
    throw 'error: node is null';
  }

  if (!n.value) {
    throw 'error: node value.ts is undefined';
  }

  return new NodeID(n.termType, n.value);
};
