import type { SourceFile } from "ts-morph";
import { Node, Project } from "ts-morph";
import { resolveDefaultExportValueNode } from "~/libs/ts/export.js";

/**
 * Creates a TypeScript project with standard compiler options for testing
 */
export function createTestProject(): Project {
  return new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: 99, // ESNext
      module: 99, // ESNext
      jsx: 2, // React JSX
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
    },
  });
}

/**
 * Extracts the default export component function from a source file
 */
export function getComponentFromSourceFile(sourceFile: SourceFile) {
  const defaultExportNode = resolveDefaultExportValueNode(sourceFile);
  if (!defaultExportNode) {
    throw new Error("No default export found in the source file");
  }
  const node = defaultExportNode.node;
  if (
    Node.isFunctionDeclaration(node) ||
    Node.isFunctionExpression(node) ||
    Node.isArrowFunction(node)
  ) {
    return node;
  } else {
    throw new Error(
      "Default export is not a function declaration, expression, or arrow function",
    );
  }
}
