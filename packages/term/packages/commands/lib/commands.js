export var BuiltIns;
(function (BuiltIns) {
    BuiltIns[BuiltIns["ls"] = 0] = "ls";
    BuiltIns[BuiltIns["cd"] = 1] = "cd";
    BuiltIns[BuiltIns["vim"] = 2] = "vim";
    BuiltIns[BuiltIns["echo"] = 3] = "echo";
    BuiltIns[BuiltIns["pkg"] = 4] = "pkg";
    BuiltIns[BuiltIns["help"] = 5] = "help";
    BuiltIns[BuiltIns["fetch"] = 6] = "fetch";
    BuiltIns[BuiltIns["man"] = 7] = "man";
    BuiltIns[BuiltIns["tools"] = 8] = "tools";
})(BuiltIns || (BuiltIns = {}));
export class Commands {
    constructor(opts) {
        this.cmd = {
            ls: () => { },
            cd: () => { },
            vim: () => { },
            echo: () => { },
            pwd: () => {
                return localStorage.getItem("CWD");
            },
            pkg: () => { },
            help: () => { },
            fetch: () => { },
            man: () => { },
            alert: (txt) => { alert(txt); },
            debug: (obj) => { console.log(obj); },
            tools: () => { },
            scans: {
                tcpmap: (opts) => { } // TCP Port Scanner
                ,
                udpmap: (opts) => { } // UDP Port Scanner
                ,
                w3scan: (opts) => { } // WebApp Scanner
                ,
                dnstool: (opts) => { } // DNS Discovery
                ,
                ssltool: (opts) => { } // SSL Certificate Enumeration
                ,
                dirbrute: (opts) => { } // Directory Finder
                ,
                bakdown: (opts) => { } // Backup and File Finder
                ,
                jspyder: (opts) => { } // Javascript source analysis
                ,
                domdis: (opts) => { } // DOM Object Analysis
            },
            password: {
                admin: {
                    brute: (opts) => { },
                    wordlist: (opts) => { }
                } // Admin interface password attacks
                ,
                net: {
                    tcp: {
                        brute: (opts) => { },
                        wordlist: (opts) => { }
                    },
                    udp: {
                        brute: (opts) => { },
                        wordlist: (opts) => { }
                    }
                } // Network plaintext password attacks
            }
        };
        //eval("this." + command);
    }
    parse(command) {
        return eval("this.cmd." + command);
    }
}
