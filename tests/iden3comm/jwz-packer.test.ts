import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JWZPacker, CircuitId, byteEncoder, ICircuitStorage } from '../../src';
import { DID } from '@iden3/js-iden3-core';
import { ProvingMethodAlg, Token } from '@iden3/js-jwz';
import { AuthDataPrepareFunc } from '../../src/iden3comm/types';

vi.mock('../../src/iden3comm/packers/zkp-packer-utils', () => ({
  verifySender: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@iden3/js-jwz', () => ({
  Token: class MockToken {
    static parse: (token: string) => Token = vi.fn(() => mockToken as unknown as Token);
    constructor(private readonly prepareFn?: AuthDataPrepareFunc) {
      Object.assign(this, mockToken);
    }
  },
  proving: {
    getProvingMethod: vi.fn(() => mockProvingMethod),
    provingMethodGroth16AuthV2Instance: { methodAlg: 'groth16-authV2' }
  },
  Header: { Type: 'type' },
  ProvingMethodAlg: vi.fn()
}));

const mockProvingMethod = { alg: 'groth16', circuitId: CircuitId.AuthV2 };

const mockToken = {
  prove: vi.fn(),
  verify: vi.fn(),
  getPayload: vi.fn(),
  setHeader: vi.fn(),
  circuitId: CircuitId.AuthV2,
  zkProof: { pub_signals: ['123', '456', '789'] }
};

const loadCircuitDataMock = vi.fn();
const mockCircuitStorage = { loadCircuitData: loadCircuitDataMock } as unknown as ICircuitStorage;
const mockVerificationFn = vi.fn();

describe('JWZ Packer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken.getPayload.mockReturnValue(
      JSON.stringify({
        id: 'id',
        type: 'type',
        from: 'did:iden3:polygon:mumbai:123',
        body: {}
      })
    );
  });

  it('packs with data preparer from constructor', async () => {
    const params = {
      senderDID: DID.parse('did:iden3:polygon:mumbai:123'),
      provingMethodAlg: mockProvingMethod as ProvingMethodAlg,
      provingKey: new Uint8Array([1]),
      wasm: new Uint8Array([2])
    };
    const loadCircuitDataMock = vi.fn();
    const circuitStorage: ICircuitStorage = {
      loadCircuitData: loadCircuitDataMock
    } as unknown as ICircuitStorage;

    loadCircuitDataMock.mockResolvedValue({
      provingKey: params.provingKey,
      wasm: params.wasm,
      verificationKey: new Uint8Array([3])
    });

    const mockDataPreparer = vi.fn();

    const packer = new JWZPacker({
      circuitStorage,
      defaultDataPreparers: new Map([[CircuitId.AuthV2, mockDataPreparer]])
    });
    const msg = { id: 'id', type: 'type', body: {} };

    mockToken.prove.mockResolvedValue('mock_token_string');
    const result = await packer.pack(byteEncoder.encode(JSON.stringify(msg)), params);
    expect(mockToken.prove).toHaveBeenCalledWith(params.provingKey, params.wasm);
    expect(result).toEqual(byteEncoder.encode('mock_token_string'));
  });

  it('packs with dataPreparer param', async () => {
    const customDataPreparer = vi.fn();
    const msg = { id: 'id', type: 'type', body: {} };
    const params = {
      senderDID: DID.parse('did:iden3:polygon:mumbai:123'),
      provingMethodAlg: mockProvingMethod as ProvingMethodAlg,
      provingKey: new Uint8Array([1]),
      wasm: new Uint8Array([2]),
      dataPreparer: customDataPreparer
    };
    const loadCircuitDataMock = vi.fn();
    const circuitStorage: ICircuitStorage = {
      loadCircuitData: loadCircuitDataMock
    } as unknown as ICircuitStorage;

    loadCircuitDataMock.mockResolvedValue({
      provingKey: params.provingKey,
      wasm: params.wasm,
      verificationKey: new Uint8Array([3])
    });

    const packer = new JWZPacker({ circuitStorage });

    mockToken.prove.mockResolvedValue('mock_token_string');
    const result = await packer.pack(byteEncoder.encode(JSON.stringify(msg)), params);
    expect(mockToken.prove).toHaveBeenCalledWith(params.provingKey, params.wasm);
    expect(result).toEqual(byteEncoder.encode('mock_token_string'));
  });

  it('unpacks with default verification', async () => {
    const packer = new JWZPacker({
      circuitStorage: mockCircuitStorage,
      stateVerificationFnMap: new Map([[CircuitId.AuthV2, mockVerificationFn]])
    });
    const envelope = byteEncoder.encode('mock_envelope');
    const expectedMessage = {
      id: 'id',
      type: 'type',
      from: 'did:iden3:polygon:mumbai:123',
      body: {}
    };
    mockToken.verify.mockResolvedValue(true);
    mockToken.getPayload.mockReturnValue(JSON.stringify(expectedMessage));
    mockVerificationFn.mockResolvedValue(true);
    loadCircuitDataMock.mockResolvedValue({ verificationKey: new Uint8Array([3]) });
    const result = await packer.unpack(envelope);
    expect(mockToken.verify).toHaveBeenCalled();
    expect(mockVerificationFn).toHaveBeenCalled();
    expect(result).toEqual(expectedMessage);
  });

  it('unpacks with verificationFn param', async () => {
    const packer = new JWZPacker({ circuitStorage: mockCircuitStorage });
    const customVerificationFn = vi.fn().mockResolvedValue(true);
    const envelope = byteEncoder.encode('mock_envelope');
    const expectedMessage = {
      id: 'id',
      type: 'type',
      from: 'did:iden3:polygon:mumbai:123',
      body: {}
    };
    mockToken.verify.mockResolvedValue(true);
    mockToken.getPayload.mockReturnValue(JSON.stringify(expectedMessage));
    loadCircuitDataMock.mockResolvedValue({ verificationKey: new Uint8Array([3]) });
    const result = await packer.unpack(envelope, { verificationFn: customVerificationFn });
    expect(mockToken.verify).toHaveBeenCalled();
    expect(customVerificationFn).toHaveBeenCalled();
    expect(result).toEqual(expectedMessage);
  });
});
