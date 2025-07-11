import ts from "typescript";

// Simulated source files
const files: Record<string, string> = {
  "test.d.ts": `
    type Test = {
      name: string;
      age: number;
    };
    type DF = {
      name: string;
      age: number;
    };
  `,
  "test-2.d.ts": `
    type Test = {
      age: number;
    };
    type DF = {
      name: string;
      age: number;
    };
  `,
  "user.ts": `
    export type User = {
      name: string;
      age: number;
    };

    export type Admin = User & {
      role: string;
    };
  `,
  "main.ts": `
    import { User, Admin as DF } from "./user";
    const u: User = { name: "Alice", age: 30 };
    const a: DF = { name: "Bob", age: 40, role: "manager" };
    const a: Test = { name: "Bob", age: 40, role: "manager" };
  `,
};

// Create an in-memory CompilerHost
const host = ts.createCompilerHost({}, true);
host.getSourceFile = (fileName, languageVersion) => {
  const content = files[fileName];
  if (content == null) return undefined;
  return ts.createSourceFile(fileName, content, languageVersion);
};

host.readFile = (fileName) => files[fileName];
host.fileExists = (fileName) => files.hasOwnProperty(fileName);
host.writeFile = () => {};

const program = ts.createProgram({
  rootNames: Object.keys(files),
  options: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
  host,
});

const checker = program.getTypeChecker();
const source = program.getSourceFile("main.ts");

if (!source) throw new Error("main.ts not found");

// Traverse the AST of main.ts
ts.forEachChild(source, (node) => {
  if (ts.isVariableStatement(node)) {
    const decl = node.declarationList.declarations[0];

    if (
      ts.isIdentifier(decl.name) &&
      decl.type &&
      ts.isTypeReferenceNode(decl.type)
    ) {
      const typeRef = decl.type;
      const symbol = checker.getSymbolAtLocation(typeRef.typeName);

      if (!symbol) {
        console.warn(`No symbol found for type reference`);
        return;
      }

      console.log(`Symbol: ${symbol.getName()}`);
      const decls = symbol.getDeclarations() ?? [];
      for (const d of decls) {
        console.log(`  - Kind: ${ts.SyntaxKind[d.kind]}`);
        console.log(`  - From: ${d.getSourceFile().fileName}`);
        console.log(`  - Code: ${d.getText().trim().slice(0, 60)}...`);
      }
    }
  }
});
