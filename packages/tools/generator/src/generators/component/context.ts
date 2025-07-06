import {
  isFileUrl,
  parseAbsoluteFileUrl,
  toAbsoluteFileUrl,
} from "@elllphnt/elementa-base";
import type {
  EnvironmentData,
  EnvironmentRoute} from "@elllphnt/elementa-react-transpiler";
import {
  compileStylesheet,
  Environment,
  ImportMap,
  Namespace,
  TranspilerContextImpl,
} from "@elllphnt/elementa-react-transpiler";
import { init } from "@paralleldrive/cuid2";
import { moduleRelativePath } from "../../_utils/path.js";
import { jsAppPaths } from "../../js_app/paths.js";

const genId = init({
  length: 8,
});

export class BuilderComponentTranspilerContext extends TranspilerContextImpl {
  readonly url: string;
  readonly modulePath: string;
  readonly cssPath: string;
  readonly projectId: string;
  readonly namespace = new Namespace();
  readonly importMap = new ImportMap({ namespace: this.namespace });
  readonly dependencies: Set<string> = new Set();

  private _stylesheetTexts: string[] = [];

  constructor({ url }: { url: string }) {
    super();
    this.url = url;
    this.modulePath = jsAppPaths.resource(url);
    this.cssPath = jsAppPaths.style(url);
    const { projectId } = parseAbsoluteFileUrl(url);
    this.projectId = projectId;
  }

  private processImportUrl(url: string): string {
    if (isFileUrl(url)) {
      this.dependencies.add(url);
      const path = jsAppPaths.resource(
        toAbsoluteFileUrl({
          projectId: this.projectId,
          url,
        })
      );
      return moduleRelativePath(this.modulePath, path);
    } else {
      // For non-file URLs, we assume they are external and do not need to be processed.
      return url;
    }
  }

  async resolveEnvironment(): Promise<Environment> {
    const moduleNames: Record<number, string> = {};
    const classNames: Record<number, string> = {};
    const resolvedValues: Record<number, any> = {};
    const routes: Record<number, EnvironmentRoute> = {};

    for (const module of this.modules) {
      const name = this.importMap.import({
        key: module.key,
        url: this.processImportUrl(module.url),
        specifier: module.specifier,
        name: module.name,
      });
      moduleNames[module.key] = name;
    }
    for (const stylesheet of this.stylesheets) {
      const className = `elll-${genId()}`;
      const stylesheetText = compileStylesheet({
        selector: `.${className}`,
        stylesheet: stylesheet.data,
        getModifierDefinition: () => undefined,
      });
      this._stylesheetTexts.push(stylesheetText);
      classNames[stylesheet.key] = className;
    }
    for (const reference of this.references) {
      resolvedValues[reference.key] = null;
    }
    for (const route of this.routes) {
      routes[route.key] = {
        path: "/",
      };
    }

    const data: EnvironmentData = {
      moduleNames,
      classNames,
      resolvedValues,
      routes,
    };

    return new Environment(data);
  }

  getStylesheetCode() {
    return this._stylesheetTexts.join("\n\n");
  }
}
