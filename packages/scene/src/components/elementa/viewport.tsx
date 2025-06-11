import { combineLatestOrEmpty, VectorData } from "@elllphnt/elementa-utils";
import {
  JSX,
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { ElementaStageRenderable } from "../../renderables/_.js";

export const Viewport = memo(function Viewport({
  stage,
  children,
}: PropsWithChildren<{
  stage: ElementaStageRenderable;
}>): JSX.Element {
  const viewport = stage.viewport;
  const rootRef = useRef<HTMLDivElement>(null);
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
    []
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

  // update rect
  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;

    function updateViewportRect() {
      const rect = root.getBoundingClientRect();
      viewport.setPosition(rect.x, rect.y);
      viewport.setSize(rect.width, rect.height);
      viewport.setInitialContentOrigin({
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      });
    }

    new ResizeObserver(updateViewportRect).observe(root);
    updateViewportRect();

    return () => {
      new ResizeObserver(updateViewportRect).disconnect();
    };
  }, []);

  const pan = viewport.pan;
  const scale = viewport.scale;

  return (
    <div ref={rootRef} className="elementa-viewport">
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
});

export default Viewport;
