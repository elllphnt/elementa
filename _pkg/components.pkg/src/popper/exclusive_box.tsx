import React from "react";

export const exlusiveBoxIgnoreClassName = "ignore-exclusive-box";

export function ExclusiveBox({
  onClose,
  onRef,
  ...props
}: {
  onClose: () => void;
  onRef?: (ref: HTMLDivElement | null) => void;
} & JSX.IntrinsicElements["div"]) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // omit element with the classname exlusiveBoxIgnoreClassName
      if (
        (event.target as HTMLElement).closest(`.${exlusiveBoxIgnoreClassName}`)
      ) {
        return;
      }

      // close the box if the click is outside the box
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [ref, onClose]);

  return (
    <div
      {...props}
      ref={(el) => {
        if (onRef) {
          onRef(el);
        }
        ref.current = el;
      }}
    />
  );
}
