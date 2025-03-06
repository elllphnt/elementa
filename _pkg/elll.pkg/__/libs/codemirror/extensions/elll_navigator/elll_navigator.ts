import { Extension } from "@codemirror/state";
import { Elll } from "../../../../elll/elll";
import { navigator } from "../../facets/navigator";

export function elllNavigator({ elll }: { elll: Elll }): Extension {
  const facet = navigator.of((url) => {
    return elll.editorManager.openFile(url);
  });

  return [facet];
}
