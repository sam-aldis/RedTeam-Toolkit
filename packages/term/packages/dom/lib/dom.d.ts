import { Commands } from 'commands';
import { LitElement } from 'lit-element';
import { ENV } from 'term';
export declare enum Themes {
    default = 1
}
export declare class Termina extends LitElement {
    theme: number;
    line_buffer: Array<string>;
    histBuffer: string;
    private history_buffer;
    curBuffer: string;
    isTerminal: boolean;
    lineBuffer: string;
    std_out: Array<string>;
    line: number;
    envs: ENV;
    cmd: Commands;
    constructor();
    static readonly styles: import("lit-element").CSSResult;
    private updateHistory;
    write(msg: string): void;
    focus(): void;
    handle_input(ev: KeyboardEvent): void;
    render(): import("lit-element").TemplateResult;
}
