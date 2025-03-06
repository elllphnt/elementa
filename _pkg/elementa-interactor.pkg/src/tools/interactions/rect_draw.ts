import { combineLatestOrEmpty, PointData, RectData } from "@repo/utils";
import { ElementaInteractor } from "../../elementa_interactor";
import { MouseInteraction } from "./mouse";

export type RectDrawInteraction = {
  run(window: Window, start: PointData): void;
};

export function createRectDrawInteraction({
  interactor,
  onStart,
  onUpdate,
  onEnd,
  flag,
  proportionalOnShift,
}: {
  interactor: ElementaInteractor;
  onStart?: () => void;
  onUpdate?: (
    rect: RectData,
    keys: { shift: boolean; ctrl: boolean; alt: boolean },
  ) => void;
  onEnd?: (rect: RectData) => void;
  flag?: string;
  proportionalOnShift?: boolean;
}): RectDrawInteraction {
  const mouseInteraction = new MouseInteraction();

  const unsubscribeStart = mouseInteraction.on("start", () => {
    const marker = interactor.markerManager.createRectMarker();
    marker.update({
      fillColor: "#08f1",
    });

    const rectSubscription = combineLatestOrEmpty([
      mouseInteraction.rect$,
      mouseInteraction.shiftKey$,
      mouseInteraction.ctrlKey$,
      mouseInteraction.altKey$,
    ]).subscribe(([rect, shiftKey, ctrlKey, altKey]) => {
      let newRect = interactor.interface.rectWindowToInterface(rect);

      if (shiftKey && proportionalOnShift) {
        newRect.width = Math.min(newRect.width, newRect.height);
        newRect.height = newRect.width;
      }

      const pixelRect = interactor.stager.viewport.rectNearestPixel(newRect);

      marker.update(pixelRect);
      onUpdate?.(pixelRect, {
        shift: shiftKey,
        ctrl: ctrlKey,
        alt: altKey,
      });
    });

    interactor.setFlag(flag ?? "drawing", true);

    const unsubscribeStop = mouseInteraction.on("stop", () => {
      if (marker) {
        interactor.markerManager.removeMarker(marker);
      }
      setTimeout(() => {
        interactor.setFlag(flag ?? "drawing", false);
      }, 0);

      let _rect = { ...mouseInteraction.rect };
      if (mouseInteraction.shiftKey) {
        _rect.width = Math.min(_rect.width, _rect.height);
        _rect.height = _rect.width;
      }

      onEnd?.(_rect);
      rectSubscription.unsubscribe();
      unsubscribeStart();
      unsubscribeStop();
    });

    onStart?.();
  });

  function run(window: Window, start: PointData) {
    mouseInteraction.run(window, start);
  }

  return { run };
}
