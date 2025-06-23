import { ComponentData, componentSchema } from "@elllphnt/elementa-base";
import { transpileComponent } from "@elllphnt/elementa-react-transpiler";
import { moduleRelativePath } from "../../_utils/path.js";
import { GeneratorContext } from "../../context/context.js";
import { generateResource } from "../resource/resource.js";
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
  const transpilerContext = new BuilderComponentTranspilerContext({ url });
  const transpilation = transpileComponent(component, transpilerContext);
  const environment = await transpilerContext.resolveEnvironment();
  const componentCode = transpilation.generate(environment);

  const cssCode = transpilerContext.getStylesheetCode();
  const cssImportPath = moduleRelativePath(
    transpilerContext.modulePath,
    transpilerContext.cssPath
  );
  await context.out.write(transpilerContext.cssPath, cssCode);

  const moduleCode = [
    transpilerContext.importMap.toCode(),
    `import "${cssImportPath}";`,
    `const Component = ${componentCode};`,
    `export default Component;`,
  ].join("\n");

  await context.out.write(transpilerContext.modulePath, moduleCode);

  for (const dep of transpilerContext.dependencies) {
    await generateResource({
      url: dep,
      context,
      generatedResources,
    });
  }
}
