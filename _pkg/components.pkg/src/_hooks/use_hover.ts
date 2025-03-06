import { useEffect, useState } from "react";

export function useHover<T extends Element>(ref: React.RefObject<T>) {
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const onMouseEnter = () => setHover(true);
    const onMouseLeave = () => setHover(false);

    const element = ref.current;
    if (element) {
      element.addEventListener("mouseenter", onMouseEnter);
      element.addEventListener("mouseleave", onMouseLeave);

      return () => {
        element.removeEventListener("mouseenter", onMouseEnter);
        element.removeEventListener("mouseleave", onMouseLeave);
      };
    }
  }, [ref]);

  return hover;
}
