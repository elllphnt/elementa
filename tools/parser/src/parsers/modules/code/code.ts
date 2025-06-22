import {
  ArrowFunction,
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
  Node,
  SyntaxKind,
} from "ts-morph";
import { ParsedCodeModule } from "../../../module/code_module.js";
import { extractImport } from "../_shared/_.js";
import {
  findNearestIdentifierDeclaration,
  isIdentifierReference,
} from "../component/_.js";
import {
  resolveDefaultExportValueNode,
  resolveRootValueNodes,
} from "../component/utils/export.js";
import { isInNode } from "../component/utils/navigation.js";
import { createSingleFileProject } from "../component/utils/source_file.js";

export function isComponentName(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

export type ComponentNode =
  | FunctionDeclaration
  | ArrowFunction
  | FunctionExpression
  | CallExpression;
export function isComponentNode(node: Node): node is ComponentNode {
  if (
    Node.isFunctionDeclaration(node) ||
    Node.isArrowFunction(node) ||
    Node.isFunctionExpression(node)
  ) {
    return true;
  } else if (Node.isCallExpression(node)) {
    const callee = node.getFirstChild();
    const expression = node.getExpression();
    let calleeName: string | undefined;
    if (Node.isIdentifier(callee)) {
      calleeName = callee.getText();
    } else if (Node.isPropertyAccessExpression(callee)) {
      calleeName = callee.getName();
    }
    return (
      (calleeName === "memo" || calleeName === "forwardRef") &&
      isComponentNode(expression)
    );
  }
  return false;
}
export function isHookName(name: string): boolean {
  return /^use[A-Z]/.test(name);
}
export function isContextName(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*Context$/.test(name);
}
export function isContextContent(content: string): boolean {
  return content.includes("createContext");
}

export function parseCodeModule({ sourceCode }: { sourceCode: string }) {
  const { sourceFile } = createSingleFileProject(sourceCode, {
    name: "module.tsx",
  });
  const valueNodes = resolveRootValueNodes(sourceFile);
  const defaultExportNode = resolveDefaultExportValueNode(sourceFile);

  const module: ParsedCodeModule = {
    imports: {},
    types: {},
    resources: {},
    utils: {},
    main: defaultExportNode?.name,
  };

  const statements = sourceFile.getStatements();
  for (const statement of statements) {
    if (Node.isImportDeclaration(statement)) {
      extractImport(statement, module);
    } else if (
      Node.isTypeAliasDeclaration(statement) ||
      Node.isInterfaceDeclaration(statement) ||
      Node.isEnumDeclaration(statement)
    ) {
      const name = statement.getName();
      const source = statement.getText();
      module.types[name] = source;
    }
  }

  const utilsStatements: string[] = [];
  const utilsExports: string[] = [];
  const utilsDependencies: string[] = [];

  for (const { node, name } of valueNodes) {
    if (!name) continue;

    const { content, dependencies } = extractContent({ name, node });
    if (isHookName(name)) {
      module.resources[name] = {
        type: "hook",
        content: exportContent(name, content, true),
        dependencies,
      };
      continue;
    } else if (isContextName(name) && isContextContent(content)) {
      module.resources[name] = {
        type: "context",
        content: exportContent(name, content, true),
        dependencies,
      };
      continue;
    } else if (isComponentName(name) && isComponentNode(node)) {
      module.resources[name] = {
        type: "component",
        content: exportContent(name, content, true),
        dependencies,
      };
      continue;
    } else {
      utilsStatements.push(exportContent(name, content));
      utilsExports.push(name);
      utilsDependencies.push(...dependencies);
    }
  }

  module.resources["utils"] = {
    type: "module",
    content: utilsStatements.join("\n"),
    dependencies: Array.from(new Set(utilsDependencies)),
  };
  module.utils = Object.fromEntries(
    utilsExports.map((name) => [name, `utils`])
  );

  return module;
}

export function extractContent({ name, node }: { name: string; node: Node }) {
  const dependencies = new Set(
    node
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .filter((identifier) => {
        if (!isIdentifierReference(identifier)) return false;
        const nearestDeclaration = findNearestIdentifierDeclaration(identifier);
        return nearestDeclaration && !isInNode(nearestDeclaration, node);
      })
      .map((identifier) => identifier.getText())
  );

  const content = Node.isExpression(node)
    ? `const ${name} = ${node.getText()}`
    : cleanContent(node.getText());

  return {
    content,
    dependencies: Array.from(dependencies),
  };
}

export function cleanContent(content: string) {
  return content
    .replace(/\bexport\s+default\s+/, "") // handles: export default function...
    .replace(/\bexport\s+/, "") // handles: export function...
    .replace(/\bdefault\s+/, ""); // just in case it's standalone
}

export function exportContent(
  name: string,
  content: string,
  asDefault?: boolean
): string {
  const isVariableStatement =
    content.startsWith("const ") ||
    content.startsWith("let ") ||
    content.startsWith("var ");
  if (asDefault) {
    if (isVariableStatement) {
      return [content, `export default ${name};`].join("\n");
    } else {
      return `export default ${content}`;
    }
  } else {
    return `export ${content}`;
  }
}
