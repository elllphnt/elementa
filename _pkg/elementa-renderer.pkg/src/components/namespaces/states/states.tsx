import { entityTypes, switchEntityType } from "@elllphnt/elll-element";
import {
  FragmentEnvironment,
  ModuleStateInstance,
  ValueStateInstance,
} from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { PropsWithChildren } from "react";
import { ModuleStateNamespaceProvider } from "./module";
import { ValueStateNamespaceProvider } from "./value";

export function StatesNamespaceProvider({
  children,
  environment,
}: PropsWithChildren<{
  environment: FragmentEnvironment;
}>): JSX.Element {
  const states = useObservable(environment.states$, environment.states);
  let content = <>{children}</>;

  for (const state of states) {
    switchEntityType(
      state.entity.type,
      {
        [entityTypes.states.value]: () => {
          content = (
            <ValueStateNamespaceProvider
              key={state.key}
              state={state as ValueStateInstance}
            >
              {content}
            </ValueStateNamespaceProvider>
          );
        },
        [entityTypes.states.module]: () => {
          content = (
            <ModuleStateNamespaceProvider
              key={state.key}
              state={state as ModuleStateInstance}
            >
              {content}
            </ModuleStateNamespaceProvider>
          );
        },
      },
      () => {
        console.error(`Unknown state type: ${state.entity.type}`);
      },
    );
  }

  return content;
}
