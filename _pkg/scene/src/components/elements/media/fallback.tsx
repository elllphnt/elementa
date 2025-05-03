import { JSX } from "react";
import { MediaElementRenderable } from "../../../renderables/element/media";
import { BaseElementComponent } from "../_/_base_element";

const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
<pattern id="infinite-lines" patternUnits="userSpaceOnUse" width="20" height="20">
<path d="M0,20 L20,0 M-5,5 l10,-10 M15,25 l10,-10" stroke="gray" strokeWidth="0.5"/>
</pattern>
<rect width="100" height="100" fill="url(#infinite-lines)"/>
</svg>
`;
const blob = new Blob([svgString], { type: "image/svg+xml" });
const svgUrl = URL.createObjectURL(blob);

export function MediaElementFallback({
  element,
}: {
  element: MediaElementRenderable;
}): JSX.Element {
  return (
    <BaseElementComponent
      element={element}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: `url(${svgUrl})`,
          backgroundRepeat: "repeat",
          backgroundColor: "white",
        }}
      />
    </BaseElementComponent>
  );
}

export default MediaElementFallback;
