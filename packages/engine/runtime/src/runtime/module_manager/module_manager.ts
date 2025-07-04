import type { PackageData } from "@elllphnt/elementa-base";
import { Lifecycle } from "@elllphnt/elementa-kernel";
import type { Infrastructure } from "@elllphnt/elementa-models";
import { moduleLogger } from "../../loggers.js";
import { rewriteImports, transpileTsToJs } from "./_utils.js";
import { Module } from "./module.js";
import type { ModuleHost } from "./module_host/module_host.js";

const CONTENT_LOAD_TIMEOUT = 60000; // 60 seconds

export class ModuleManager extends Lifecycle {
  private infrastructure: Infrastructure;
  private moduleHost: ModuleHost;
  private externals: string[];
  private importMap: Record<string, string>;

  private evaluationCounter = 1;
  private _modules = new Map<string, Module>();

  constructor({
    infrastructure,
    moduleHost: moduleHost,
    externals,
    importMap,
  }: {
    infrastructure: Infrastructure;
    moduleHost: ModuleHost;
    externals: string[];
    importMap?: Record<string, string>;
  }) {
    super();
    this.infrastructure = infrastructure;
    this.moduleHost = moduleHost;
    this.externals = externals;
    this.importMap = importMap || {};
  }

  private addModule(url: string) {
    const module = new Module({
      file: this.infrastructure.file(url),
      evaluate: (url) => this.evaluateModule(url),
    });
    this._modules.set(url, module);
    module.init();
    moduleLogger.info(`addModule ${url}`, {
      url,
      moduleCount: this._modules.size,
    });
    return module;
  }
  module(url: string) {
    let module = this._modules.get(url);
    if (!module) {
      module = this.addModule(url);
    }
    moduleLogger.debug(`module ${url}`, {
      url,
      isNew: !this._modules.has(url),
      moduleCount: this._modules.size,
    });
    return module;
  }

  private async loadModuleToHost(
    url: string,
    packages: PackageData[]
  ): Promise<string[]> {
    try {
      // 1) await for content to be retrieved
      const fileContent = this.module(url).file.content;
      await fileContent.untilRetrieved(CONTENT_LOAD_TIMEOUT);
      const content = fileContent.text || "";
      const project = this.module(url).file.project;

      // 2) Transpile TSX/JSX → ESNext JS
      const jsCode = transpileTsToJs(content);

      // 3) Rewrite imports & collect dependencies
      const transformScipt = (packages: PackageData[]) => {
        return rewriteImports({
          content: jsCode,
          packages,
          externals: this.externals,
          importMap: this.importMap,
          resolveLocalImport: (src) => {
            const absoluteUrl = project.absoluteFileUrl(src);
            if (!absoluteUrl) {
              throw new Error(`Failed to resolve absolute URL for ${src}`);
            }
            const importUrl = this.moduleHost.resolveImportUrl(absoluteUrl);
            dependencies.add(absoluteUrl);
            return importUrl;
          },
        });
      };

      const dependencies = new Set<string>();
      let [transformedScript, missingPackages] = transformScipt(packages);

      // 3.b) if there are missing packages try to install them
      if (missingPackages.length) {
        const newPackages = await project.packageManager.installPackages(
          missingPackages.map((name) => ({ name }))
        );
        [transformedScript, missingPackages] = transformScipt([
          ...packages,
          ...newPackages,
        ]);
        if (missingPackages.length) {
          throw new Error(`Missing packages ${missingPackages.join(", ")}`);
        }
      }

      // 4) Load script to host
      await this.moduleHost.loadScript(url, transformedScript);

      // 5) Load depending modules
      for (const dep of dependencies) {
        if (!this._modules.has(dep)) {
          this.addModule(dep);
          await this.loadModuleToHost(dep, packages);
        }
      }

      // 6) Return array of dependencies
      const result = Array.from(dependencies);
      moduleLogger.info(`loadModuleToHost ${url}`, {
        url,
        packageCount: packages.length,
        dependencyCount: result.length,
        dependencies: result,
        missingPackages:
          missingPackages.length > 0 ? missingPackages : undefined,
      });
      return result;
    } catch (e) {
      moduleLogger.error(`loadModuleToHost ${url}`, { url, error: e });
      console.error("Failed to load file to host", url, e);
      throw e;
    }
  }

  async evaluateModule(
    url: string,
    evaluationNumber = this.evaluationCounter++
  ): Promise<void> {
    const module = this.module(url);
    if (module.evaluationNumber === evaluationNumber) {
      // Already evaluated in this evaluation cycle
      moduleLogger.debug(`evaluateModule ${url} - already evaluated`, {
        url,
        evaluationNumber,
      });
      return;
    }

    try {
      const project = module.file.project;
      const packages = await project.packageManager.getPackages();

      // 1) Load module to host (including dependencies)
      moduleLogger.info(`evaluateModule load ${url}`, {
        url,
        evaluationNumber,
        packages,
        project,
      });
      const dependencies = await this.loadModuleToHost(url, packages);

      // 2) Evaluate the module
      moduleLogger.info(`evaluateModule import ${url}`, {
        url,
        evaluationNumber,
        dependencies,
        packages,
        project,
      });
      const value = await import(
        /* @vite-ignore */ this.moduleHost.resolveImportUrl(url)
      );

      // 3) Update state
      module.setState({
        value,
        evaluationNumber,
        dependencies,
      });

      // 4) Re‐evaluate any modules depending on this one
      const dependentModules: string[] = [];
      for (const mod of this._modules.values()) {
        if (mod.dependencies.includes(url)) {
          dependentModules.push(mod.url);
          await this.evaluateModule(mod.url);
        }
      }

      moduleLogger.info(`evaluateModule ${url}`, {
        url,
        evaluationNumber,
        dependencyCount: dependencies.length,
        dependencies,
        reevaluatedDependents: dependentModules,
      });
    } catch (error) {
      module.setState({
        value: undefined,
        evaluationNumber,
        dependencies: [],
        error: error as Error,
      });
      moduleLogger.error(`evaluateModule ${url}`, {
        url,
        evaluationNumber,
        error,
      });
    }
  }
}
