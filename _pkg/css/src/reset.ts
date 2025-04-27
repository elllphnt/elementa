export const transformCssPropperties = () => /*css*/ `
@layer base {
    @property --elll-translate-x {
        syntax: "*";
        inherits: false;
    }
    @property --elll-translate-y {
        syntax: "*";
        inherits: false;
    }
    @property --elll-translate-z {
        syntax: "*";
        inherits: false;    
    }
    @property --elll-translate {
        syntax: "*";
        inherits: false;    
    }

    @property --elll-rotate-x {
        syntax: "*";
        inherits: false;
    }
    @property --elll-rotate-y {
        syntax: "*";
        inherits: false;
    }
    @property --elll-rotate-z {
        syntax: "*";
        inherits: false;    
    }
    @property --elll-rotate {
        syntax: "*";
        inherits: false;    
    }

    @property --elll-scale-x {
        syntax: "*";
        inherits: false;
    }
    @property --elll-scale-y {
        syntax: "*";
        inherits: false;
    }
    @property --elll-scale-z {
        syntax: "*";
        inherits: false;    
    }
    @property --elll-scale {
        syntax: "*";
        inherits: false;    
    }

    @property --elll-skew-x {
        syntax: "*";
        inherits: false;
    }
    @property --elll-skew-y {
        syntax: "*";
        inherits: false;
    }
    @property --elll-skew {
        syntax: "*";
        inherits: false;    
    }
}
`;

export const resetCss = () =>
  [
    /*css*/ `
@layer base {
    html, body, div, span, applet, object, iframe,
    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
    a, abbr, acronym, address, big, cite, code,
    del, dfn, em, img, ins, kbd, q, s, samp,
    small, strike, strong, sub, sup, tt, var,
    b, u, i, center,
    dl, dt, dd, ol, ul, li,
    fieldset, form, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, canvas, details, embed, 
    figure, figcaption, footer, header, hgroup, 
    menu, nav, output, ruby, section, summary,
    time, mark, audio, video {
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 100%;
        font: inherit;
        vertical-align: baseline;
    }
    /* HTML5 display-role reset for older browsers */
    article, aside, details, figcaption, figure, 
    footer, header, hgroup, menu, nav, section {
        display: block;
    }
    body {
        line-height: 1;
        background: white;
        color: black;
        font-family: sans-serif;
    }
    ol, ul {
        list-style: none;
    }
    blockquote, q {
        quotes: none;
    }
    blockquote:before, blockquote:after,
    q:before, q:after {
        content: '';
        content: none;
    }
    table {
        border-collapse: collapse;
        border-spacing: 0;
    }
    * {
        box-sizing: border-box;
    }
    @media (prefers-color-scheme: dark) {
        body {
            background: black;
            color: white;
        }
    }
    button {
        display: inline-block; /* Restore block properties */
        padding: 0; /* Removes default padding */
        border: none; /* Removes default border */
        background: none; /* Removes default background */
        font: inherit; /* Inherits font from parent */
        color: inherit; /* Inherits text color */
        text-align: center; /* Centers text */
        cursor: pointer; /* Adds pointer cursor */
        outline: none; /* Removes outline */
    }
      
    button:focus {
        outline: none; /* Removes outline on focus */
    }
      
    :root {
        --vh-unit: 1vh;
        --vw-unit: 1vw;
    }

    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }

    a {
        color: inherit;
        text-decoration: none;
    }

    @property --is-main-width {
    syntax: "<number>";
    inherits: false;
    initial-value: 0;
    }

    @property --is-main-height {
        syntax: "<number>";
        inherits: false;
        initial-value: 0;
    }

    @property --width-grow {
        syntax: "<number>";
        inherits: false;
        initial-value: 0;
    }

    @property --width-shrink {
        syntax: "<number>";
        inherits: false;
        initial-value: 0;
    }

    @property --height-grow {
        syntax: "<number>";
        inherits: false;
        initial-value: 0;
    }

    @property --height-shrink {
        syntax: "<number>";
        inherits: false;
        initial-value: 0;
    }
    
    @property --elll-background-color {
        syntax: "<color>";
        inherits: false;
        initial-value: transparent;
    }

    @property --elll-background-layers {
        syntax: "*";
        inherits: false;
        initial-value: center;
    }
}`,
    transformCssPropperties(),
  ].join("\n");
