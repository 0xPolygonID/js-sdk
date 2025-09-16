import {
  AcceptAuthCircuits,
  AcceptJweKEKAlgorithms,
  AcceptJwsAlgorithms,
  AcceptJwzAlgorithms,
  MediaType,
  ProtocolVersion
} from '../../constants';

export type AcceptProfile = {
  protocolVersion: ProtocolVersion;
  env: MediaType;
  circuits?: AcceptAuthCircuits[];
  alg?: AcceptJwsAlgorithms[] | AcceptJwzAlgorithms[] | AcceptJweKEKAlgorithms[];
};
