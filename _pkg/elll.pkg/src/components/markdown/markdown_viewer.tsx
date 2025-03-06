import { marked } from "marked";
import { useEffect, useRef } from "react";
import { baseStyle, githubMarkdown } from "./style";

export function MarkdownViewer({ md }: { md?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const iframe = ref.current;

    const doc = iframe.contentDocument;
    if (!doc) return;
    const styleElement = doc.createElement("style");
    styleElement.innerHTML = `${baseStyle} ${githubMarkdown}`;
    doc.head.append(styleElement);

    function interceptClickEvent(e: MouseEvent) {
      e.preventDefault();
      var target = e.target as HTMLElement | null;
      if (target?.tagName === "A") {
        const href = target.getAttribute("href");
        if (href) {
          if (href.startsWith("#")) {
            const id = href.slice(1);
            const element = doc?.getElementById(id);
            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
              });
            }
          } else {
            window.open(href, "_blank");
          }
        }
      }
    }

    doc.addEventListener("click", interceptClickEvent);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const iframe = ref.current;

    const doc = iframe.contentDocument;
    if (!doc) return;

    (async () => {
      doc.body.innerHTML = await marked(md || "");
    })();
  }, [md]);

  return (
    <iframe
      ref={ref}
      style={{
        height: "100%",
        width: "100%",
        border: "none",
        background: "transparent",
      }}
    />
  );
}
