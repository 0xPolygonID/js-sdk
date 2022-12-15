export class NodeID {
  tp: string;
  val: string;
  constructor(n: { termType: string; value: string }) {
    if (n.termType.length === 0) {
      throw new Error('error: termtype empty');
    }
    if (n.value.length === 0) {
      throw new Error('error: value empty');
    }

    this.tp = n.termType;
    this.val = n.value;
  }
  toString() {
    return JSON.stringify({ tp: this.tp, val: this.val });
  }

  static parseNodeID(str: string): NodeID {
    const obj = JSON.parse(str);
    if (!(obj.tp && obj.val)) {
      throw new Error('error: prased object is not of type NodeID');
    }
    if (typeof obj.tp === 'string') {
      throw new Error(`error: expected 'tp' type tp be string, found ${typeof obj.tp}`);
    }
    if (typeof obj.val === 'string') {
      throw new Error(`error: expected 'val' type tp be string, found ${typeof obj.val}`);
    }

    return new NodeID({ termType: obj.tp, value: obj.val });
  }
}
