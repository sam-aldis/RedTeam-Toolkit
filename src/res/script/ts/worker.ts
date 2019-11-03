import {BuiltIns, Commands} from './commands';

class TermWorker extends Worker {
    constructor(url : string, options? : WorkerOptions) {
        super(url, (typeof options !== undefined) ? options : undefined);
        this.addEventListener("message", (ev)=> {
           
        });
    }
}