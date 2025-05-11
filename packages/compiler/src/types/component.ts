import { ComponentData } from "@elllphnt/elll-element";
import { CodeGenerator, CompilerResult } from "./compiler.js";
import { ComponentDependency } from "./dependencies/component.js";
import { Dependency } from "./dependencies/dependency.js";
import { ModuleDependency } from "./dependencies/module.js";
import { StyleDependency } from "./dependencies/style.js";

export type SubComponentData = {
  key: string;
  data: ComponentData;
};

export type ComponentCompilerResult = CompilerResult & {
  dependencies: Dependency[];
  root?: {
    style: {
      generateClassName: CodeGenerator;
      generateStyle: CodeGenerator;
    };
  };
};
export type ComponentCompilerContext = {
  useStyle: (style: ContextualStyleData) => StyleDependency;
  useModule: (
    url: string,
    options?: {
      default?: boolean;
    }
  ) => string;
  useComponent: (url: string) => ComponentDependency;
  useEntity: ({ type, _id }: { _id: string; type: string }) => string;

  getComponentDependencies(): ComponentDependency[];
  getModuleDependencies(): ModuleDependency[];
  getStyleDependencies(): StyleDependency[];
};
