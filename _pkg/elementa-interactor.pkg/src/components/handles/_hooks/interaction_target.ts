import { useEffect, useRef } from "react";
import { Handle } from "~/src/handles/handle";

export function useHandleDom(handle: Handle) {
  const rectsRef = useRef<(string | null)[]>([]);
  const targetsRef = useRef<HTMLElement[]>([]);

  function setRectHtmlElement(
    ...args:
      | [HTMLElement | undefined | null]
      | [string, HTMLElement | undefined | null]
  ) {
    let key: string | undefined;
    let htmlElement: HTMLElement | undefined | null;

    if (args.length === 1) {
      key = undefined;
      htmlElement = args[0];
    } else {
      key = args[0];
      htmlElement = args[1];
    }

    if (key) {
      handle.setRectHtmlElement(key, htmlElement);
    } else {
      handle.setRectHtmlElement(htmlElement);
    }
    rectsRef.current.push(key ?? null);
  }

  function addInteractionTarget(target: HTMLElement | undefined | null) {
    if (!target) return;
    handle.addInteractionTarget(target);
    targetsRef.current.push(target);
  }

  useEffect(() => {
    return () => {
      rectsRef.current.forEach((key) => {
        if (key) {
          handle.setRectHtmlElement(key, null);
        } else {
          handle.setRectHtmlElement(null);
        }
      });

      targetsRef.current.forEach((target) => {
        handle.removeInteractionTarget(target);
      });

      rectsRef.current = [];
      targetsRef.current = [];
    };
  }, []);

  return { setRectHtmlElement, addInteractionTarget };
}
