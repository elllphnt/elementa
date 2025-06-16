import {
  compileToElll,
  createReferenceString,
  replaceReferences,
} from "@elllphnt/elementa-react-parser";
import fs from "fs";
import path, { dirname, join } from "path";

function writeFile(path: string, content: string): void {
  const dir = dirname(path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path, content, "utf-8");
}

export function build({
  source,
  output,
  basePath,
}: {
  source: string;
  output: string;
  basePath: string;
}): any {
  const relativePath = path.relative(basePath, output);
  const content = fs.readFileSync(source, "utf-8");
  const resources = compileToElll({
    tsx: content,
  });
  for (const [name, resource] of Object.entries(resources)) {
    // replace references
    resource.content = replaceReferences(resource.content, (ref) => {
      if (ref.startsWith("!/")) {
        const refPath = ref.slice(2);
        const resource = resources[refPath];
        return createReferenceString(
          "@/" + join(relativePath, refPath + `.${resource.type}`)
        );
      } else {
        return createReferenceString(ref);
      }
    });
    const outputPath = join(output, name + `.${resource.type}`);
    writeFile(outputPath, resource.content);
  }
}
