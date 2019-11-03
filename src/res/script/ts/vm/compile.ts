const ops = {
    start :'\xAA',
    end : '\xFF',
    push : '\xA1',
    pop : '\x1A',
    call : '\xA2',
    jmp : '\xA3',
    cmp : '\xA4',
    jne : '\xA5',
    je : '\xA6',
    reg1 : '\xA7',
    reg2 : '\xA8',
    load : '\xA9',
    abrt : '\xFA',
    nop : '\x00'
}

class ByteCode {
    public seedData : string[] = []
    constructor() {
        
    }
    buildOp(ops :string[]) : string[] {
        let compiled : string[] = [];
        ops.forEach(op=> {
            compiled.push(op);
        });
        return compiled;
    }
}

const HelloWorld = () => {
    const app = new ByteCode();
    console.log(app.buildOp([
        `${ops.start}`,
        `${ops.reg1} "Hello World"`,
        `${ops.push} "alert" ${ops.reg1}`,
        `${ops.call}`,
        `${ops.end}`
    ]));
}
HelloWorld();