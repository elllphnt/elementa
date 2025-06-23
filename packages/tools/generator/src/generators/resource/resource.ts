import { GeneratorContext } from "../../context/context.js";
import { generateComponent } from "../component/component.js";
import { generateModule } from "../module/module.js";

export async function generateResource({
  url,
  context,
  generatedResources,
}: {
  url: string;
  context: GeneratorContext;
  generatedResources: Set<string>;
}) {
  if (generatedResources.has(url)) {
    return;
  }

  const file = await context.infra.getFile(url);
  if (!file) {
    throw new Error(`Resource not found: ${url}`);
  }
  if (file.type === "component") {
    return generateComponent({
      url,
      context,
      generatedResources,
    });
  } else if (["loader", "hook", "script", "context"].includes(file.type)) {
    return generateModule({
      url,
      context,
      generatedResources,
    });
  }

  generatedResources.add(url);
}
