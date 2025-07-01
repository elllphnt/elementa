import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import {
  ComponentInstance,
  HookStateInstance,
  InlineStateInstance,
  ValueStateInstance,
} from "@elllphnt/elementa-runtime";
import { PropsWithChildren } from "react";
import { HookStateNamespaceProvider } from "./hook.js";
import { InlineStateNamespaceProvider } from "./inline.js";
import { ValueStateNamespaceProvider } from "./value.js";

export function StatesNamespaceProvider({
  children,
  component,
}: PropsWithChildren<{
  component: ComponentInstance;
}>) {
  logger.debug("Rendering StatesNamespaceProvider", {
    component,
    children,
  });

  const states = useObservable(component.states$, component.states);
  let content = <>{children}</>;

  logger.debug("StatesNamespaceProvider: States resolved", {
    states,
    stateCount: states.length,
  });

  // reverse the states order so that the first state becomes the outermost provider
  const reversedStates = [...states].reverse();

  logger.debug("StatesNamespaceProvider: Processing states in reverse order", {
    originalOrder: states.map((s) => ({ type: s.model.type, key: s.key })),
    reversedOrder: reversedStates.map((s) => ({
      type: s.model.type,
      key: s.key,
    })),
  });

  for (const state of reversedStates) {
    logger.debug("StatesNamespaceProvider: Wrapping with state provider", {
      stateType: state.model.type,
      stateKey: state.key,
      state,
    });

    switch (state.model.type) {
      case "value": {
        content = (
          <ValueStateNamespaceProvider
            key={state.key}
            state={state as ValueStateInstance}
          >
            {content}
          </ValueStateNamespaceProvider>
        );
        break;
      }
      case "hook": {
        content = (
          <HookStateNamespaceProvider
            key={state.key}
            state={state as HookStateInstance}
          >
            {content}
          </HookStateNamespaceProvider>
        );
        break;
      }
      case "inline": {
        content = (
          <InlineStateNamespaceProvider
            key={state.key}
            state={state as InlineStateInstance}
          >
            {content}
          </InlineStateNamespaceProvider>
        );
        break;
      }
      default:
        logger.warn("StatesNamespaceProvider: Unknown state type", {
          stateType: (state.model as any).type,
          state,
        });
    }
  }

  logger.debug("StatesNamespaceProvider: All state providers wrapped", {
    stateCount: states.length,
  });

  return content;
}
