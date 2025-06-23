import generate from "@babel/generator";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import {
  isFileUrl,
  parseAbsoluteFileUrl,
  toAbsoluteFileUrl,
} from "@elllphnt/elementa-base";
import {
  JsxEmit,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
  transpileModule,
} from "typescript";
import { moduleRelativePath } from "../../_utils/path.js";
import { GeneratorContext } from "../../context/context.js";
import { jsAppPaths } from "../../js_app/paths.js";
import { generateResource } from "../resource/resource.js";

export function transpileTsToJs(content: string): string {
  return transpileModule(content, {
    compilerOptions: {
      target: ScriptTarget.ESNext, // Modern output
      module: ModuleKind.ESNext, // For dynamic import()
      moduleResolution: ModuleResolutionKind.Bundler, // Ensures consistent path resolving
      jsx: JsxEmit.React, // Elll uses React
      isolatedModules: true, // Avoid TypeScript project context
      esModuleInterop: true, // Handles common JS interop gracefully
      allowSyntheticDefaultImports: true, // Important for importing from CDNs
      resolveJsonModule: true, // Just in case JSON imports are used
      noEmitHelpers: true, // Keep it lean
    },
  }).outputText;
}

export async function generateModule({
  url,
  context,
  generatedResources,
}: {
  url: string;
  context: GeneratorContext;
  generatedResources: Set<string>;
}) {
  const content = await context.infra.read(url);
  const dependencies = new Set<string>();

  const { projectId } = parseAbsoluteFileUrl(url);
  const path = jsAppPaths.resource(url);

  function transformImportUrl(importUrl: string): string {
    if (isFileUrl(importUrl)) {
      const modulePath = jsAppPaths.resource(
        toAbsoluteFileUrl({
          projectId,
          url: importUrl,
        })
      );
      return moduleRelativePath(path, modulePath);
    } else {
      // For non-file URLs, we assume they are external and do not need to be processed.
      return importUrl;
    }
  }

  // Parse the JavaScript/TypeScript content with Babel
  const jsContent = transpileTsToJs(content);

  // Parse the transpiled JavaScript again to ensure clean AST
  const ast = parse(jsContent, {
    sourceType: "module",
    plugins: [
      "jsx",
      "decorators-legacy",
      "classProperties",
      "objectRestSpread",
      "dynamicImport",
    ],
  });

  // Transform import/export statements and dynamic imports
  traverse.default(ast, {
    // Handle static import statements: import ... from "..."
    ImportDeclaration(path: any) {
      const source = path.node.source.value;
      const transformedUrl = transformImportUrl(source);
      path.node.source = t.stringLiteral(transformedUrl);
      dependencies.add(source);
    },

    // Handle export statements: export ... from "..."
    ExportNamedDeclaration(path: any) {
      if (path.node.source) {
        const source = path.node.source.value;
        const transformedUrl = transformImportUrl(source);
        path.node.source = t.stringLiteral(transformedUrl);
        dependencies.add(source);
      }
    },

    // Handle export all statements: export * from "..."
    ExportAllDeclaration(path: any) {
      const source = path.node.source.value;
      const transformedUrl = transformImportUrl(source);
      path.node.source = t.stringLiteral(transformedUrl);
      dependencies.add(source);
    },

    // Handle dynamic imports: import("...")
    CallExpression(path: any) {
      if (
        t.isImport(path.node.callee) &&
        path.node.arguments.length === 1 &&
        t.isStringLiteral(path.node.arguments[0])
      ) {
        const source = path.node.arguments[0].value;
        const transformedUrl = transformImportUrl(source);
        path.node.arguments[0] = t.stringLiteral(transformedUrl);
        dependencies.add(source);
      }
    },
  });

  // Generate the transformed code
  const result = generate.default(ast, {
    retainLines: false,
    compact: false,
  });

  const transformedContent = result.code;
  await context.out.write(path, transformedContent);

  for (const dep of dependencies) {
    generateResource({
      url: dep,
      context,
      generatedResources,
    });
  }
}
