import { Monaco } from "@monaco-editor/loader";
import { PackageData } from "@repo/elementa-models";
import { Disposable } from "@repo/utils";
import { filter, firstValueFrom, Observable, of, switchMap } from "rxjs";
import {
  getElllWorkspaceElementaProject,
  getElllWorkspaceElementaProject$,
} from "~/src/modules/elementa/project/_lib";
import { IElll } from "~/src/types/elll";
import { keys } from "../keys";

export type TypeDefinition = {
  // Mapping of file path (relative to the root type file's directory) to file content.
  typeDefs: Record<string, string>;
  dependencies: Record<string, string>;
};

// Helper function to resolve and normalize relative paths.
function resolveRelativePath(base: string, relative: string): string {
  const baseParts = base.split("/").filter(Boolean);
  const relativeParts = relative.split("/").filter(Boolean);
  for (const part of relativeParts) {
    if (part === ".") {
      continue;
    } else if (part === "..") {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }
  return baseParts.join("/");
}

// upkg
async function fetchTypeFileFromUpkg({
  pkg,
  version,
  path,
}: {
  pkg: string;
  version?: string;
  path: string;
}): Promise<string> {
  const url = version
    ? `https://unpkg.com/${pkg}@${version}/${path}`
    : `https://unpkg.com/${pkg}/${path}`;
  const res = await fetch(url);
  return await res.text();
}

/**
 * Recursively fetch all .d.ts files starting from the entry file.
 * It scans for both triple‑slash reference directives and relative import/export statements.
 * The `rootDir` parameter represents the directory of the root type file.
 */
async function fetchAllTypeFilesFromUpkg(
  pkg: string,
  version: string,
  entryPath: string,
  visited = new Set<string>(),
  rootDir?: string,
): Promise<Record<string, string>> {
  const files: Record<string, string> = {};

  // Avoid refetching the same file.
  if (visited.has(entryPath)) {
    return files;
  }
  visited.add(entryPath);

  try {
    const content = await fetchTypeFileFromUpkg({
      pkg,
      version,
      path: entryPath,
    });

    // On the very first call, determine the rootDir from the entryPath.
    if (!rootDir) {
      const lastSlash = entryPath.lastIndexOf("/");
      rootDir = lastSlash !== -1 ? entryPath.substring(0, lastSlash + 1) : "";
    }

    // Compute the key relative to the rootDir.
    const relativeKey = entryPath.startsWith(rootDir)
      ? entryPath.slice(rootDir.length)
      : entryPath;
    files[relativeKey] = content;

    // Regex for triple‑slash references: /// <reference path="..."/>
    const tripleSlashRegex =
      /\/\/\/\s*<reference\s+path=["']([^"']+)["']\s*\/>/g;
    let match: RegExpExecArray | null;
    while ((match = tripleSlashRegex.exec(content)) !== null) {
      const refPath = match[1];
      const basePath = entryPath.substring(0, entryPath.lastIndexOf("/") + 1);
      const resolvedPath = resolveRelativePath(basePath, refPath);
      const childFiles = await fetchAllTypeFilesFromUpkg(
        pkg,
        version,
        resolvedPath,
        visited,
        rootDir,
      );
      Object.assign(files, childFiles);
    }

    // Regex for relative import/export references:
    // Matches statements like: import ... from "./module" or export ... from "../module.js"
    const importExportRegex =
      /\b(?:import|export)\s+.*?\s+from\s+["']([^"']+)["']/g;
    while ((match = importExportRegex.exec(content)) !== null) {
      const refPath = match[1];
      // Only process relative paths.
      if (refPath.startsWith(".") || refPath.startsWith("/")) {
        const basePath = entryPath.substring(0, entryPath.lastIndexOf("/") + 1);
        let resolvedPath = resolveRelativePath(basePath, refPath);

        // If the reference ends with .js, try to load the corresponding .d.ts file.
        if (resolvedPath.endsWith(".js")) {
          resolvedPath = resolvedPath.replace(/\.js$/, ".d.ts");
        } else if (
          !/\.[tj]s$/.test(resolvedPath) &&
          !resolvedPath.endsWith(".d.ts")
        ) {
          // If no extension is provided, assume .d.ts.
          resolvedPath = resolvedPath + ".d.ts";
        }

        const childFiles = await fetchAllTypeFilesFromUpkg(
          pkg,
          version,
          resolvedPath,
          visited,
          rootDir,
        );
        Object.assign(files, childFiles);
      }
    }
  } catch (e) {
    console.error(`Failed to fetch ${entryPath} for ${pkg}@${version}:`, e);
  }

  return files;
}

async function fetchTypeDefinitionFromUpkg(
  pkg: string,
  version?: string,
): Promise<TypeDefinition | undefined> {
  try {
    // Fetch the package.json.
    const packageJsonText = await fetchTypeFileFromUpkg({
      pkg,
      version,
      path: "package.json",
    });
    const packageJson = (() => {
      try {
        return JSON.parse(packageJsonText);
      } catch {
        console.error(
          `Failed to parse package.json for ${pkg}@${version}`,
          packageJsonText,
        );
        return {};
      }
    })();
    const pkgVersion = version ?? packageJson.version;
    const typePath = packageJson.types ?? packageJson.typings;

    // If there is no typePath and the package isn’t a @types package, try DefinitelyTyped.
    if (!typePath) {
      if (!pkg.startsWith("@types/")) {
        return fetchTypeDefinitionFromUpkg(`@types/${pkg}`);
      }
      return;
    }

    // Fetch all type files starting from the main type definition.
    const typeDefs = await fetchAllTypeFilesFromUpkg(pkg, pkgVersion, typePath);

    // Fetch dependencies and their types.
    const { dependencies, peerDependencies } = packageJson;
    const allDeps = { ...dependencies, ...peerDependencies } as Record<
      string,
      string
    >;

    return {
      typeDefs,
      dependencies: allDeps,
    };
  } catch (e) {
    console.error(`Failed to fetch types for ${pkg}@${version}:`, e);
  }
}

// local storage
function getTypeDefinitionFromLocalStorage(pkg: string, version: string) {
  const def = localStorage.getItem(`type-definition-${pkg}-${version}`);
  if (!def) return;
  return JSON.parse(def) as TypeDefinition;
}
function setTypeDefinitionToLocalStorage(
  pkg: string,
  version: string,
  definition: TypeDefinition,
) {
  localStorage.setItem(
    `type-definition-${pkg}-${version}`,
    JSON.stringify(definition),
  );
}

// get type definition
function getTypeDefinition(pkg: string, version: string) {
  const existing = getTypeDefinitionFromLocalStorage(pkg, version);
  if (existing && "typeDefs" in existing) {
    return Promise.resolve(existing);
  } else {
    return fetchTypeDefinitionFromUpkg(pkg, version).then((definition) => {
      if (!definition) return;
      setTypeDefinitionToLocalStorage(pkg, version, definition);
      return definition;
    });
  }
}

export class TSVirtualFileSystem extends Disposable {
  static key = "ts-virtual-file-system";
  static modulePath = (id: string) => `/modules/${id}.tsx`;
  static moduleId = (path: string) =>
    path.replace(/^\/modules\//, "").replace(/\.tsx$/, "");
  static isModulePath = (path: string) =>
    path.startsWith("/modules/") && path.endsWith(".tsx");

  readonly elll: IElll;

  get project() {
    return getElllWorkspaceElementaProject(this.elll);
  }
  get project$() {
    return getElllWorkspaceElementaProject$(this.elll);
  }
  get monaco() {
    return this.elll.config(keys.configs.editors.monaco.instance) as
      | Monaco
      | undefined;
  }
  get monaco$() {
    return this.elll.config$(
      keys.configs.editors.monaco.instance,
    ) as Observable<Monaco | undefined>;
  }

  installedPackages: Record<string, PackageData> = {};
  installQueue: PackageData[] = [];
  installing = false;

  get packages() {
    return this.project?.packageManager.packages ?? [];
  }
  get packages$() {
    return this.project$.pipe(
      switchMap((project) => project?.packageManager.packages$ ?? of([])),
    );
  }

  constructor({ elll }: { elll: IElll }) {
    super();
    this.elll = elll;
  }

  getMonaco() {
    return firstValueFrom(this.monaco$.pipe(filter(Boolean)));
  }

  watchPackages() {
    // sync packages
    const packagesSubscription = this.packages$.subscribe((packages) => {
      const toRemove = { ...this.installedPackages };
      for (const pkg of packages) {
        if (!toRemove[pkg.name]) {
          this._pushInstallQueue(pkg);
        }
        delete toRemove[pkg.name];
      }

      for (const pkg of Object.values(toRemove)) {
        this.uninstallPackage(pkg);
      }
    });

    this.addDisposer(() => {
      packagesSubscription.unsubscribe();
    });
  }

  private async _runInstall() {
    if (this.installing) return;
    this.installing = true;

    try {
      console.log("TVFS Running install queue", [...this.installQueue]);
      while (this.installQueue.length > 0) {
        const pkg = this.installQueue.shift();
        if (!pkg) continue;

        switch (pkg.registry) {
          case "npm":
            await this.installNpmPackage(pkg);
            break;
          default:
            console.error(`Unknown registry: ${pkg.registry}`);
            break;
        }
      }
    } catch (e) {
      console.error("TVFS Failed to install package", e);
    }

    this.installing = false;
  }
  private _pushInstallQueue(pkg: PackageData) {
    this.installQueue = [
      ...this.installQueue.filter((p) => p.name !== pkg.name),
      pkg,
    ];

    this._runInstall();
  }
  private _pushInstalledPackage(pkg: PackageData) {
    const newPackages = { ...this.installedPackages };
    newPackages[pkg.name] = pkg;
    this.installedPackages = newPackages;
  }
  private _removeInstalledPackage(pkg: PackageData) {
    const newPackages = { ...this.installedPackages };
    delete newPackages[pkg.name];
    this.installedPackages = newPackages;
  }

  async installNpmPackage(pkg: PackageData) {
    console.log(`Installing ${pkg.name}@${pkg.version}`);
    const definition = await getTypeDefinition(pkg.name, pkg.version);
    if (!definition) return;

    const monaco = await this.getMonaco();

    // For each file in the package's type definitions, add it as an extra lib.
    for (const [relativePath, content] of Object.entries(definition.typeDefs)) {
      // Construct a file URI that mimics the package's structure.
      const fileUri = `file:///node_modules/${pkg.name}/${relativePath}`;
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        content,
        fileUri,
      );
      console.log(`Added ${fileUri}`);
    }

    // Install dependencies recursively
    for (const [depName, depVersion] of Object.entries(
      definition.dependencies,
    )) {
      // Skip if the package is already installed
      if (this.installedPackages[depName]) continue;

      try {
        await this.installNpmPackage({
          name: depName,
          version: depVersion,
          registry: "npm",
        });
      } catch (e) {
        console.error(`Failed to install ${depName}@${depVersion}:`, e);
      }
    }

    this._pushInstalledPackage(pkg);
  }
  uninstallPackage(pkg: PackageData) {
    switch (pkg.registry) {
      case "npm":
        this.uninstallNpmPackage(pkg);
        break;
      default:
        console.error(`Unknown registry: ${pkg.registry}`);
        break;
    }
  }
  uninstallNpmPackage(pkg: PackageData) {
    const monaco = this.monaco;
    if (!monaco) return;

    this._removeInstalledPackage(pkg);
    this.elll.shell.toast({
      message: `Uninstalled ${pkg.name}@${pkg.version}`,
    });
  }

  async init() {
    this._pushInstallQueue({
      name: "react",
      version: "18.3.1",
      registry: "npm",
    });
    this.watchPackages();
  }
}
