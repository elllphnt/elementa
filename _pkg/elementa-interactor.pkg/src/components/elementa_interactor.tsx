import { ElementaInteractor } from "~/src/elementa_interactor";
import { ElementaInteractorContext } from "../contexts/elementa_interactor";
import { elementaStyleSheet } from "../stylesheets/_";
import Interface from "./interface";
import { ContentHandleLayer } from "./layers/content/handle";
import { ContentSelectionLayer } from "./layers/content/selection";
import { FallbackLayer } from "./layers/editor/fallback";
import { GridLayer } from "./layers/editor/grid";
import { MarkerLayer } from "./layers/editor/marker";

const stylesheet = elementaStyleSheet({
  light: {
    background: "#fff",
    text: "#000",
    grid: "#88888815",
    selection: "#08f",
  },
  dark: {
    background: "#202020",
    text: "#fff",
    grid: "#88888815",
    selection: "#08f",
  },
});

export function ElementaInteractorComponent({
  interactor,
}: {
  interactor: ElementaInteractor;
}): JSX.Element {
  return (
    <ElementaInteractorContext.Provider value={interactor}>
      <style>{stylesheet}</style>
      <Interface
        interactor={interactor}
        layers={[
          {
            name: "fallback",
            content: <FallbackLayer />,
          },
          {
            name: "grid",
            content: <GridLayer />,
          },
          {
            name: "content",
            content: <ContentHandleLayer />,
          },
          {
            name: "marker",
            content: <MarkerLayer />,
          },
          {
            name: "selection",
            content: <ContentSelectionLayer />,
          },
        ]}
      />
    </ElementaInteractorContext.Provider>
  );
}

export default ElementaInteractorComponent;
