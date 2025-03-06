export const githubMarkdown = /*css*/ `
html { font-size: 100%; el-overflow-y: scroll; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }

body{
  color:#444;
  font-family:Inter, sans-serif;
  font-size:12px;
  line-height:1.5em;
  margin:auto;
  max-width:42em;
  background:#fefefe;
}

a{ color: #0645ad; el-text-decoration:none;}
a:visited{ color: #0b0080; }
a:hover{ color: #06e; }
a:active{ color:#faa700; }
a:focus{ outline: thin dotted; }
a:hover, a:active{ outline: 0; }

::-moz-selection{background:rgba(255,255,0,0.3);color:#000}
::selection{background:rgba(255,255,0,0.3);color:#000}

a::-moz-selection{background:rgba(255,255,0,0.3);color:#0645ad}
a::selection{background:rgba(255,255,0,0.3);color:#0645ad}

p{
margin:1em 0;
}

img{
max-width:100%;
}

h1,h2,h3,h4,h5,h6{
font-weight:normal;
line-height:1em;
}
h4,h5,h6{ font-weight: bold; }
h1{ font-size:1.4em; }
h2{ font-size:1.3em; }
h3{ font-size:1.2em; }
h4{ font-size:1.1em; }
h5{ font-size:1em; }
h6{ font-size:0.9em; }

blockquote{
margin:0;
padding-left: 3em;
border-left: 0.5em #EEE solid;
}
hr { display: block; height: 2px; border: 0; border-top: 1px solid #aaa;border-bottom: 1px solid #eee; margin: 1em 0; padding: 0; }
pre, code, kbd, samp { font-family: monospace, monospace; _font-family: 'courier new', monospace; font-size: 0.98em; 
}
pre { padding: 8px; border-radius: 4px;
     white-space: pre; white-space: pre-wrap; word-wrap: break-word; }

b, strong { font-weight: bold; }

dfn { font-style: italic; }

ins { background: #ff9; el-text-decoration: none; }

mark { background: #ff0; font-style: italic; font-weight: bold; }

sub, sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; }
sup { top: -0.5em; }
sub { bottom: -0.25em; }

ul, ol { margin: 1em 0; padding: 0 0 0 2em; }
li p:last-child { margin:0 }
dd { margin: 0 0 0 2em; }

img { border: 0; -ms-interpolation-mode: bicubic; vertical-align: middle; }

table {
border-collapse: collapse;
border-spacing: 0;
width: 100%;
}
th { border-bottom: 1px solid black; }
td { vertical-align: top; }

@media only screen and (min-width: 480px) {
body{font-size:14px;}
}

@media only screen and (min-width: 768px) {
body{font-size:16px;}
}

@media print {
  * { background: transparent !important; color: black !important; filter:none !important; -ms-filter: none !important; }
  body{font-size:12pt; max-width:100%;}
  a, a:visited { el-text-decoration: underline; }
  hr { height: 1px; border:0; border-bottom:1px solid black; }
  a[href]:after { content: " (" attr(href) ")"; }
  abbr[title]:after { content: " (" attr(title) ")"; }
  .ir a:after, a[href^="javascript:"]:after, a[href^="#"]:after { content: ""; }
  pre, blockquote { border: 1px solid #999; padding-right: 1em; page-break-inside: avoid; }
  tr, img { page-break-inside: avoid; }
  img { max-width: 100% !important; }
  @page :left { margin: 15mm 20mm 15mm 10mm; }
  @page :right { margin: 15mm 10mm 15mm 20mm; }
  p, h2, h3 { orphans: 3; widows: 3; }
  h2, h3 { page-break-after: avoid; }
}

@media (prefers-color-scheme: dark) {
    body {
        background-color: #1a1a1a50;
        color: #fff;
    }
    a, a:visited {
        color: #fff;
    }
    hr {
        border-bottom-color: #333;
    }
    blockquote {
        border-left-color: #333;
    }
    table {
        border-color: #333;
    }
    th {
        border-bottom-color: #333;
    }
    td {
        border-bottom-color: #333;
    }
    code {
        background-color: #333;
    }
    pre {
        background-color: #333;
    }
}
`;

export const baseStyle = /*css*/ `
body,
html {
  background-color: rgb(var(--color-background-rgb));
  color: rgb(var(--color-foreground-rgb));
}

/* Text field */

.text-field {
  background-color: var(--text-field-background);
  border: var(--text-field-border-width) solid var(--text-field-border-color);
  color: rgb(var(--color-foreground-rgb));
}

/* Scrollbar */

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: none;
}
::-webkit-scrollbar-thumb {
  transition: all 1s;
}
*::-webkit-scrollbar-thumb {
  background-color: #ffffff00;
  transition: all 1s;
  /* border-radius: 10px; */
}
*:hover::-webkit-scrollbar-thumb {
  background-color: #ffffff22;
  /* border-radius: 10px; */
}
::-webkit-scrollbar-thumb:hover {
  background-color: #ffffff35;
}

`;

export const script = /*javascript*/ `


if (document.addEventListener) {
    document.addEventListener('click', interceptClickEvent);
} else if (document.attachEvent) {
    document.attachEvent('onclick', interceptClickEvent);
}
`;
