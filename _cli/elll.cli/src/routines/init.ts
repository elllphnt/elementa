import { fsUtils } from "../lib/fs.js";
import { paths } from "../lib/paths.js";
import { getDefaultConfig, writeConfig } from "../modules/config/config.js";

export async function init({
  root,
  repositoryId,
}: {
  repositoryId: string;
  root: string;
}) {
  const configPath = paths.config({ directory: root });
  if (await fsUtils.exist(configPath)) {
    console.log(`Elll is already initialized in ${root}`);
    process.exit(1);
  }

  const config = await getDefaultConfig({ repositoryId });

  await writeConfig(configPath, config);
  console.log(`Elll is initialized at ${configPath}`);
}
