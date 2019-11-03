class TermWorker extends Worker {
    constructor(url, options) {
        super(url, (typeof options !== undefined) ? options : undefined);
        this.addEventListener("message", (ev) => {
        });
    }
}
