import { StageViewport } from "@elllphnt/elementa-scene";
import React, { useCallback, useEffect, useState } from "react";

interface ViewportControlsProps {
  viewport: StageViewport | null;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({
  viewport,
}) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!viewport) return;

    const scaleSubscription = viewport.scale$.subscribe(setScale);
    const panSubscription = viewport.pan$.subscribe(setPan);

    return () => {
      scaleSubscription.unsubscribe();
      panSubscription.unsubscribe();
    };
  }, [viewport]);

  const handleZoomIn = useCallback(() => {
    if (!viewport) return;
    viewport.scaleBy(0.1, {
      x: viewport.width / 2,
      y: viewport.height / 2,
    });
  }, [viewport]);

  const handleZoomOut = useCallback(() => {
    if (!viewport) return;
    viewport.scaleBy(-0.1, {
      x: viewport.width / 2,
      y: viewport.height / 2,
    });
  }, [viewport]);

  const handlePanUp = useCallback(() => {
    if (!viewport) return;
    viewport.panBy(0, 20);
  }, [viewport]);

  const handlePanDown = useCallback(() => {
    if (!viewport) return;
    viewport.panBy(0, -20);
  }, [viewport]);

  const handlePanLeft = useCallback(() => {
    if (!viewport) return;
    viewport.panBy(20, 0);
  }, [viewport]);

  const handlePanRight = useCallback(() => {
    if (!viewport) return;
    viewport.panBy(-20, 0);
  }, [viewport]);

  const handleReset = useCallback(() => {
    if (!viewport) return;
    viewport.scaleTo(1);
    viewport.panTo({ x: 0, y: 0 });
  }, [viewport]);

  const handleFitContent = useCallback(() => {
    if (!viewport) return;
    // Fit to a default content rect - adjust as needed
    viewport.fitContentRect({ x: 0, y: 0, width: 400, height: 300 });
  }, [viewport]);

  if (!viewport) return null;

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white border border-fg-200 rounded-lg p-2 shadow-lg">
      <div className="flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
          title="Zoom Out"
        >
          −
        </button>
      </div>

      <div className="border-t border-fg-200 pt-2">
        <div className="grid grid-cols-3 gap-1 mb-2">
          <div></div>
          <button
            onClick={handlePanUp}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Pan Up"
          >
            ↑
          </button>
          <div></div>
          <button
            onClick={handlePanLeft}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Pan Left"
          >
            ←
          </button>
          <div></div>
          <button
            onClick={handlePanRight}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Pan Right"
          >
            →
          </button>
          <div></div>
          <button
            onClick={handlePanDown}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Pan Down"
          >
            ↓
          </button>
          <div></div>
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={handleReset}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Reset View"
          >
            Reset
          </button>
          <button
            onClick={handleFitContent}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="Fit Content"
          >
            Fit
          </button>
        </div>
      </div>

      <div className="border-t border-fg-200 pt-2 text-xs text-gray-600">
        <div>Scale: {(scale * 100).toFixed(0)}%</div>
        <div>
          Pan: {pan.x.toFixed(0)}, {pan.y.toFixed(0)}
        </div>
      </div>
    </div>
  );
};
