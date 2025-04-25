import { combineLatestOrEmpty, VectorData } from "@repo/utils";
import { PropsWithChildren, useCallback, useEffect, useRef } from "react";
import { ElementaStager } from "~/src/elementa_stager";

export function Viewport({
  renderer,
  children,
}: PropsWithChildren<{
  renderer: ElementaStager;
}>): JSX.Element {
  const viewport = renderer.viewport;
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
    <div className="elementa-viewport">
      <div
        className="elementa-content"
        ref={containerRef}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Viewport;
