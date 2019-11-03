export enum BuiltIns {
      ls
    , cd
    , vim
    , echo
    , pkg
    , help
    , fetch
    , man
    , tools
}

export class Commands {
    public cmd = {
          ls : ()=>{}
        , cd: ()=>{}
        , vim: ()=>{}
        , echo: ()=>{}
        , pwd : ()=>{
            return localStorage.getItem("CWD");
        }
        , pkg: ()=>{}
        , help: ()=>{}
        , fetch: ()=>{}
        , man: ()=>{}
        , alert: (txt : any) => {alert(txt)}
        , debug: (obj : any) => { console.log(obj);}
        , tools: ()=>{}
        , scans : {
          tcpmap : (opts? : any)=>{}// TCP Port Scanner
        , udpmap : (opts? : any)=>{}// UDP Port Scanner
        , w3scan : (opts? : any)=>{}// WebApp Scanner
        , dnstool : (opts? : any)=>{}// DNS Discovery
        , ssltool : (opts? : any)=>{}// SSL Certificate Enumeration
        , dirbrute : (opts? : any)=>{}// Directory Finder
        , bakdown : (opts? : any)=>{}// Backup and File Finder
        , jspyder : (opts? : any)=>{}// Javascript source analysis
        , domdis : (opts? : any)=>{}// DOM Object Analysis
    }
    , password: {
            admin : {
                brute : (opts? : any)=>{}
                , wordlist : (opts? : any)=>{}
            } // Admin interface password attacks
            , net : {
                tcp : {
                    brute : (opts? : any)=>{}
                    , wordlist : (opts? : any)=>{}
                }
                , udp : {
                    brute : (opts? : any)=>{}
                    , wordlist : (opts? : any)=>{}
                }
            } // Network plaintext password attacks
        }
    }
    constructor(opts ? : Object) {
        //eval("this." + command);
    }
    public parse(command : string) {
        return eval("this.cmd." + command);
    }
}