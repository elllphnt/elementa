import { transform } from "@babel/standalone";
import { PackageData } from "@elllphnt/elementa-base";
import {
  JsxEmit,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
  transpileModule,
} from "typescript";

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

function isLocalImport(source: string): boolean {
  return source.startsWith("file:");
}
function isExternalImport(source: string, external: string[]): boolean {
  return external.some((m) => source === m || source.startsWith(m + "/"));
}
/** Returns the package name and the import path */
function parsePackageImport(source: string): [string, string] {
  if (source.startsWith("@")) {
    const [scope, ...rest] = source.split("/");
    return [scope + "/" + rest[0], rest.slice(1).join("/")];
  } else {
    const [name, ...rest] = source.split("/");
    return [name, rest.join("/")];
  }
}
function esmShModuleUrl(
  pkg: string,
  version: string,
  path: string,
  externals: string[]
): string {
  return `https://esm.sh/${pkg}@${version}${
    path ? "/" + path : ""
  }?external=${externals.join(",")}`;
}

export function rewriteImports({
  content,
  packages,
  externals,
  importMap,
  resolveLocalImport,
}: {
  content: string;
  packages: PackageData[];
  externals: string[];
  importMap: Record<string, string>;
  resolveLocalImport: (url: string) => string;
}): [string, string[]] {
  const packageMap = packages.reduce((map, p) => {
    map[p.name] = p;
    return map;
  }, {} as Record<string, PackageData>);
  const missingPackages = new Set<string>();

  const result = transform(content, {
    plugins: [
      {
        visitor: {
          ImportDeclaration(path) {
            const source = path.node.source.value as string;

            // 1. Direct import map match
            if (source in importMap) {
              path.node.source.value = importMap[source];
              return;
            }

            // 2. Local import
            if (isLocalImport(source)) {
              path.node.source.value = resolveLocalImport(source);
              return;
            }

            // 3. External import (skip)
            if (isExternalImport(source, externals)) return;

            // 4. Try resolving package
            const [pkg, srcPath] = parsePackageImport(source);
            const version = packageMap[pkg]?.version;
            if (version) {
              path.node.source.value = esmShModuleUrl(
                pkg,
                version,
                srcPath,
                externals
              );
            } else {
              missingPackages.add(pkg);
            }
          },
        },
      },
    ],
  });

  if (!result.code) throw new Error("Failed to rewrite imports");

  return [result.code, Array.from(missingPackages)];
}
