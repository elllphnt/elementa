import { ComponentData, componentSchema } from "@elllphnt/elementa-base";
import { transpileComponent } from "@elllphnt/elementa-react-transpiler";
import { GeneratorContext } from "../../context/context.js";
import { jsAppPaths } from "../../js_app/paths.js";
import { BuilderComponentTranspilerContext } from "./context.js";

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

  const component = componentSchema.parse(
    JSON.parse(componentContent)
  ) as ComponentData;
  const transpilerContext = new BuilderComponentTranspilerContext();
  const transpilation = transpileComponent(component, transpilerContext);
  const environment = await transpilerContext.resolveEnvironment();
  const componentCode = transpilation.generate(environment);

  const moduleCode = [
    transpilerContext.importMap.toCode(),
    `const Component = ${componentCode};`,
    `export default Component;`,
  ].join("\n");

  const componentPath = jsAppPaths.resource(url);
  await context.out.write(componentPath, moduleCode);
}
