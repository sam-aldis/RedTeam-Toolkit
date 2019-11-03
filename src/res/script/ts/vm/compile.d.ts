declare const ops: {
    start: string;
    end: string;
    push: string;
    pop: string;
    call: string;
    jmp: string;
    cmp: string;
    jne: string;
    je: string;
    reg1: string;
    reg2: string;
    load: string;
    abrt: string;
    nop: string;
};
declare class ByteCode {
    seedData: string[];
    constructor();
    buildOp(ops: string[]): string[];
}
declare const HelloWorld: () => void;
