import { XYCoord, useDragLayer } from "react-dnd";

export function DragLayer() {
  const {
    itemType,
    isDragging,
    initialCursorOffset,
    initialFileOffset,
    currentFileOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialCursorOffset: monitor.getInitialClientOffset(),
    initialFileOffset: monitor.getInitialSourceClientOffset(),
    currentFileOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 100,
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        border: "10px solid red",
      }}
    >
      <div
        style={getItemStyles(
          initialCursorOffset,
          initialFileOffset,
          currentFileOffset,
        )}
      >
        <div>Your custom drag preview component logic here</div>
      </div>
    </div>
  );
}

function getItemStyles(
  initialCursorOffset: XYCoord | null,
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
) {
  if (!initialOffset || !currentOffset || !initialCursorOffset) {
    return {
      display: "none",
    };
  }

  const x = initialCursorOffset?.x + (currentOffset.x - initialOffset.x);
  const y = initialCursorOffset?.y + (currentOffset.y - initialOffset.y);
  const transform = `translate(${x}px, ${y}px)`;

  return {
    transform,
    WebkitTransform: transform,
    background: "red",
    width: "200px",
  };
}
