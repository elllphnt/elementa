import {
  ComponentData,
  entityTypes,
  OverflowValue,
} from "@elllphnt/elll-element";
import { ComponentCompilerResult } from "../types/component.js";
import { createComponentCompilerContext } from "./_context.js";
import { getName } from "./_lib/names.js";
import { compileFragment } from "./fragment.js";
import { compileState } from "./state.js";
import { compileTransformer } from "./transformers.js";

export function compileComponent(
  data: ComponentData,
  options?: {
    viewport?: {
      overflow: OverflowValue;
    };
  }
): ComponentCompilerResult {
  const context = createComponentCompilerContext();

  const template = compileFragment(
    {
      type: entityTypes.fragment,
      ...data.template,
      _id: "template",
    },
    context,
    {
      viewport: options?.viewport,
    }
  );
  const states = data.states?.map((data) => compileState(data, context)) ?? [];
  const fragments =
    data.fragments?.map((data) => compileFragment(data, context)) ?? [];
  const transformers =
    data.transformers?.map((data) => compileTransformer(data, context)) ?? [];

  const componentDependencies = context.getComponentDependencies();
  const moduleDependencies = context.getModuleDependencies();
  const styleDependencies = context.getStyleDependencies();

  return {
    generate: (_names) => {
      const newNames = { ..._names };
      const componentRenamingCodes: string[] = componentDependencies.map(
        (dependency, index) => {
          const name = getName(newNames, dependency.key);
          const newName = `Component_${index}`;
          newNames[dependency.key] = newName;
          return `const ${newName} = ${name};`;
        }
      );

      const templateCode = `const template = (${template.generate(newNames)})`;
      const stateCodes = [
        `const states = {`,
        ...states.map((state) => {
          return `"${state.source._id}": (${state.generate(newNames)})`;
        }),
        `}`,
      ].join("\n");
      const fragmentCodes = [
        `const fragments = {`,
        ...fragments.map((fragment) => {
          return `"${fragment.id}": (${fragment.generate(newNames)})`;
        }),
        `}`,
      ].join("\n");
      const transformerCodes = [
        `const transformers = {`,
        ...transformers.map((transformer) => {
          return `"${transformer.source._id}": (${transformer.generate(
            newNames
          )})`;
        }),
        `}`,
      ].join("\n");

      return [
        `function (props={}) {`,
        ...componentRenamingCodes,
        stateCodes,
        fragmentCodes,
        transformerCodes,
        templateCode,
        `return template();`,
        `}`,
      ].join("\n");
    },
    dependencies: [
      ...styleDependencies,
      ...componentDependencies,
      ...moduleDependencies,
    ],
  };
}
