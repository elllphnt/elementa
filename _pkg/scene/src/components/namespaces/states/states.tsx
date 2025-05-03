import { useObservable } from "@elllphnt/elementa-react-utils";
import { FragmentEnvironment } from "@elllphnt/elementa-runtime";
import { PropsWithChildren } from "react";

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
  // for (const state of reversedStates) {
  //   switchEntityType(
  //     state.entity.type,
  //     {
  //       [entityTypes.states.value]: () => {
  //         content = (
  //           <ValueStateNamespaceProvider
  //             key={state.key}
  //             state={state as ValueStateInstance}
  //           >
  //             {content}
  //           </ValueStateNamespaceProvider>
  //         );
  //       },
  //       [entityTypes.states.module]: () => {
  //         content = (
  //           <ModuleStateNamespaceProvider
  //             key={state.key}
  //             state={state as ModuleStateInstance}
  //           >
  //             {content}
  //           </ModuleStateNamespaceProvider>
  //         );
  //       },
  //     },
  //     () => {
  //       console.error(`Unknown state type: ${state.entity.type}`);
  //     }
  //   );
  // }

  return content;
}
