import cx from "classnames";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import type { ElementaInteractor } from "~/interactor.js";

export type LayerData = {
  name: string;
  content: React.ReactNode;
};

export function Interface({
  layers,
  interactor,
}: {
  interactor: ElementaInteractor;
  layers: LayerData[];
}): JSX.Element {
  const intrface = interactor.interface;
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  // New state to track space panning mode
  const [isSpacePanning, setIsSpacePanning] = useState(false);

  // Listen for space key to toggle pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePanning(true);
        root?.classList.add("space-panning");
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePanning(false);
        root?.classList.remove("space-panning");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [root]);

  // wheel event
  useEffect(() => {
    if (!root) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      intrface.handleWheel(e);
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      root.removeEventListener("wheel", onWheel);
    };
  }, [intrface, root]);

  // update rect
  useEffect(() => {
    if (!root) return;

    function updateViewportRect() {
      if (!root) return;
      const rect = root.getBoundingClientRect();
      intrface.setPosition(rect.x, rect.y);
      intrface.setSize(rect.width, rect.height);
      console.debug(
        `Viewport rect updated: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}`
      );
    }

    new ResizeObserver(updateViewportRect).observe(root);
    updateViewportRect();

    return () => {
      new ResizeObserver(updateViewportRect).disconnect();
    };
  }, [root, intrface]);

  // Add mouse drag handling when in space panning mode
  useEffect(() => {
    if (!root) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!isSpacePanning) return;
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      let lastX = startX;
      let lastY = startY;
      const onMouseMove = (moveEvent: MouseEvent) => {
        const currentX = moveEvent.clientX;
        const currentY = moveEvent.clientY;
        const deltaX = currentX - lastX;
        const deltaY = currentY - lastY;
        lastX = currentX;
        lastY = currentY;
        // Pan in the opposite direction of the mouse movement
        intrface.interactor.stage.viewport.panBy(deltaX, deltaY);
      };
      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };
    root.addEventListener("mousedown", handleMouseDown, { capture: true });
    return () => {
      root.removeEventListener("mousedown", handleMouseDown, { capture: true });
    };
  }, [isSpacePanning, intrface, root]);

  // // flags classes
  // useEffect(() => {
  //   const flagsSubscription = intrface.interactor.flags$.subscribe((flags) => {
  //     for (const [flag, value] of Object.entries(flags)) {
  //       if (value) {
  //         ref.current?.classList.add(`flag-${flag}`);
  //       } else {
  //         ref.current?.classList.remove(`flag-${flag}`);
  //       }
  //     }
  //   });

  //   return () => {
  //     flagsSubscription.unsubscribe();
  //   };
  // }, [intrface]);

  // // tool classes
  // useEffect(() => {
  //   const toolSubscription = intrface.interactor.toolManager.tool$.subscribe(
  //     (tool) => {
  //       ref.current?.classList.forEach((className) => {
  //         if (className.startsWith("tool-")) {
  //           ref.current?.classList.remove(className);
  //         }
  //       });

  //       ref.current?.classList.add(`tool-${tool.name}`);
  //     },
  //   );

  //   return () => {
  //     toolSubscription.unsubscribe();
  //   };
  // }, [intrface]);

  // // dropping class
  // useEffect(() => {
  //   const handleDragStart = (event: DragEvent) => {
  //     intrface.interactor.setFlag("dropping", true);

  //     const handleDragEnd = () => {
  //       intrface.interactor.setFlag("dropping", false);
  //     };
  //     event.target?.addEventListener("dragend", handleDragEnd);
  //   };

  //   window.addEventListener("dragstart", handleDragStart);

  //   return () => {
  //     window.removeEventListener("dragstart", handleDragStart);
  //   };
  // }, [intrface]);

  const layerContent = (
    <>
      {layers.map((layer) => (
        <div
          key={layer.name}
          className={cx(
            "elementa-layer",
            "elementa-control",
            `elementa-layer-${layer.name}`
          )}
        >
          {layer.content}
        </div>
      ))}
    </>
  );

  return (
    <div
      className="elementa-interface"
      ref={setRoot}
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {layerContent}
    </div>
  );
}
