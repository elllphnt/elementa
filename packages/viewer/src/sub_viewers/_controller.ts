import { ViewerContext } from "../_context";
import { SubViewer } from "./sub_viewer";

export type SubViewerController = {
  create(context: ViewerContext): SubViewer;
  match(url: string): boolean;
};

export function createSubViewerController({
  create,
  pattern,
}: {
  create(context: ViewerContext): SubViewer;
  pattern: string | RegExp;
}): SubViewerController {
  const match = (url: string) => {
    if (typeof pattern === "string") {
      return url.startsWith(pattern);
    } else {
      return pattern.test(url);
    }
  };
  return {
    create,
    match,
  };
}
