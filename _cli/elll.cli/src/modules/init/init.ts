import { fs } from "../../lib/fs.js";
import { paths } from "../../lib/paths.js";
import { queryConfigTemplateOptions } from "../config/config.js";
import { generateConfigFile } from "../config/template.js";
import { addGitignoreEntries, formatGitignoreEntry } from "../git/gitignore.js";

export async function initProject({ configPath }: { configPath: string }) {
  console.log("Initializing Elll project...");
  const configOptions = await queryConfigTemplateOptions();
  const configFile = generateConfigFile(configOptions);
  await fs.write(configPath, configFile);

  await addGitignoreEntries({
    path: paths.gitignore({ configPath }),
    comments: ["Elll"],
    entries: [
      formatGitignoreEntry(paths.elll({ configPath }), "directory"),
      formatGitignoreEntry(configOptions.outDir, "directory"),
    ],
  });
  console.log(`Elll project initialized at ${configPath}`);
}
