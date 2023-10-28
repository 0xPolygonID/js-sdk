/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener
} from 'ethers';
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod
} from './common';

export interface StateInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'VERSION'
      | 'acceptOwnership'
      | 'getDefaultIdType'
      | 'getGISTProof'
      | 'getGISTProofByBlock'
      | 'getGISTProofByRoot'
      | 'getGISTProofByTime'
      | 'getGISTRoot'
      | 'getGISTRootHistory'
      | 'getGISTRootHistoryLength'
      | 'getGISTRootInfo'
      | 'getGISTRootInfoByBlock'
      | 'getGISTRootInfoByTime'
      | 'getStateInfoById'
      | 'getStateInfoByIdAndState'
      | 'getStateInfoHistoryById'
      | 'getStateInfoHistoryLengthById'
      | 'getVerifier'
      | 'idExists'
      | 'initialize'
      | 'owner'
      | 'pendingOwner'
      | 'renounceOwnership'
      | 'setDefaultIdType'
      | 'setVerifier'
      | 'stateExists'
      | 'transferOwnership'
      | 'transitState'
      | 'transitStateGeneric'
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: 'Initialized' | 'OwnershipTransferStarted' | 'OwnershipTransferred'
  ): EventFragment;

  encodeFunctionData(functionFragment: 'VERSION', values?: undefined): string;
  encodeFunctionData(functionFragment: 'acceptOwnership', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getDefaultIdType', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getGISTProof', values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'getGISTProofByBlock',
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: 'getGISTProofByRoot',
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: 'getGISTProofByTime',
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: 'getGISTRoot', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'getGISTRootHistory',
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: 'getGISTRootHistoryLength', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getGISTRootInfo', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'getGISTRootInfoByBlock', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'getGISTRootInfoByTime', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'getStateInfoById', values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'getStateInfoByIdAndState',
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: 'getStateInfoHistoryById',
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: 'getStateInfoHistoryLengthById',
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: 'getVerifier', values?: undefined): string;
  encodeFunctionData(functionFragment: 'idExists', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'initialize', values: [AddressLike, BytesLike]): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(functionFragment: 'pendingOwner', values?: undefined): string;
  encodeFunctionData(functionFragment: 'renounceOwnership', values?: undefined): string;
  encodeFunctionData(functionFragment: 'setDefaultIdType', values: [BytesLike]): string;
  encodeFunctionData(functionFragment: 'setVerifier', values: [AddressLike]): string;
  encodeFunctionData(functionFragment: 'stateExists', values: [BigNumberish, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'transferOwnership', values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: 'transitState',
    values: [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      boolean,
      [BigNumberish, BigNumberish],
      [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      [BigNumberish, BigNumberish]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: 'transitStateGeneric',
    values: [BigNumberish, BigNumberish, BigNumberish, boolean, BigNumberish, BytesLike]
  ): string;

  decodeFunctionResult(functionFragment: 'VERSION', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'acceptOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getDefaultIdType', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getGISTProof', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getGISTProofByBlock', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getGISTProofByRoot', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getGISTProofByTime', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getGISTRoot', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getGISTRootHistory', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getGISTRootHistoryLength', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getGISTRootInfo', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getGISTRootInfoByBlock', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getGISTRootInfoByTime', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getStateInfoById', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getStateInfoByIdAndState', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getStateInfoHistoryById', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getStateInfoHistoryLengthById', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getVerifier', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'idExists', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'initialize', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'pendingOwner', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'renounceOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setDefaultIdType', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setVerifier', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'stateExists', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transitState', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transitStateGeneric', data: BytesLike): Result;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferStartedEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface State extends BaseContract {
  connect(runner?: ContractRunner | null): State;
  waitForDeployment(): Promise<this>;

  interface: StateInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;

  VERSION: TypedContractMethod<[], [string], 'view'>;

  acceptOwnership: TypedContractMethod<[], [void], 'nonpayable'>;

  getDefaultIdType: TypedContractMethod<[], [string], 'view'>;

  getGISTProof: TypedContractMethod<
    [id: BigNumberish],
    [
      [bigint, boolean, bigint[], bigint, bigint, boolean, bigint, bigint] & {
        root: bigint;
        existence: boolean;
        siblings: bigint[];
        index: bigint;
        value: bigint;
        auxExistence: boolean;
        auxIndex: bigint;
        auxValue: bigint;
      }
    ],
    'view'
  >;

  getGISTProofByBlock: TypedContractMethod<
    [id: BigNumberish, blockNumber: BigNumberish],
    [
      [bigint, boolean, bigint[], bigint, bigint, boolean, bigint, bigint] & {
        root: bigint;
        existence: boolean;
        siblings: bigint[];
        index: bigint;
        value: bigint;
        auxExistence: boolean;
        auxIndex: bigint;
        auxValue: bigint;
      }
    ],
    'view'
  >;

  getGISTProofByRoot: TypedContractMethod<
    [id: BigNumberish, root: BigNumberish],
    [
      [bigint, boolean, bigint[], bigint, bigint, boolean, bigint, bigint] & {
        root: bigint;
        existence: boolean;
        siblings: bigint[];
        index: bigint;
        value: bigint;
        auxExistence: boolean;
        auxIndex: bigint;
        auxValue: bigint;
      }
    ],
    'view'
  >;

  getGISTProofByTime: TypedContractMethod<
    [id: BigNumberish, timestamp: BigNumberish],
    [
      [bigint, boolean, bigint[], bigint, bigint, boolean, bigint, bigint] & {
        root: bigint;
        existence: boolean;
        siblings: bigint[];
        index: bigint;
        value: bigint;
        auxExistence: boolean;
        auxIndex: bigint;
        auxValue: bigint;
      }
    ],
    'view'
  >;

  getGISTRoot: TypedContractMethod<[], [bigint], 'view'>;

  getGISTRootHistory: TypedContractMethod<
    [start: BigNumberish, length: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint] &
        {
          root: bigint;
          replacedByRoot: bigint;
          createdAtTimestamp: bigint;
          replacedAtTimestamp: bigint;
          createdAtBlock: bigint;
          replacedAtBlock: bigint;
        }[]
    ],
    'view'
  >;

  getGISTRootHistoryLength: TypedContractMethod<[], [bigint], 'view'>;

  getGISTRootInfo: TypedContractMethod<
    [root: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint] & {
        root: bigint;
        replacedByRoot: bigint;
        createdAtTimestamp: bigint;
        replacedAtTimestamp: bigint;
        createdAtBlock: bigint;
        replacedAtBlock: bigint;
      }
    ],
    'view'
  >;

  getGISTRootInfoByBlock: TypedContractMethod<
    [blockNumber: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint] & {
        root: bigint;
        replacedByRoot: bigint;
        createdAtTimestamp: bigint;
        replacedAtTimestamp: bigint;
        createdAtBlock: bigint;
        replacedAtBlock: bigint;
      }
    ],
    'view'
  >;

  getGISTRootInfoByTime: TypedContractMethod<
    [timestamp: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint] & {
        root: bigint;
        replacedByRoot: bigint;
        createdAtTimestamp: bigint;
        replacedAtTimestamp: bigint;
        createdAtBlock: bigint;
        replacedAtBlock: bigint;
      }
    ],
    'view'
  >;

  getStateInfoById: TypedContractMethod<
    [id: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint, bigint] & {
        id: bigint;
        state: bigint;
        replacedByState: bigint;
        createdAtTimestamp: bigint;
        replacedAtTimestamp: bigint;
        createdAtBlock: bigint;
        replacedAtBlock: bigint;
      }
    ],
    'view'
  >;

  getStateInfoByIdAndState: TypedContractMethod<
    [id: BigNumberish, state: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint, bigint] & {
        id: bigint;
        state: bigint;
        replacedByState: bigint;
        createdAtTimestamp: bigint;
        replacedAtTimestamp: bigint;
        createdAtBlock: bigint;
        replacedAtBlock: bigint;
      }
    ],
    'view'
  >;

  getStateInfoHistoryById: TypedContractMethod<
    [id: BigNumberish, startIndex: BigNumberish, length: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint, bigint] &
        {
          id: bigint;
          state: bigint;
          replacedByState: bigint;
          createdAtTimestamp: bigint;
          replacedAtTimestamp: bigint;
          createdAtBlock: bigint;
          replacedAtBlock: bigint;
        }[]
    ],
    'view'
  >;

  getStateInfoHistoryLengthById: TypedContractMethod<[id: BigNumberish], [bigint], 'view'>;

  getVerifier: TypedContractMethod<[], [string], 'view'>;

  idExists: TypedContractMethod<[id: BigNumberish], [boolean], 'view'>;

  initialize: TypedContractMethod<
    [verifierContractAddr: AddressLike, defaultIdType: BytesLike],
    [void],
    'nonpayable'
  >;

  owner: TypedContractMethod<[], [string], 'view'>;

  pendingOwner: TypedContractMethod<[], [string], 'view'>;

  renounceOwnership: TypedContractMethod<[], [void], 'nonpayable'>;

  setDefaultIdType: TypedContractMethod<[defaultIdType: BytesLike], [void], 'nonpayable'>;

  setVerifier: TypedContractMethod<[newVerifierAddr: AddressLike], [void], 'nonpayable'>;

  stateExists: TypedContractMethod<[id: BigNumberish, state: BigNumberish], [boolean], 'view'>;

  transferOwnership: TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;

  transitState: TypedContractMethod<
    [
      id: BigNumberish,
      oldState: BigNumberish,
      newState: BigNumberish,
      isOldStateGenesis: boolean,
      a: [BigNumberish, BigNumberish],
      b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      c: [BigNumberish, BigNumberish]
    ],
    [void],
    'nonpayable'
  >;

  transitStateGeneric: TypedContractMethod<
    [
      id: BigNumberish,
      oldState: BigNumberish,
      newState: BigNumberish,
      isOldStateGenesis: boolean,
      methodId: BigNumberish,
      methodParams: BytesLike
    ],
    [void],
    'nonpayable'
  >;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(nameOrSignature: 'VERSION'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'acceptOwnership'): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(nameOrSignature: 'getDefaultIdType'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'getGISTProof'): TypedContractMethod<
    [id: BigNumberish],
    [
      [bigint, boolean, bigint[], bigint, bigint, boolean, bigint, bigint] & {
        root: bigint;
        existence: boolean;
        siblings: bigint[];
        index: bigint;
        value: bigint;
        auxExistence: boolean;
        auxIndex: bigint;
        auxValue: bigint;
      }
    ],
    'view'
  >;
  getFunction(nameOrSignature: 'getGISTProofByBlock'): TypedContractMethod<
    [id: BigNumberish, blockNumber: BigNumberish],
    [
      [bigint, boolean, bigint[], bigint, bigint, boolean, bigint, bigint] & {
        root: bigint;
        existence: boolean;
        siblings: bigint[];
        index: bigint;
        value: bigint;
        auxExistence: boolean;
        auxIndex: bigint;
        auxValue: bigint;
      }
    ],
    'view'
  >;
  getFunction(nameOrSignature: 'getGISTProofByRoot'): TypedContractMethod<
    [id: BigNumberish, root: BigNumberish],
    [
      [bigint, boolean, bigint[], bigint, bigint, boolean, bigint, bigint] & {
        root: bigint;
        existence: boolean;
        siblings: bigint[];
        index: bigint;
        value: bigint;
        auxExistence: boolean;
        auxIndex: bigint;
        auxValue: bigint;
      }
    ],
    'view'
  >;
  getFunction(nameOrSignature: 'getGISTProofByTime'): TypedContractMethod<
    [id: BigNumberish, timestamp: BigNumberish],
    [
      [bigint, boolean, bigint[], bigint, bigint, boolean, bigint, bigint] & {
        root: bigint;
        existence: boolean;
        siblings: bigint[];
        index: bigint;
        value: bigint;
        auxExistence: boolean;
        auxIndex: bigint;
        auxValue: bigint;
      }
    ],
    'view'
  >;
  getFunction(nameOrSignature: 'getGISTRoot'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'getGISTRootHistory'): TypedContractMethod<
    [start: BigNumberish, length: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint] &
        {
          root: bigint;
          replacedByRoot: bigint;
          createdAtTimestamp: bigint;
          replacedAtTimestamp: bigint;
          createdAtBlock: bigint;
          replacedAtBlock: bigint;
        }[]
    ],
    'view'
  >;
  getFunction(
    nameOrSignature: 'getGISTRootHistoryLength'
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'getGISTRootInfo'): TypedContractMethod<
    [root: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint] & {
        root: bigint;
        replacedByRoot: bigint;
        createdAtTimestamp: bigint;
        replacedAtTimestamp: bigint;
        createdAtBlock: bigint;
        replacedAtBlock: bigint;
      }
    ],
    'view'
  >;
  getFunction(nameOrSignature: 'getGISTRootInfoByBlock'): TypedContractMethod<
    [blockNumber: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint] & {
        root: bigint;
        replacedByRoot: bigint;
        createdAtTimestamp: bigint;
        replacedAtTimestamp: bigint;
        createdAtBlock: bigint;
        replacedAtBlock: bigint;
      }
    ],
    'view'
  >;
  getFunction(nameOrSignature: 'getGISTRootInfoByTime'): TypedContractMethod<
    [timestamp: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint] & {
        root: bigint;
        replacedByRoot: bigint;
        createdAtTimestamp: bigint;
        replacedAtTimestamp: bigint;
        createdAtBlock: bigint;
        replacedAtBlock: bigint;
      }
    ],
    'view'
  >;
  getFunction(nameOrSignature: 'getStateInfoById'): TypedContractMethod<
    [id: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint, bigint] & {
        id: bigint;
        state: bigint;
        replacedByState: bigint;
        createdAtTimestamp: bigint;
        replacedAtTimestamp: bigint;
        createdAtBlock: bigint;
        replacedAtBlock: bigint;
      }
    ],
    'view'
  >;
  getFunction(nameOrSignature: 'getStateInfoByIdAndState'): TypedContractMethod<
    [id: BigNumberish, state: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint, bigint] & {
        id: bigint;
        state: bigint;
        replacedByState: bigint;
        createdAtTimestamp: bigint;
        replacedAtTimestamp: bigint;
        createdAtBlock: bigint;
        replacedAtBlock: bigint;
      }
    ],
    'view'
  >;
  getFunction(nameOrSignature: 'getStateInfoHistoryById'): TypedContractMethod<
    [id: BigNumberish, startIndex: BigNumberish, length: BigNumberish],
    [
      [bigint, bigint, bigint, bigint, bigint, bigint, bigint] &
        {
          id: bigint;
          state: bigint;
          replacedByState: bigint;
          createdAtTimestamp: bigint;
          replacedAtTimestamp: bigint;
          createdAtBlock: bigint;
          replacedAtBlock: bigint;
        }[]
    ],
    'view'
  >;
  getFunction(
    nameOrSignature: 'getStateInfoHistoryLengthById'
  ): TypedContractMethod<[id: BigNumberish], [bigint], 'view'>;
  getFunction(nameOrSignature: 'getVerifier'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'idExists'
  ): TypedContractMethod<[id: BigNumberish], [boolean], 'view'>;
  getFunction(
    nameOrSignature: 'initialize'
  ): TypedContractMethod<
    [verifierContractAddr: AddressLike, defaultIdType: BytesLike],
    [void],
    'nonpayable'
  >;
  getFunction(nameOrSignature: 'owner'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'pendingOwner'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'renounceOwnership'): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setDefaultIdType'
  ): TypedContractMethod<[defaultIdType: BytesLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setVerifier'
  ): TypedContractMethod<[newVerifierAddr: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'stateExists'
  ): TypedContractMethod<[id: BigNumberish, state: BigNumberish], [boolean], 'view'>;
  getFunction(
    nameOrSignature: 'transferOwnership'
  ): TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'transitState'
  ): TypedContractMethod<
    [
      id: BigNumberish,
      oldState: BigNumberish,
      newState: BigNumberish,
      isOldStateGenesis: boolean,
      a: [BigNumberish, BigNumberish],
      b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      c: [BigNumberish, BigNumberish]
    ],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'transitStateGeneric'
  ): TypedContractMethod<
    [
      id: BigNumberish,
      oldState: BigNumberish,
      newState: BigNumberish,
      isOldStateGenesis: boolean,
      methodId: BigNumberish,
      methodParams: BytesLike
    ],
    [void],
    'nonpayable'
  >;

  getEvent(
    key: 'Initialized'
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: 'OwnershipTransferStarted'
  ): TypedContractEvent<
    OwnershipTransferStartedEvent.InputTuple,
    OwnershipTransferStartedEvent.OutputTuple,
    OwnershipTransferStartedEvent.OutputObject
  >;
  getEvent(
    key: 'OwnershipTransferred'
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;

  filters: {
    'Initialized(uint8)': TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    'OwnershipTransferStarted(address,address)': TypedContractEvent<
      OwnershipTransferStartedEvent.InputTuple,
      OwnershipTransferStartedEvent.OutputTuple,
      OwnershipTransferStartedEvent.OutputObject
    >;
    OwnershipTransferStarted: TypedContractEvent<
      OwnershipTransferStartedEvent.InputTuple,
      OwnershipTransferStartedEvent.OutputTuple,
      OwnershipTransferStartedEvent.OutputObject
    >;

    'OwnershipTransferred(address,address)': TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
  };
}
