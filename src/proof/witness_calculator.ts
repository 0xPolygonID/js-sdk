export async function witnessBuilder(code, options?) {
  options = options || {};

  const wasmModule = await WebAssembly.compile(code);

  const instance = await WebAssembly.instantiate(wasmModule, {
    runtime: {
      exceptionHandler: function (code) {
        let errStr;
        if (code == 1) {
          errStr = 'Signal not found. ';
        } else if (code == 2) {
          errStr = 'Too many signals set. ';
        } else if (code == 3) {
          errStr = 'Signal already set. ';
        } else if (code == 4) {
          errStr = 'Assert Failed. ';
        } else if (code == 5) {
          errStr = 'Not enough memory. ';
        } else {
          errStr = 'Unknown error\n';
        }
        // get error message from wasm
        errStr += getMessage();
        throw new Error(errStr);
      },
      showSharedRWMemory: function () {
        printSharedRWMemory();
      }
    }
  });

  const sanityCheck = options;

  return new WitnessCalculator(instance, sanityCheck);

  function getMessage() {
    let message = '';
    let c = (instance.exports as any as any).getMessageChar();
    while (c !== 0) {
      message += String.fromCharCode(c);
      c = (instance.exports as any).getMessageChar();
    }
    return message;
  }

  function printSharedRWMemory() {
    const shared_rw_memory_size = (instance.exports as any).getFieldNumLen32();
    const arr = new Uint32Array(shared_rw_memory_size);
    for (let j = 0; j < shared_rw_memory_size; j++) {
      arr[shared_rw_memory_size - 1 - j] = (instance.exports as any).readSharedRWMemory(j);
    }
  }
}

class WitnessCalculator {
  public instance: any;
  public version: any;
  public n32: any;
  public prime: any;
  public witnessSize: any;
  public sanityCheck: any;

  constructor(instance, sanityCheck) {
    this.instance = instance;

    this.version = (this.instance.exports as any).getVersion();
    this.n32 = (this.instance.exports as any).getFieldNumLen32();

    (this.instance.exports as any).getRawPrime();
    const arr = new Array(this.n32);
    for (let i = 0; i < this.n32; i++) {
      arr[this.n32 - 1 - i] = (this.instance.exports as any).readSharedRWMemory(i);
    }
    this.prime = fromArray32(arr);

    this.witnessSize = (this.instance.exports as any).getWitnessSize();

    this.sanityCheck = sanityCheck;
  }

  circom_version() {
    return (this.instance.exports as any).getVersion();
  }

  async _doCalculateWitness(input, sanityCheck) {
    //input is assumed to be a map from signals to arrays of bigints
    (this.instance.exports as any).init(this.sanityCheck || sanityCheck ? 1 : 0);
    const keys = Object.keys(input);
    keys.forEach((k) => {
      const h = fnvHash(k);
      const hMSB = parseInt(h.slice(0, 8), 16);
      const hLSB = parseInt(h.slice(8, 16), 16);
      const fArr = flatArray(input[k]);
      for (let i = 0; i < fArr.length; i++) {
        const arrFr = toArray32(fArr[i], this.n32);
        for (let j = 0; j < this.n32; j++) {
          (this.instance.exports as any).writeSharedRWMemory(j, arrFr[this.n32 - 1 - j]);
        }
        try {
          (this.instance.exports as any).setInputSignal(hMSB, hLSB, i);
        } catch (err) {
          throw new Error(err as string);
        }
      }
    });
  }

  async calculateWitness(input, sanityCheck) {
    const w: any[] = [];

    await this._doCalculateWitness(input, sanityCheck);

    for (let i = 0; i < this.witnessSize; i++) {
      (this.instance.exports as any).getWitness(i);
      const arr = new Uint32Array(this.n32);
      for (let j = 0; j < this.n32; j++) {
        arr[this.n32 - 1 - j] = (this.instance.exports as any).readSharedRWMemory(j);
      }
      w.push(fromArray32(arr));
    }

    return w;
  }

