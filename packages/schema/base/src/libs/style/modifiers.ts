import type {
  ElllSelectorData,
  StyleModifierData,
  StyleModifierDefinitionData} from "../../types/_.js";
import {
  StyleDataType,
  StyleModifierType,
} from "../../types/_.js";
import type { ErrorTupple } from "../../types/_primitives/error.js";
import { parseStyleData, stringifyStyleData } from "./datatypes/_.js";
import { baseSelector } from "./selectors.js";

export const systemModifiers = {
  condition: {
    id: "system:condition",
    name: "condition",
    type: StyleModifierType.Element,
    signature: [StyleDataType.String],
    selector: [".elll-condition-$1"],
    __crdtAtomic: ["signature", "selector"],
  },
  raw: {
    id: "system:raw",
    name: "raw",
    type: StyleModifierType.Context,
    signature: [StyleDataType.String],
    selector: ["$1"],
    __crdtAtomic: ["signature", "selector"],
  },
} satisfies Record<string, StyleModifierDefinitionData>;

export const styleModifierTypePredecences: Record<StyleModifierType, number> = {
  [StyleModifierType.Context]: 0,
  [StyleModifierType.Element]: 1,
};

export type GetModifierDefinition = (
  name: string
) => StyleModifierDefinitionData | undefined;

export function getSystemModifierDefinition(
  name: string
): StyleModifierDefinitionData | undefined {
  return (systemModifiers as any)[name];
}

export function stringifyStyleModifier({
  modifier,
  getModifierDefinition,
}: {
  modifier: StyleModifierData;
  getModifierDefinition: GetModifierDefinition;
}): ErrorTupple<string> {
  const definition =
    getSystemModifierDefinition(modifier.name) ||
    getModifierDefinition(modifier.name);
  if (!definition) {
    const error = new Error(`Unknown modifier: ${modifier.name}`);
    return [undefined, error];
  }
  if ((modifier.args?.length ?? 0) !== (definition.signature?.length ?? 0)) {
    const error = new Error(
      `Mismatched number of arguments for modifier ${modifier.name}. Expected ${
        definition.signature?.length ?? 0
      }, got ${modifier.args?.length ?? 0}`
    );
    return [undefined, error];
  }
  const name = modifier.name;
  const args = definition.signature
    ?.map((type, index) =>
      encodeURIComponent(stringifyStyleData(type, modifier.args?.[index]))
    )
    .join(",");
  if (args) {
    return [`${name}-[${args}]`, undefined];
  } else {
    return [`${name}`, undefined];
  }
}
export function parseStyleModifier({
  modifier,
  getModifierDefinition,
}: {
  modifier: string;
  getModifierDefinition: GetModifierDefinition;
}): ErrorTupple<StyleModifierData> {
  // eslint-disable-next-line no-useless-escape
  const regex = /^([^\[\]\s]+)(?:-\[(.*)\])?$/;
  const match = modifier.match(regex);

  if (!match) {
    const error = new Error(`Invalid modifier format: ${modifier}`);
    return [undefined, error];
  }

  const name = match[1];
  const args = match[2] ? match[2].split(",") : [];

  const definition =
    getSystemModifierDefinition(name) || getModifierDefinition(name);
  if (!definition) {
    const error = new Error(`Unknown modifier: ${name}`);
    return [undefined, error];
  }

  if (args.length !== (definition.signature?.length ?? 0)) {
    const error = new Error(
      `Mismatched number of arguments for modifier ${name}. Expected ${
        definition.signature?.length ?? 0
      }, got ${args.length}`
    );
    return [undefined, error];
  }

  const parsedArgs: any[] = [];
  if (definition.signature) {
    for (let i = 0; i < definition.signature.length; i++) {
      const type = definition.signature[i];
      const arg = args[i];
      const [parsedArg, err] = parseStyleData(type, decodeURIComponent(arg));
      if (err) return [undefined, err];
      parsedArgs.push(parsedArg);
    }
  }

  return [
    {
      name,
      args: parsedArgs ?? [],
    },
    undefined,
  ];
}
export function sortStyleModifiers({
  modifiers,
  getModifierDefinition,
}: {
  modifiers: StyleModifierData[];
  getModifierDefinition: GetModifierDefinition;
}): StyleModifierData[] {
  return modifiers.sort((a, b) => {
    const defA =
      getSystemModifierDefinition(a.name) || getModifierDefinition(a.name);
    const defB =
      getSystemModifierDefinition(b.name) || getModifierDefinition(b.name);
    const typePrecA = defA?.type
      ? styleModifierTypePredecences[defA.type]
      : Number.MAX_SAFE_INTEGER;
    const typePrecB = defB?.type
      ? styleModifierTypePredecences[defB.type]
      : Number.MAX_SAFE_INTEGER;
    if (typePrecA !== typePrecB) {
      return typePrecA - typePrecB;
    }
    const ownPrecA = defA?.predecence ?? Number.MAX_SAFE_INTEGER;
    const ownPrecB = defB?.predecence ?? Number.MAX_SAFE_INTEGER;
    if (ownPrecA !== ownPrecB) {
      return ownPrecA - ownPrecB;
    }
    return a.name.localeCompare(b.name);
  });
}
export function stringifyElllSelector({
  selector,
  getModifierDefinition,
}: {
  selector: ElllSelectorData;
  getModifierDefinition: GetModifierDefinition;
}): ErrorTupple<string> {
  if (!selector.length) return [baseSelector, undefined];
  const parts: string[] = [];
  const sortedModifiers = sortStyleModifiers({
    modifiers: selector,
    getModifierDefinition,
  });

  for (const modifier of sortedModifiers) {
    const [part, error] = stringifyStyleModifier({
      modifier,
      getModifierDefinition,
    });

    if (error) {
      return [undefined, error];
    } else {
      parts.push(part);
    }
  }

  return [parts.join(":"), undefined];
}
export function parseElllSelector({
  selector,
  getModifierDefinition,
}: {
  selector: string;
  getModifierDefinition: GetModifierDefinition;
}): ErrorTupple<ElllSelectorData> {
  if (selector === baseSelector) {
    return [[], undefined];
  }

  const parts = selector.split(":");
  const modifiers: ElllSelectorData = [];

  for (const part of parts) {
    const [parsedModifier, error] = parseStyleModifier({
      modifier: part,
      getModifierDefinition,
    });
    if (error) {
      return [undefined, error];
    }
    modifiers.push(parsedModifier);
  }
  return [modifiers, undefined];
}
