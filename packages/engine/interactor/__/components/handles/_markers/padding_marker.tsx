import {
  extractEvaluable,
  LengthData,
  stringifyLength,
} from "@elllphnt/elementa-base";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import { useEffect, useRef } from "react";
import { map, switchMap } from "rxjs";
import { ElementaEditorMode } from "~/_lib/mode";
import { ElementHandle } from "~/handles/_";
import { useElementaInteractor } from "~/hooks/elementa_interactor";
import { useEditorMode } from "../_hooks/mode.js";

export function PaddingMarker({ handle }: { handle: ElementHandle }) {
  const editor = useElementaInteractor();
  const ref = useRef<HTMLDivElement | null>(null);
  const [mode] = useEditorMode();

  useEffect(() => {
    const subscription = combineLatestOrEmpty([
      combineLatestOrEmpty([
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-top"))
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-right"))
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-bottom"))
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-left"))
        ),
      ]).pipe(
        map(([top, right, bottom, left]) => ({
          top: extractEvaluable<LengthData | undefined>(top as any)[1] ?? {
            value: 0,
            unit: "px",
          },
          right: extractEvaluable<LengthData | undefined>(right as any)[1] ?? {
            value: 0,
            unit: "px",
          },
          bottom: extractEvaluable<LengthData | undefined>(
            bottom as any
          )[1] ?? {
            value: 0,
            unit: "px",
          },
          left: extractEvaluable<LengthData | undefined>(left as any)[1] ?? {
            value: 0,
            unit: "px",
          },
        }))
      ),
      editor.stager.viewport.scale$,
    ]).subscribe(([padding, scale]) => {
      const el = ref.current;
      if (!el) return;

      const toCss = (padding: LengthData) =>
        `calc(${stringifyLength(padding)} * ${scale})`;

      el.style.setProperty("top", toCss(padding.top));
      el.style.setProperty("left", toCss(padding.left));
      el.style.setProperty("right", toCss(padding.right));
      el.style.setProperty("bottom", toCss(padding.bottom));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (mode !== ElementaEditorMode.Design) {
    return null;
  }

  return <div ref={ref} className={`elementa-padding-marker`} />;
}
