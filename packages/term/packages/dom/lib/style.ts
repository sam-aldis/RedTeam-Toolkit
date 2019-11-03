import { css } from 'lit-element';

export const Style = css`
 @keyframes blink {
    0% {
    }
    51% {
        opacity: 0%;
        transform: rotateY(180deg);
    }
    100% {
    }
}
#term_input {
   background: rgba(0,0,0,0);
   border: none;
   outline: none;
   border-bottom: 1px solid white;
   /* width: 10px; */
   z-index: 1000;
   width: 100vw;
   height: 40%;
position: absolute;
opacity: 0;
}
#term_input:select {
    font-style: none;
}
#terminal {
    overflow: auto;
    width: 100vw;
    height: 40vh;
    padding-top: 10px;
    background: #232323;
    line-height: 18px;
    color: #f4f810;;
    font-family : "SourceCode", monospace;
}
#terminal b {
        color: #FF2222;
    }
#terminal u {
        color: #22FF22;
    }
#terminal i {
        color: #2222FF;
    }
    span {
        display: inline;
    }
    span::before {
            content : "λ "
        }
    span .input {
            display: inline;
        }
    span .cursor {
            display: inline-block;
            border: 2px solid white;
            width: 6px;
            height: 12px;
            animation-name: blink;
            animation-duration: 2s;
            animation-iteration-count: infinite;
            animation-fill-mode: both;
            animation-direction: normal;
            animation-timing-function: ease-in-out;
            animation-play-state: running;
        } 
        `