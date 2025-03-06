import { exlusiveBoxIgnoreClassName } from "@repo/components";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRendererModal } from "../_hooks";

function subModalClassName(key: number) {
  return `sub-modal-${key}`;
}

function axisAlignedBoxOffset({
  containerSize,
  boxSize,
  anchorPosition,
  anchorSize,
  align,
}: {
  containerSize: number;
  boxSize: number;
  anchorPosition: number;
  anchorSize: number;
  align: "start" | "center" | "end";
}) {
  const maxOffset = containerSize - boxSize;
  let offsetCandidate = 0;

  switch (align) {
    case "start":
      offsetCandidate = anchorPosition;
      break;
    case "center":
      offsetCandidate = anchorPosition + anchorSize / 2 - boxSize / 2;
      break;
    case "end":
      offsetCandidate = anchorPosition + anchorSize - boxSize;
      break;
  }

  offsetCandidate = Math.min(maxOffset, Math.max(0, offsetCandidate));
  return offsetCandidate;
}

function resolveBoxOffset({
  containerRect,
  boxRect,
  anchorRect,
  axis,
  align,
}: {
  containerRect: DOMRect;
  boxRect: DOMRect;
  anchorRect?: DOMRect;
  axis: "x" | "y";
  align: "start" | "center" | "end";
}): number {
  const containerSize =
    axis === "x" ? containerRect.width : containerRect.height;
  const boxSize = axis === "x" ? boxRect.width : boxRect.height;
  const anchorPosition =
    axis === "x"
      ? (anchorRect?.left || 0) - containerRect.left
      : (anchorRect?.top || 0) - containerRect.top;
  const anchorSize =
    axis === "x" ? anchorRect?.width || 0 : anchorRect?.height || 0;

  return axisAlignedBoxOffset({
    containerSize,
    boxSize,
    anchorPosition,
    anchorSize,
    align,
  });
}

export function AnchoredModalBox({
  axis,
  children,
  align = "start",
}: PropsWithChildren<{
  axis: "x" | "y";
  align?: "start" | "center" | "end";
}>): JSX.Element {
  const { modal, hide, parent } = useRendererModal();
  const boxRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
  });

  const updatePosition = useCallback(() => {
    const box = boxRef.current;
    const container = box?.parentElement;

    if (container && box) {
      const containerRect = container.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();
      const anchorRect = modal.anchor?.getBoundingClientRect();

      const offset = resolveBoxOffset({
        containerRect,
        boxRect,
        anchorRect,
        axis,
        align,
      });

      if (axis === "x") {
        setPosition({ left: offset, top: 0 });
      } else {
        setPosition({ left: 0, top: offset });
      }
    } else {
    }
  }, [modal, axis, align]);

  // watch container size
  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(updatePosition);
    updatePosition();

    const box = boxRef.current;
    const container = box?.parentElement;

    if (container) {
      resizeObserver.observe(container);
    }
    if (box) {
      resizeObserver.observe(box);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [axis, align, modal.key]);

  // click outside
  useEffect(() => {
    const box = boxRef.current;
    if (box) {
      function handleClick(e: MouseEvent) {
        if (
          box &&
          document.body.contains(e.target as HTMLElement) &&
          document.body.contains(box) &&
          !box.contains(e.target as Node) &&
          !(e.target as HTMLElement).closest(`.sub-modal-${modal.key}`) &&
          !(e.target as HTMLElement).closest(`.${exlusiveBoxIgnoreClassName}`)
        ) {
          // We need to handle the hideModal in the mouse up to allow click events to be processed.
          // This is because the click event does not fire on mouse down.
          const handleMouseUp = (e: MouseEvent) => {
            setTimeout(() => {
              hide(modal.key);
            }, 0);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          document.addEventListener("mouseup", handleMouseUp);
        }
      }

      setTimeout(() => {
        document.addEventListener("mousedown", handleClick);
      }, 0);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [modal]);

  let className: string | undefined = undefined;

  if (parent) {
    className = subModalClassName(parent.key);
  }

  return (
    <div
      ref={boxRef}
      className={className}
      style={{
        position: "relative",
        marginLeft: position.left,
        marginTop: position.top,
        width: "fit-content",
        height: "fit-content",
      }}
    >
      {children}
    </div>
  );
}
