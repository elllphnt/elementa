import { GoogleTypefaceBrowser } from "./google_typeface_browser";

export function TypefaceManager({
  onTypeface,
}: {
  onTypeface?: (typeface: any) => void;
}): JSX.Element {
  return (
    <div
      style={{
        height: 480,
        width: 720,
      }}
    >
      <GoogleTypefaceBrowser />
    </div>
  );
}
