import { Compartment } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { coolGlow, tomorrow } from "./libs";

export function theme({ getView }: { getView: () => EditorView }) {
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const theme = new Compartment();

  darkMediaQuery.addEventListener("change", (e) => {
    const view = getView();
    view.dispatch({
      effects: theme.reconfigure(e.matches ? coolGlow : tomorrow),
    });
  });

  return [
    theme.of(darkMediaQuery.matches ? coolGlow : tomorrow),
    EditorView.theme({
      ".cm-gutters": {
        "background-color": "rgb(var(--color-background-100)) !important",
      },
      // ".cm-scroller": {
      //   overflow: "visible !important",
      // },
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
      "&": {
        height: "100%",
        width: "100%",
      },
    }),
  ];
}