  async calculateBinWitness(input, sanityCheck) {
    const buff32 = new Uint32Array(this.witnessSize * this.n32);
    const buff = new Uint8Array(buff32.buffer);
    await this._doCalculateWitness(input, sanityCheck);

    for (let i = 0; i < this.witnessSize; i++) {
      (this.instance.exports as any).getWitness(i);
      const pos = i * this.n32;
      for (let j = 0; j < this.n32; j++) {
        buff32[pos + j] = (this.instance.exports as any).readSharedRWMemory(j);
      }
    }

    return buff;
  }

  async calculateWTNSBin(input, sanityCheck) {
    const buff32 = new Uint32Array(this.witnessSize * this.n32 + this.n32 + 11);
    const buff = new Uint8Array(buff32.buffer);
    await this._doCalculateWitness(input, sanityCheck);

    //"wtns"
    buff[0] = 'w'.charCodeAt(0);
    buff[1] = 't'.charCodeAt(0);
    buff[2] = 'n'.charCodeAt(0);
    buff[3] = 's'.charCodeAt(0);

    //version 2
    buff32[1] = 2;

    //number of sections: 2
    buff32[2] = 2;

    //id section 1
    buff32[3] = 1;

    const n8 = this.n32 * 4;
    //id section 1 length in 64bytes
    const idSection1length = 8 + n8;
    const idSection1lengthHex = idSection1length.toString(16);
    buff32[4] = parseInt(idSection1lengthHex.slice(0, 8), 16);
    buff32[5] = parseInt(idSection1lengthHex.slice(8, 16), 16);

    //this.n32
    buff32[6] = n8;

    //prime number
    (this.instance.exports as any).getRawPrime();

    let pos = 7;
    for (let j = 0; j < this.n32; j++) {
      buff32[pos + j] = (this.instance.exports as any).readSharedRWMemory(j);
    }
    pos += this.n32;

    // witness size
    buff32[pos] = this.witnessSize;
    pos++;

    //id section 2
    buff32[pos] = 2;
    pos++;

    // section 2 length
    const idSection2length = n8 * this.witnessSize;
    const idSection2lengthHex = idSection2length.toString(16);
    buff32[pos] = parseInt(idSection2lengthHex.slice(0, 8), 16);
    buff32[pos + 1] = parseInt(idSection2lengthHex.slice(8, 16), 16);

    pos += 2;
    for (let i = 0; i < this.witnessSize; i++) {
      (this.instance.exports as any).getWitness(i);
      for (let j = 0; j < this.n32; j++) {
        buff32[pos + j] = (this.instance.exports as any).readSharedRWMemory(j);
      }
      pos += this.n32;
    }

    return buff;
  }
}

function toArray32(s, size) {
  const res: number[] = []; //new Uint32Array(size); //has no unshift
  let rem = BigInt(s);
  const radix = BigInt(0x100000000);
  while (rem) {
    res.unshift(Number(rem % radix));
    rem = rem / radix;
  }
  if (size) {
    let i = size - res.length;
    while (i > 0) {
      res.unshift(0);
      i--;
    }
  }
  return res;
}

function fromArray32(arr): bigint {
  //returns a BigInt
  let res = BigInt(0);
  const radix = BigInt(0x100000000);
  for (let i = 0; i < arr.length; i++) {
    res = res * radix + BigInt(arr[i]);
  }
  return res;
}

function flatArray(a) {
  const res = [];
  fillArray(res, a);
  return res;

  function fillArray(res, a) {
    if (Array.isArray(a)) {
      for (let i = 0; i < a.length; i++) {
        fillArray(res, a[i]);
      }
    } else {
      res.push(a);
    }
  }
}

function fnvHash(str) {
  const uint64_max = BigInt(2) ** BigInt(64);
  let hash = BigInt('0xCBF29CE484222325');
  for (let i = 0; i < str.length; i++) {
    hash ^= BigInt(str[i].charCodeAt());
    hash *= BigInt(0x100000001b3);
    hash %= uint64_max;
  }
  let shash = hash.toString(16);
  const n = 16 - shash.length;
  shash = '0'.repeat(n).concat(shash);
  return shash;
}
