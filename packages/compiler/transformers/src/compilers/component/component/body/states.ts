import type { StateData } from "@elllphnt/elementa-base";

export function compileStates(states: StateData[]): string {
  return states.map((state) => compileState(state)).join("\n");
}

function compileState(state: StateData): string {
  const name = state.name || "state";

  if (state.type === "value") {
    const valueState = state as any; // Cast to access init property
    if (valueState.init?.kind === "evaluable") {
      return `  const [${name}, set${capitalize(name)}] = React.useState(${valueState.init.expression || "undefined"});`;
    } else if (valueState.init?.kind === "resolvable") {
      return `  const [${name}, set${capitalize(name)}] = React.useState(${JSON.stringify(valueState.init.value)});`;
    } else {
      return `  const [${name}, set${capitalize(name)}] = React.useState(undefined);`;
    }
  } else if (state.type === "hook") {
    const hookState = state as any; // Cast to access hook properties
    return `  const ${name} = ${hookState.hook || "React.useState()"}`;
  } else if (state.type === "inline") {
    const inlineState = state as any; // Cast to access inline properties
    return `  const ${name} = ${inlineState.expression || "undefined"};`;
  } else {
    return `  const [${name}, set${capitalize(name)}] = React.useState(undefined);`;
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
