import { useObservable } from "@elllphnt/elementa-react-utils";
import {
  FragmentEnvironment,
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
  environment,
}: PropsWithChildren<{
  environment: FragmentEnvironment;
}>) {
  const states = useObservable(environment.states$, environment.states);
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
    }
  }

  return content;
}
