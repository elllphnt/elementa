import { JSX } from "react";
import { ElementaInteractor } from "~/interactor";
import { ElementaInteractorContext } from "../contexts/elementa_interactor.js";
import Interface from "./interface.js";
import { ContentHandleLayer } from "./layers/content/handle.js";
import { ContentSelectionLayer } from "./layers/content/selection.js";
import { FallbackLayer } from "./layers/editor/fallback.js";
import { GridLayer } from "./layers/editor/grid.js";
import { MarkerLayer } from "./layers/editor/marker.js";

export function ElementaInteractorComponent({
  interactor,
}: {
  interactor: ElementaInteractor;
}): JSX.Element {
  return (
    <ElementaInteractorContext.Provider value={interactor}>
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
