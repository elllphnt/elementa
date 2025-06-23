import { moduleRelativePath } from "../../_utils/path.js";
import { GeneratorContext } from "../../context/context.js";
import { jsAppPaths } from "../../js_app/paths.js";
import { generateServerEntryScript } from "./server_entry_script.js";

export async function generateServerEntry({
  context,
}: {
  context: GeneratorContext;
}) {
  const serverPath = jsAppPaths.serverEntry;
  const routerPath = jsAppPaths.router;

  await context.out.write(
    serverPath,
    generateServerEntryScript({
      routerPath: moduleRelativePath(serverPath, routerPath),
    })
  );
}
