import { ComponentCompilerContext } from "../types/component.js";
import { ComponentDependency } from "../types/dependencies/component.js";
import { ModuleDependency } from "../types/dependencies/module.js";
import { StyleDependency } from "../types/dependencies/style.js";

export function createComponentCompilerContext(): ComponentCompilerContext {
  const styleDependencies: StyleDependency[] = [];
  const moduleDependencies: ModuleDependency[] = [];
  const componentDependencies: ComponentDependency[] = [];

  return {
    useComponent() {},
    useModule() {},
    useStyle() {},

    getComponentDependencies() {
      return componentDependencies;
    },
    getModuleDependencies() {
      return moduleDependencies;
    },
    getStyleDependencies() {
      return styleDependencies;
    },
  };
}
