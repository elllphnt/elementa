import nodepath from "path";
import { jsAppPaths } from "tools/generator/js_app/paths.js";
import { writeFile } from "tools/generator/utils/fs.js";
import { moduleRelativePath } from "tools/generator/utils/path.js";
import { generateServerEntryScript } from "./server_entry_script.js";

export async function generateServerEntry({ rootDir }: { rootDir: string }) {
  const serverPath = jsAppPaths.serverEntry;
  const routerPath = jsAppPaths.router;

  const absoluteServerPath = nodepath.join(rootDir, serverPath);
  const absoluteRouterPath = nodepath.join(rootDir, routerPath);

  await writeFile(
    absoluteServerPath,
    generateServerEntryScript({
      routerPath: moduleRelativePath(absoluteServerPath, absoluteRouterPath),
    })
  );
}
