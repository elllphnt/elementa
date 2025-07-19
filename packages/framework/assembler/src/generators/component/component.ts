import { generateComponentModule } from "@elllphnt/elementa-transformers";
import type { GeneratorContext } from "../../context/context.js";
import { jsAppPaths } from "../../js_app/paths.js";

export async function generateComponent({
  url,
  context,
  generatedResources,
}: {
  context: GeneratorContext;
  url: string;
  generatedResources: Set<string>;
}) {
  if (generatedResources.has(url)) {
    return;
  }

  const componentContent = await context.infra.read(url);
  if (!componentContent) {
    throw new Error(`Component not found: ${url}`);
  }

  // const component = componentSchema.parse(
  //   JSON.parse(componentContent)
  // ) as ComponentData;
  const component = JSON.parse(componentContent);
  const code = generateComponentModule(component);

  await context.out.write(jsAppPaths.resource(url), code);
}
