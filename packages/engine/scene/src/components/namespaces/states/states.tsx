import { useObservable } from "@elllphnt/elementa-react-utils";
import {
  ComponentInstance,
  HookStateInstance,
  InlineStateInstance,
  ValueStateInstance,
} from "@elllphnt/elementa-runtime";
import { PropsWithChildren } from "react";
import { renderingLogger } from "../../../loggers.js";
import { HookStateNamespaceProvider } from "./hook.js";
import { InlineStateNamespaceProvider } from "./inline.js";
import { ValueStateNamespaceProvider } from "./value.js";

export function StatesNamespaceProvider({
  children,
  component,
}: PropsWithChildren<{
  component: ComponentInstance;
}>) {
  const states = useObservable(component.states$, component.states);
  let content = <>{children}</>;

  // reverse the states order so that the first state becomes the outermost provider
  const reversedStates = [...states].reverse();

  for (const state of reversedStates) {
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
        renderingLogger.warn("StatesNamespaceProvider: Unknown state type", {
          stateType: (state.model as any).type,
          state,
        });
    }
  }

  renderingLogger.debug("StatesNamespaceProvider", {
    states,
    component,
    content,
  });

  return content;
}
