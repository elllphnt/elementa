import { foldGutter as cmfoldGutter } from "@codemirror/language";

const caretIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>`;

export function foldGutter() {
  return [
    cmfoldGutter({
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
  ];
}
