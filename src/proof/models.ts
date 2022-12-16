import { CircuitId } from './../circuits/models';
export interface ProofRequest {
  id: number;
  //toDO: verify with Vlad is challenge could belong to this interface
  challenge: number;
  circuitId: CircuitId;
  optional?: boolean;
  rules: { [key: string]: unknown };
}
