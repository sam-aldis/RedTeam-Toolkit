declare const urls: string[];
declare class SW {
    static load(): void;
    static handleCommands(ev: any): Promise<void>;
    static onInstall(ev: any): void;
    static onFetch(ev: any): void;
}
