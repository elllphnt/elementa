import { Diagnostic } from "@codemirror/lint";
import { Disposable, combineLatestOrEmpty } from "@repo/utils";
import lzstring from "lz-string";
import { BehaviorSubject, Subscription, map, of, switchMap } from "rxjs";
import { CompilerOptions, JsxEmit } from "typescript";
import { Elll } from "../../elll/elll";
import { PackageData } from "../project/packages/package_manager";
import {
  VirtualTypeScriptEnvironment,
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment,
} from "./vfs";

export type TypeDefinition = {
  typeDef: string;
  dependencies: Record<string, string>;
};

// upkg
async function fetchTypeFileFromUpkg({
  pkg,
  version,
  path,
}: {
  pkg: string;
  version?: string;
  path: string;
}) {
  let url = version
    ? `https://unpkg.com/${pkg}@${version}/${path}`
    : `https://unpkg.com/${pkg}/${path}`;
  const res = await fetch(url);
  return await res.text();
}
async function fetchTypeDefinitionFromUpkg(
  pkg: string,
  version?: string,
): Promise<TypeDefinition | undefined> {
  try {
    // Fetch the package.json
    const packageJson = await fetchTypeFileFromUpkg({
      pkg,
      version,
      path: "package.json",
    }).then((json) => {
      try {
        return JSON.parse(json);
      } catch {
        console.error(
          `Failed to parse package.json for ${pkg}@${version}`,
          json,
        );
        return {};
      }
    });
    const pkgVersion = version ?? packageJson.version;
    const typePath = packageJson.types ?? packageJson.typings;

    let typeDef: string | undefined;

    // Fetch the main package type definition if available
    if (typePath) {
      typeDef = await fetchTypeFileFromUpkg({
        pkg,
        version: pkgVersion,
        path: typePath,
      });
    } else if (!pkg.startsWith("@types/")) {
      // Try fetching from DefinitelyTyped if not a scoped package
      return fetchTypeDefinitionFromUpkg(`@types/${pkg}`);
    }

    if (!typeDef) return;

    // Fetch dependencies and their types
    const { dependencies, peerDependencies } = packageJson;
    const allDeps = { ...dependencies, ...peerDependencies } as Record<
      string,
      string
    >;

    return {
      typeDef,
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
  return (
    getTypeDefinitionFromLocalStorage(pkg, version) ??
    fetchTypeDefinitionFromUpkg(pkg, version).then((definition) => {
      if (!definition) return;
      setTypeDefinitionToLocalStorage(pkg, version, definition);
      return definition;
    })
  );
}

export class TSVirtualFileSystem extends Disposable {
  static key = "ts-virtual-file-system";
  static modulePath = (id: string) => `/modules/${id}.tsx`;
  static moduleId = (path: string) =>
    path.replace(/^\/modules\//, "").replace(/\.tsx$/, "");
  static isModulePath = (path: string) =>
    path.startsWith("/modules/") && path.endsWith(".tsx");

  readonly elll: Elll;

  private _environment$ = new BehaviorSubject<
    VirtualTypeScriptEnvironment | undefined
  >(undefined);

  private _fileSubscriptions = new Map<string, Subscription>();
  installedPackages: Record<string, PackageData> = {};
  installQueue: PackageData[] = [];
  installing = false;

  get environment() {
    return this._environment$.value;
  }
  get environment$() {
    return this._environment$.asObservable();
  }

  get scriptsDirectory() {
    return this.elll.workspace?.fileAtPath("scripts", {
      autoFetch: true,
      create: {
        type: "directory",
      },
    }).data;
  }
  get scriptsDirectory$() {
    return this.elll.workspace$.pipe(
      switchMap(
        (workspace) =>
          workspace?.fileAtPath("scripts", {
            autoFetch: true,
            create: {
              type: "directory",
            },
          })?.data$ ?? of(undefined),
      ),
    );
  }

  allScriptFilesQuery(workspaceId: string) {
    return this.elll.backend.workspaceFileStore.query({
      key: `workspace-all-typescript-files-${workspaceId}`,
      resolve$: (files$) => {
        return files$.pipe(
          map((files) => files.filter((f) => f.type?.endsWith("+typescript"))),
        );
      },
      resolve: (files) => {
        return files.filter((f) => f.type?.endsWith("+typescript"));
      },
      fetch: async () => {
        await this.elll.backend.repositoryService.fetchWorkspaceFiles({
          workspaceId,
          path: "scripts",
        });
      },
    });
  }

  get allScriptFiles() {
    const workspaceId = this.elll.workspace?.id;
    if (!workspaceId) return [];
    return this.allScriptFilesQuery(workspaceId).data;
  }
  get allScriptFiles$() {
    return this.elll.workspace$.pipe(
      switchMap((workspace) => {
        if (!workspace) return of([]);
        return this.allScriptFilesQuery(workspace.id).data$;
      }),
    );
  }

  get packages() {
    return this.elll.project.packageManager.packages;
  }
  get packages$() {
    return this.elll.project.packageManager.packages$;
  }

  constructor({ elll }: { elll: Elll }) {
    super();
    this.elll = elll;

    const filesSubscription = this.allScriptFiles$.subscribe((files) => {
      const toRemove = new Set(this._fileSubscriptions.keys());
      for (const file of files) {
        if (!this._fileSubscriptions.has(file.fid)) {
          if (!file.contentLoaded) {
            file.fetchContent();
          }

          this._fileSubscriptions.set(
            file.fid,
            combineLatestOrEmpty([
              file.textContent$,
              this.environment$,
            ]).subscribe(([textContent, env]) => {
              const path = TSVirtualFileSystem.modulePath(file.fid);
              if (!env) return;
              if (env.getSourceFile(path)) {
                env.updateFile(path, textContent ?? "");
              } else {
                env.createFile(path, textContent ?? "");
              }
            }),
          );
        }

        toRemove.delete(file.fid);
      }

      for (const id of toRemove) {
        this._fileSubscriptions.get(id)?.unsubscribe();
        this._fileSubscriptions.delete(id);
      }
    });

    this.addDisposer(() => {
      filesSubscription.unsubscribe();
      for (const sub of this._fileSubscriptions.values()) {
        sub.unsubscribe();
      }
    });
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
    const env = this.environment;
    if (!env) return;

    const definition = await getTypeDefinition(pkg.name, pkg.version);
    if (!definition) return;

    env.sys.writeFile(
      `/node_modules/${pkg.name}/index.d.ts`,
      definition.typeDef,
    );

    // Install dependencies
    for (const dep of Object.entries(definition.dependencies)) {
      const packageName = dep[0];
      const packageVersion = dep[1];
      const fileName = `/node_modules/${packageName}/index.d.ts`;
      // check if the package is already installed
      if (env.sys.fileExists?.(fileName)) continue;

      try {
        await this.installNpmPackage({
          name: packageName,
          version: packageVersion,
          registry: "npm",
        });
      } catch (e) {
        console.error(`Failed to install ${packageName}@${packageVersion}:`, e);
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
    const env = this.environment;
    if (!env) return;

    env.sys.deleteFile?.(`/node_modules/${pkg.name}/index.d.ts`);

    this._removeInstalledPackage(pkg);
    this.elll.shell.toast({
      message: `Uninstalled ${pkg.name}@${pkg.version}`,
    });
  }

  async init() {
    const ts = await import("typescript");
    const compilerOptions: CompilerOptions = {
      target: ts.ScriptTarget.ESNext,
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      esModuleInterop: true,
      isolatedModules: true,
      paths: {
        "fid:*": ["/modules/*"],
      },
      jsx: JsxEmit.React,
    };
    const fsMap = await createDefaultMapFromCDN(
      compilerOptions,
      ts.version,
      true,
      ts,
      lzstring,
    );

    const system = createSystem(fsMap);
    const env = createVirtualTypeScriptEnvironment(
      system,
      [],
      ts,
      compilerOptions,
    );

    this._environment$.next(env);

    this._pushInstallQueue({
      name: "react",
      version: "18.3.1",
      registry: "npm",
    });
    this._pushInstallQueue({
      name: "@react-spring/web",
      version: "9.7.3",
      registry: "npm",
    });
    this.watchPackages();
  }

  getFileName(id: string) {
    return TSVirtualFileSystem.modulePath(id);
  }
  getFileUrl(filename: string) {
    if (!TSVirtualFileSystem.isModulePath(filename)) {
      return;
    }

    const id = TSVirtualFileSystem.moduleId(filename);
    return "fid:" + id;
  }

  getDiagnostics(id: string): Diagnostic[] {
    const env = this.environment;
    const path = TSVirtualFileSystem.modulePath(id);

    if (!env || !env.getSourceFile(path)) return [];

    let diagnostics: Diagnostic[] = [];

    for (const diagnostic of env.languageService.getSemanticDiagnostics(path)) {
      let from: number;
      let to: number;

      if (diagnostic.start === undefined || diagnostic.length === undefined) {
        from = 0;
        to = 0;
      } else {
        from = diagnostic.start;
        to = diagnostic.start + diagnostic.length;
      }

      diagnostics.push({
        from,
        to,
        severity: "error",
        message: diagnostic.messageText.toString(),
      });
    }

    for (const diagnostic of env.languageService.getSyntacticDiagnostics(
      path,
    )) {
      diagnostics.push({
        from: diagnostic.start,
        to: diagnostic.start + diagnostic.length,
        severity: "error",
        message: diagnostic.messageText.toString(),
      });
    }

    for (const diagnostic of env.languageService.getSuggestionDiagnostics(
      path,
    )) {
      diagnostics.push({
        from: diagnostic.start,
        to: diagnostic.start + diagnostic.length,
        severity: "info",
        message: diagnostic.messageText.toString(),
      });
    }

    return diagnostics;
  }
  getDefinition(id: string, position: number) {
    const env = this.environment;
    const path = TSVirtualFileSystem.modulePath(id);

    if (!env || !env.getSourceFile(path)) return [];
  }
}
