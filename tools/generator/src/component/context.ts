import {
  Environment,
  EnvironmentData,
  EnvironmentRoute,
  ImportMap,
  Namespace,
  TranspilerContextImpl,
} from "@elllphnt/elementa-react-transpiler";

export class BuilderComponentTranspilerContext extends TranspilerContextImpl {
  readonly namespace = new Namespace();
  readonly importMap = new ImportMap({ namespace: this.namespace });

  async resolveEnvironment(): Promise<Environment> {
    const moduleNames: Record<number, string> = {};
    const classNames: Record<number, string> = {};
    const resolvedValues: Record<number, any> = {};
    const routes: Record<number, EnvironmentRoute> = {};

    for (const module of this.modules) {
      const name = this.importMap.import({
        key: module.key,
        url: module.url,
        specifier: module.specifier,
        name: module.name,
      });
      moduleNames[module.key] = name;
    }
    for (const stylesheet of this.stylesheets) {
      classNames[stylesheet.key] = `elll-${stylesheet.key}`;
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
}
