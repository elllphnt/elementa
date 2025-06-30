import { pairwiseOrEmpty } from "@elllphnt/elementa-lang-utils";
import { ComponentType, useEffect, useRef } from "react";
import { map } from "rxjs";
import { useNamespace } from "../../../hooks/namespace.js";
import { ElementRenderable } from "../../../renderables/element/element.js";

export function InteractiveElementComponent<
  P extends {
    element: ElementRenderable;
    onRef?: (element: HTMLElement | null) => void;
  }
>(ComponentElement: ComponentType<P>) {
  return ({ element, onRef, ...props }: P) => {
    const namespace = useNamespace();
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
      let interactions: { type: string; handler: any }[] = [];

      const addInteractions = (
        interactions: { type: string; handler: any }[]
      ) => {
        interactions.forEach(({ type, handler }) => {
          ref.current?.addEventListener(type, handler);
        });
      };
      const removeInteractions = (
        interactions: { type: string; handler: any }[]
      ) => {
        interactions.forEach(({ type, handler }) => {
          ref.current?.removeEventListener(type, handler);
        });
      };

      const interactionsSubscription = element.instance.element.interactions$
        .pipe(
          map((interactions) => {
            return Object.entries(interactions ?? {});
          }),
          map((interactions) => {
            return interactions
              .map(([type, handler]) => {
                return {
                  type,
                  handler: namespace.resolveValue(handler),
                };
              })
              .filter(
                ({ handler, type }) =>
                  handler && type && typeof handler === "function"
              ) as {
              type: string;
              handler: any;
            }[];
          }),
          pairwiseOrEmpty()
        )
        .subscribe(([prev, next]) => {
          if (prev) {
            removeInteractions(prev);
          }
          if (next) {
            addInteractions(next);
          }

          interactions = next;
        });

      return () => {
        interactionsSubscription.unsubscribe();
        removeInteractions(interactions);
      };
    }, [element, namespace]);

    return (
      <ComponentElement
        element={element}
        onRef={(html: any) => {
          ref.current = html;
          onRef?.(html);
        }}
        {...(props as any)}
      />
    );
  };
}
