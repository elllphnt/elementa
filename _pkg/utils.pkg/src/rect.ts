import { RefObject, useEffect, useState } from "react";

export function useRect(ref: RefObject<HTMLElement>) {
  const [rect, setRect] = useState<DOMRect | undefined>(undefined);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      setRect(entries[0].contentRect);
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return rect;
}
