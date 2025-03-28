import { Cache, CachedResource } from "@elllphnt/elll-transpiler";
import nodePath from "path";
import * as yup from "yup";
import { fs } from "../../lib/fs.js";
import { paths } from "../../lib/paths.js";

const cachedResourceSchema = yup.object({
  id: yup.string().required(),
  type: yup.string().required(),
  path: yup.string().required(),
  hash: yup.string().required(),
  files: yup.array().of(yup.string()).optional(),
});

export function createCache({ configPath }: { configPath: string }): Cache {
  const resourceRegistryPath = nodePath.join(
    paths.elll({ configPath }),
    "resources.json",
  );

  let cachedResources: Record<string, CachedResource> = {};
  let resourcesLoaded = false;

  async function loadResources(): Promise<void> {
    const content = await fs.read(resourceRegistryPath);
    const resources = content ? JSON.parse(content) : [];

    cachedResources = {};
    for (const resource of resources) {
      await cachedResourceSchema.validate(resource);
      cachedResources[resource.id] = resource;
    }
    resourcesLoaded = true;
  }
  async function saveResources(): Promise<void> {
    if (!resourcesLoaded) {
      return;
    }

    const content = JSON.stringify(Object.values(cachedResources), null, 2);
    await fs.write(resourceRegistryPath, content);
  }

  async function ensureResourcesLoaded() {
    if (!resourcesLoaded) {
      await loadResources();
    }
  }

  async function saveResource(data: CachedResource): Promise<void> {
    await ensureResourcesLoaded();
    cachedResources[data.id] = data;
    await saveResources();
  }
  async function getResource(id: string): Promise<CachedResource | undefined> {
    await ensureResourcesLoaded();
    return cachedResources[id];
  }
  async function removeResource(id: string): Promise<void> {
    await ensureResourcesLoaded();
    delete cachedResources[id];
    await saveResources();
  }

  return {
    saveResource,
    getResource,
    removeResource,
  };
}
