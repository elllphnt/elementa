import { useObservable } from "@repo/utils";
import { useElementaInteractor } from "~/src/hooks/elementa_interactor";
import { LineMarker, Marker, RectMarker } from "~/src/primitives/markers";

export function RectMarkerView({ marker }: { marker: RectMarker }) {
  const x = useObservable(marker.x$, marker.x);
  const y = useObservable(marker.y$, marker.y);
  const width = useObservable(marker.width$, marker.width);
  const height = useObservable(marker.height$, marker.height);
  const borderColor = useObservable(marker.borderColor$, marker.borderColor);
  const borderWidth = useObservable(marker.borderWidth$, marker.borderWidth);
  const borderStyle = useObservable(marker.borderStyle$, marker.borderStyle);
  const fillColor = useObservable(marker.fillColor$, marker.fillColor);

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        width: width,
        height: height,
        borderColor: borderColor || "#08f",
        borderWidth: borderWidth || 1,
        borderStyle: borderStyle || "solid",
        backgroundColor: fillColor || "transparent",
      }}
    />
  );
}
export function LineMarkerView({ marker }: { marker: LineMarker }) {
  const x = useObservable(marker.x$, marker.x);
  const y = useObservable(marker.y$, marker.y);
  const start = useObservable(marker.start$, marker.start);
  const end = useObservable(marker.end$, marker.end);
  const color = useObservable(marker.color$, marker.color);
  const width = useObservable(marker.width$, marker.width);

  const style: React.CSSProperties = {};

  const _start = start === undefined ? "0px" : `${start}px`;
  const _end = end === undefined ? "100%" : `${end}px`;

  if (typeof x === "number") {
    style.left = x;
    style.top = `min(${_start}, ${_end})`;
    style.bottom = `calc(100% - max(${_start}, ${_end}))`;
    style.width = 1;
    style.transform = "translateX(-50%)";
  }

  if (typeof y === "number") {
    style.top = y;
    style.left = `min(${_start}, ${_end})`;
    style.right = `calc(100% - max(${_start}, ${_end}))`;
    style.height = 1;
    style.transform = "translateY(-50%)";
  }

  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: color || "#08f",
        ...style,
      }}
    />
  );
}
export function MarkerView({ marker }: { marker: Marker }) {
  if (marker instanceof RectMarker) {
    return <RectMarkerView marker={marker} />;
  }
  if (marker instanceof LineMarker) {
    return <LineMarkerView marker={marker} />;
  }
  return null;
}

export function MarkerLayer() {
  const elementa = useElementaInteractor();
  const markers = useObservable(
    elementa.markerManager.markers$,
    elementa.markerManager.markers,
  );

  return (
    <>
      {markers.map((marker) => (
        <MarkerView key={marker.key} marker={marker} />
      ))}
    </>
  );
}
