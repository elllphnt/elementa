import { combineLatestOrEmpty, useObservable } from "@repo/utils";
import { useCallback, useEffect, useRef } from "react";
import { useElementaInteractor } from "~/src/hooks/elementa_interactor";

const MIN_CELL_SIZE = 4;
const GRID_SIZE = 8;

export function GridLayer() {
  const editor = useElementaInteractor();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const height = useObservable(
    editor.stager.viewport.height$,
    editor.stager.viewport.height,
  );
  const width = useObservable(
    editor.stager.viewport.width$,
    editor.stager.viewport.width,
  );
  const size = [width, height] as const;
  const viewport = editor.stager.viewport;

  // We will never have cell sizes smaller than MIN_CELL_SIZE.
  // Then the line count has an upper bound.
  // Which is the size of the viewport divided by MIN_CELL_SIZE.
  const lineCounts = [
    Math.ceil(size[0] / MIN_CELL_SIZE),
    Math.ceil(size[1] / MIN_CELL_SIZE),
  ];

  const hRefs = useRef<Array<HTMLDivElement | null>>([]);
  const vRefs = useRef<Array<HTMLDivElement | null>>([]);

  const update = useCallback(
    ({
      scale,
      pan,
      width,
      height,
    }: {
      scale: number;
      pan: { x: number; y: number };
      width: number;
      height: number;
    }) => {
      const root = rootRef.current;
      if (!root) return;

      if (scale < MIN_CELL_SIZE) {
        root.style.display = "none";
        return;
      } else {
        root.style.opacity = `${Math.min(
          1,
          (scale - MIN_CELL_SIZE) / (MIN_CELL_SIZE * 3),
        )}`;
        root.style.display = "block";
      }

      const originToEgdge = {
        x: pan.x + width / 2,
        y: pan.y + height / 2,
      };
      const firstVisiblePixel = {
        x: originToEgdge.x - Math.floor(originToEgdge.x / scale) * scale,
        y: originToEgdge.y - Math.floor(originToEgdge.y / scale) * scale,
      };
      const firstVisibleGridCell = {
        x:
          originToEgdge.x -
          Math.floor(originToEgdge.x / (scale * GRID_SIZE)) *
            (scale * GRID_SIZE),
        y:
          originToEgdge.y -
          Math.floor(originToEgdge.y / (scale * GRID_SIZE)) *
            (scale * GRID_SIZE),
      };

      const cellSize = scale < MIN_CELL_SIZE ? scale * GRID_SIZE : scale;
      const start =
        scale < MIN_CELL_SIZE ? firstVisibleGridCell : firstVisiblePixel;

      for (let i = 0; i < vRefs.current.length; i++) {
        const ref = vRefs.current[i];
        if (ref) {
          const left = start.x + i * cellSize;
          if (left > width) {
            ref.style.display = "none";
          } else {
            ref.style.opacity = "1";
            ref.style.display = "block";
            ref.style.left = `${left}px`;
          }
        }
      }

      for (let i = 0; i < hRefs.current.length; i++) {
        const ref = hRefs.current[i];
        if (ref) {
          const top = start.y + i * cellSize;
          if (top > height) {
            ref.style.display = "none";
          } else {
            ref.style.opacity = "1";
            ref.style.display = "block";
            ref.style.top = `${top}px`;
          }
        }
      }
    },
    [viewport],
  );

  useEffect(() => {
    const subscription = combineLatestOrEmpty([
      viewport.scale$,
      viewport.pan$,
      viewport.width$,
      viewport.height$,
    ]).subscribe(([scale, pan, width, height]) => {
      update({ scale, pan, width, height });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [update, viewport]);

  const hlines: Array<JSX.Element> = [];
  const vlines: Array<JSX.Element> = [];

  for (let i = 0; i < lineCounts[0]; i++) {
    vlines.push(
      <div
        key={i}
        ref={(r) => (vRefs.current[i] = r)}
        className="elementa-grid-vline"
      />,
    );
  }

  for (let i = 0; i < lineCounts[1]; i++) {
    hlines.push(
      <div
        key={i}
        ref={(r) => (hRefs.current[i] = r)}
        className="elementa-grid-hline"
      />,
    );
  }

  return (
    <div ref={rootRef} className="elementa-grid">
      {hlines}
      {vlines}
    </div>
  );
}
