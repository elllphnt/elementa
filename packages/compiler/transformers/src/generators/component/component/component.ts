import type { ComponentData } from "@elllphnt/elementa-base";
import type { SourceFile } from "ts-morph";
import type { GeneratorContext } from "~/generators/component/types.js";
import { denormalizeComponentFunction } from "../denormalization/denormalize.js";
import { generateComponentFunctionBody } from "./body/body.js";
import { generateComponentFunctionParams } from "./params.js";

export function generateComponentFunction({
  name,
  sourceFile,
  data,
  context,
}: {
  name: string;
  sourceFile: SourceFile;
  data: ComponentData;
  context: GeneratorContext;
}) {
  const node = sourceFile.addFunction({
    name,
  });

  generateComponentFunctionParams({
    node,
    data,
    context,
  });
  generateComponentFunctionBody({
    node,
    data,
    context,
  });

  denormalizeComponentFunction(node);
}
