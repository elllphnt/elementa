import { moduleRelativePath } from "../../_utils/path.js";
import type { GeneratorContext } from "../../context/context.js";
import { jsAppPaths } from "../../js_app/paths.js";
import { generateClientEntryScript } from "./client_entry_script.js";

export async function generateClientEntry({
  context,
}: {
  context: GeneratorContext;
}) {
  const clientPath = jsAppPaths.clientEntry;
  const routerPath = jsAppPaths.router;

  await context.out.write(
    clientPath,
    generateClientEntryScript({
      routerPath: moduleRelativePath(clientPath, routerPath),
    })
  );
}
