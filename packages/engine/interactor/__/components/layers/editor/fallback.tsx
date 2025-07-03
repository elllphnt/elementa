import { useEffect, useLayoutEffect, useRef } from "react";
import { useElementaInteractor } from "~/hooks/elementa_interactor";

export function FallbackLayer() {
  const interactor = useElementaInteractor();
  const handle = interactor.fallback;
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const htmlElement = ref.current;
    if (!htmlElement) return;

    handle.addInteractionTarget(htmlElement);

    return () => {
      handle.removeInteractionTarget(htmlElement);
    };
  }, [handle]);

  useEffect(() => {
    // drop target subscription
    // const dropTargetSubscription = combineLatestOrEmpty([
    //   handle.isDropTarget$,
    // ]).subscribe(([dropTarget]) => {
    //   const element = ref.current;
    //   if (!element) return;
    //   if (dropTarget) {
    //     element.classList.add("drop-target");
    //   } else {
    //     element.classList.remove("drop-target");
    //   }
    // });
    // host drop target subscription
    // const hostDropTargetSubscription = combineLatestOrEmpty([
    //   handle.isHostDropTarget$,
    // ]).subscribe(([dropTarget]) => {
    //   const element = ref.current;
    //   if (!element) return;
    //   if (dropTarget) {
    //     element.classList.add("host-drop-target");
    //   } else {
    //     element.classList.remove("host-drop-target");
    //   }
    // });
    // return () => {
    //   dropTargetSubscription.unsubscribe();
    //   hostDropTargetSubscription.unsubscribe();
    // };
  }, [handle]);

  return <div ref={ref} className="elementa-fallback" />;
}
