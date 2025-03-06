import { combineLatestOrEmpty, useObservable, VectorData } from "@repo/utils";
import { useCallback, useEffect, useRef } from "react";
import { useElementaInteractor } from "~/src/hooks/elementa_interactor";

function WidgetList() {
  const editor = useElementaInteractor();
  const controllers = useObservable(
    editor.stager.controllers$,
    editor.stager.controllers,
  );

  return (
    <>
      {/* {controllers.map((controller) => (
        <ControllerComponent key={controller.key} controller={controller} />
      ))} */}
    </>
  );
}

export function WidgetLayerContent(): JSX.Element {
  const editor = useElementaInteractor();
  const viewport = editor.stager.viewport;
  const containerRef = useRef<HTMLDivElement>(null);

  const updateContainer = useCallback(
    ({
      pan,
      scale,
      contentVisible,
    }: {
      pan: VectorData;
      scale: number;
      contentVisible: boolean;
    }) => {
      const container = containerRef.current;
      if (!container) return;
      container.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;
      container.style.visibility = contentVisible ? "visible" : "hidden";
    },
    [],
  );

  // subscribe to viewport changes
  useEffect(() => {
    const subscription = combineLatestOrEmpty([
      viewport.pan$,
      viewport.scale$,
      viewport.contentVisible$,
    ]).subscribe(([pan, scale, contentVisible]) => {
      updateContainer({ pan, scale, contentVisible });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const pan = viewport.pan;
  const scale = viewport.scale;

  return (
    <div
      ref={containerRef}
      className="elementa-content interactive"
      style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
      }}
    >
      <WidgetList />
    </div>
  );
}

export function WidgetLayer(): JSX.Element {
  return <WidgetLayerContent />;
}
