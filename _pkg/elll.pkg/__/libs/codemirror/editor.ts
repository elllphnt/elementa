import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { lintGutter, lintKeymap } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { Compartment, EditorSelection, EditorState } from "@codemirror/state";
import {
  EditorView,
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import { vscodeKeymap } from "@replit/codemirror-vscode-keymap";
import { IElll } from "~/src/elll/_types";
import { EditorFile } from "../../editors/content";
import { tomorrow } from "./codemirror";
import { elllNavigator } from "./extensions/elll_navigator/elll_navigator";
import { elllTsEnvironment } from "./extensions/elll_ts_env/elll_ts_env";
import { goToDefinitionPlugin } from "./extensions/go_to_definition/go_to_definition";
import { quickInfo } from "./extensions/hover_tootips/_";
import { typescript } from "./extensions/languages/typescript";
import { tslint } from "./extensions/linters/_";
import { formatter } from "./facets/formatter";
import { saver } from "./facets/saver";
import { formatScript } from "./format/function";
import { editingKeyMap } from "./keymaps/editing";
import { coolGlow } from "./theme";

function languageFromFileType(fileType: string): string | undefined {
  if (
    ["application/typescript", "application/javascript"].includes(fileType) ||
    fileType.endsWith("+typescript") ||
    fileType.endsWith("+javascript")
  ) {
    return "typescript";
  }
  if (["application/json"].includes(fileType) || fileType.endsWith("+json")) {
    return "json";
  }
  if (["application/xml"].includes(fileType) || fileType.endsWith("+xml")) {
    return "xml";
  }
}

const caretIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>`;

export function createCodeMirrorEditor({
  elll,
  getFile,
}: {
  elll: IElll;
  getFile: () => EditorFile | undefined;
}) {
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const theme = new Compartment();
  const language = new Compartment();

  const initialState = EditorState.create({
    extensions: [
      quickInfo(),
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter({
        markerDOM: (open) => {
          const container = document.createElement("div");
          container.innerHTML = caretIcon;
          container.style.transform = open ? "rotate(0deg)" : "rotate(-90deg)";
          container.style.display = "inline-flex";
          container.style.alignItems = "center";
          container.style.justifyContent = "center";
          container.style.width = "16px";
          container.style.height = "100%";
          container.style.cursor = "pointer";
          container.style.transition = "transform 0.1s";
          return container;
        },
      }),
      lintGutter(),
      autocompletion(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      goToDefinitionPlugin(),
      theme.of(darkMediaQuery.matches ? coolGlow : tomorrow),
      language.of([]),
      keymap.of(vscodeKeymap),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap,
        ...editingKeyMap,
      ] as any),
      elllTsEnvironment({
        elll,
        getFile,
      }),
      elllNavigator({ elll }),
      saver.of(async (view) => {
        const file = getFile();
        if (!file) return;
        const content = view.state.doc.toString();
        file.setContent(content);
        elll.shell.toast({
          message: `Saved file ${file.path}`,
        });
      }),
      formatter.of(async (view) => {
        const file = getFile();
        if (!file?.type) return;

        const language = languageFromFileType(file.type);
        const content = view.state.doc.toString();
        const { script, cursorOffset } = language
          ? await formatScript({
              language,
              script: content,
              cursorOffset: view.state.selection.main.to,
            })
          : {
              script: content,
              cursorOffset: view.state.selection.main.to,
            };

        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: script,
          },
          selection: EditorSelection.cursor(Math.max(cursorOffset, 0)),
        });
      }),
      typescript(),
      tslint(),
      EditorView.theme({
        ".cm-gutters": {
          "background-color": "rgb(var(--color-background-100)) !important",
        },
        ".cm-scroller": {
          overflow: "visible !important",
        },
        ".cm-tooltip": {
          maxWidth: "500px",
          padding: "8px",
          borderRadius: "4px",
          backgroundColor: "rgb(var(--color-background-100))",
          border: "1px solid rgb(var(--color-foreground-100))",
          overflow: "hidden",
          userSelect: "auto",
          pointerEvent: "auto",
        },
        ".cm-tooltip-section": {},
      }),
      // inlineCopilot(
      //   async (prefix, suffix) => {
      //     const completion =
      //       // await elll.backend.intelligenceService.getCompletion({
      //       //   prefix,
      //       //   suffix,
      //       //   language: "typescript",
      //       // });
      //     // return completion;
      //   },
      //   500,
      //   false,
      // ),
    ],
  });

  const view = new EditorView({
    state: initialState,
  });

  darkMediaQuery.addEventListener("change", (e) => {
    view.dispatch({
      effects: theme.reconfigure(e.matches ? coolGlow : tomorrow),
    });
  });

  return view;
}
