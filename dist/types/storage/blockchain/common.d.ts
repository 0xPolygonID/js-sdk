import { ProofData } from '@iden3/js-jwz';
export declare const packZkpProof: (inputs: string[], a: string[], b: string[][], c: string[]) => string;
export declare const prepareZkpProof: (proof: ProofData) => {
    a: string[];
    b: string[][];
    c: string[];
};
//# sourceMappingURL=common.d.ts.map