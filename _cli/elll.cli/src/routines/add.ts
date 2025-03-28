import chalk from "chalk";
import { getRepository } from "../modules/api/repository.js";
import { createCache } from "../modules/cache/cache.js";
import { loadConfig } from "../modules/config/config.js";
import { syncRepository } from "./sync.js";

export async function resolveRepositorySnapshot({
  reference,
}: {
  reference: string;
}) {
  // References are in the form of `repositoryId:[commitId]`
  let [repositoryId, commitId] = reference.split(":");
  if (!repositoryId) {
    throw new Error(`Invalid reference: ${reference}`);
  }

  // if no commitId is provided fetch the latest commit
  if (!commitId) {
    const repository = await getRepository(repositoryId);
    if (repository.head) {
      commitId = repository.head;
    } else {
      throw new Error(`Failed to resolve the latest commit of ${repositoryId}`);
    }
  }

  return { repositoryId, commitId };
}

export async function add({
  reference,
  configPath,
  force,
}: {
  reference: string;
  configPath: string;
  force?: boolean;
}) {
  console.log(`Adding ${reference}...`);
  const config = await loadConfig(configPath);
  const cache = createCache({ configPath });
  const { repositoryId, commitId } = await resolveRepositorySnapshot({
    reference,
  });

  console.log(`Repository ID: ${chalk.green(repositoryId)}`);
  console.log(`Commit ID: ${chalk.green(commitId)}`);

  return syncRepository({ commitId, config, cache, force });
}
