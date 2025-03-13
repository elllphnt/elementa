import { forwardRef, useRef } from "react";

export const SaturationValuePicker = forwardRef<
  HTMLDivElement,
  {
    saturation?: number;
    value?: number;
    hue?: number;
    onChange?: (saturation: number, value: number) => void;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ saturation, value, hue, onChange, ...rest }, ref) => {
  const internalRef = useRef<HTMLDivElement | null>(null);

  // Combine forwarded ref with internal ref.
  const setRef = (el: HTMLDivElement) => {
    internalRef.current = el;
    if (typeof ref === "function") {
      ref(el);
    } else if (ref) {
      ref.current = el;
    }
  };

  function updateColor(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = internalRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newSaturation = Math.min(Math.max(x / rect.width, 0), 1);
    const newValue = Math.min(Math.max(1 - y / rect.height, 0), 1);
    onChange && onChange(newSaturation, newValue);
  }

  return (
    <div
      {...rest}
      ref={setRef}
      onMouseDown={updateColor}
      onMouseMove={(e) => {
        if (e.buttons !== 1) return;
        updateColor(e);
      }}
      style={{
        background: [
          //   `linear-gradient(0deg, #000, transparent)`,
          `linear-gradient(90deg, #fff, hsl(45deg 100% 50%))`,
        ].join(","),
        ...(rest.style || {}),
      }}
    />
  );
});
