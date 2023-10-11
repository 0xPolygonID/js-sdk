export declare function witnessBuilder(code: BufferSource, options?: any): Promise<WitnessCalculator>;
declare class WitnessCalculator {
    private instance;
    version: any;
    n32: any;
    prime: any;
    witnessSize: any;
    sanityCheck: any;
    constructor(instance: any, sanityCheck: any);
    circom_version(): any;
    _doCalculateWitness(input: any, sanityCheck: any): Promise<void>;
    calculateWitness(input: any, sanityCheck: any): Promise<bigint[]>;
    calculateBinWitness(input: any, sanityCheck: any): Promise<Uint8Array>;
    calculateWTNSBin(input: any, sanityCheck: any): Promise<Uint8Array>;
}
export {};
