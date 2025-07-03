import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRect } from "~/_lib/use_rect.js";
import { useElementaInteractor } from "~/hooks/elementa_interactor.js";

const MIN_CELL_SIZE = 4;
const GRID_SIZE = 8;

export function GridLayer() {
  const editor = useElementaInteractor();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rect = useRect(rootRef);
  const height = rect?.height || 0;
  const width = rect?.width || 0;
  const viewport = editor.stage.viewport;

  const [gridState, setGridState] = useState({
    opacity: 0,
    display: "none",
    patternSize: 0,
    transform: "translate(0px, 0px)",
  });

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
      if (scale < MIN_CELL_SIZE) {
        setGridState({
          opacity: 0,
          display: "none",
          patternSize: 0,
          transform: "translate(0px, 0px)",
        });
        return;
      }

      const opacity = Math.min(
        1,
        (scale - MIN_CELL_SIZE) / (MIN_CELL_SIZE * 3)
      );
      const cellSize = scale < MIN_CELL_SIZE ? scale * GRID_SIZE : scale;

      // Calculate offset to align grid with viewport
      const originToEdge = {
        x: pan.x + width / 2,
        y: pan.y + height / 2,
      };

      const offset = {
        x: originToEdge.x % cellSize,
        y: originToEdge.y % cellSize,
      };

      setGridState({
        opacity,
        display: "block",
        patternSize: cellSize,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      });
    },
    [viewport]
  );

  useEffect(() => {
    const subscription = combineLatestOrEmpty([
      viewport.scale$,
      viewport.pan$,
    ]).subscribe(([scale, pan]) => {
      update({ scale, pan, width, height });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [update, viewport, width, height]);

  return (
    <div
      ref={rootRef}
      className="elementa-grid"
      style={{
        width: "100%",
        height: "100%",
        opacity: gridState.opacity,
        display: gridState.display,
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="grid-pattern"
            width={gridState.patternSize}
            height={gridState.patternSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridState.patternSize} 0 L 0 0 0 ${gridState.patternSize}`}
              fill="none"
              stroke="var(--theme-light-grid)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-pattern)"
          style={{ transform: gridState.transform }}
        />
      </svg>
    </div>
  );
}
