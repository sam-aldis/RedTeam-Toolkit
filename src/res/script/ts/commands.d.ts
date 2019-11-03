export declare enum BuiltIns {
    ls = 0,
    cd = 1,
    vim = 2,
    echo = 3,
    pkg = 4,
    help = 5,
    fetch = 6,
    man = 7,
    tools = 8
}
export declare class Commands {
    cmd: {
        ls: () => void;
        cd: () => void;
        vim: () => void;
        echo: () => void;
        pwd: () => string | null;
        pkg: () => void;
        help: () => void;
        fetch: () => void;
        man: () => void;
        alert: (txt: any) => void;
        debug: (obj: any) => void;
        tools: () => void;
        scans: {
            tcpmap: (opts?: any) => void;
            udpmap: (opts?: any) => void;
            w3scan: (opts?: any) => void;
            dnstool: (opts?: any) => void;
            ssltool: (opts?: any) => void;
            dirbrute: (opts?: any) => void;
            bakdown: (opts?: any) => void;
            jspyder: (opts?: any) => void;
            domdis: (opts?: any) => void;
        };
        password: {
            admin: {
                brute: (opts?: any) => void;
                wordlist: (opts?: any) => void;
            };
            net: {
                tcp: {
                    brute: (opts?: any) => void;
                    wordlist: (opts?: any) => void;
                };
                udp: {
                    brute: (opts?: any) => void;
                    wordlist: (opts?: any) => void;
                };
            };
        };
    };
    constructor(opts?: Object);
    parse(command: string): any;
}
