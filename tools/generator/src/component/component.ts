import { ComponentData, componentSchema } from "@elllphnt/elementa-base";
import { transpileComponent } from "@elllphnt/elementa-react-transpiler";
import nodepath from "path";
import { BuildContext } from "../../context/context.js";
import { jsAppPaths } from "../../js_app/paths.js";
import { writeFile } from "../../utils/fs.js";
import { BuilderComponentTranspilerContext } from "./context.js";

export async function generateComponent({
  context,
  absoluteUrl,
  rootDir,
  generatedResources,
}: {
  context: BuildContext;
  absoluteUrl: string;
  rootDir: string;
  generatedResources: Set<string>;
}) {
  if (generatedResources.has(absoluteUrl)) {
    return;
  }

  const componentContent = await context.fs.read(absoluteUrl);
  if (!componentContent) {
    context.logger.error(`Component not found: ${absoluteUrl}`);
    throw new Error(`Component not found: ${absoluteUrl}`);
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

  const componentPath = jsAppPaths.resource(absoluteUrl);
  const absoluteComponentPath = nodepath.join(rootDir, componentPath);

  await writeFile(absoluteComponentPath, moduleCode);
}
