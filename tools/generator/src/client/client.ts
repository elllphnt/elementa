import nodepath from "path";
import { jsAppPaths } from "../../js_app/paths.js";
import { writeFile } from "../../utils/fs.js";
import { moduleRelativePath } from "../../utils/path.js";
import { generateClientEntryScript } from "./client_entry_script.js";

export async function generateClientEntry({ rootDir }: { rootDir: string }) {
  const clientPath = jsAppPaths.clientEntry;
  const routerPath = jsAppPaths.router;

  const absoluteClientPath = nodepath.join(rootDir, clientPath);
  const absoluteRouterPath = nodepath.join(rootDir, routerPath);

  await writeFile(
    absoluteClientPath,
    generateClientEntryScript({
      routerPath: moduleRelativePath(absoluteClientPath, absoluteRouterPath),
    })
  );
}
