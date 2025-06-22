import { resolveDefaultExportValueNode } from "../src/parsers/modules/component/utils/export.js";
import { createSingleFileProject } from "../src/parsers/modules/component/utils/source_file.js";

const sourceCode = `
const bc = 90;
const a = function(){
return memo
};
const u = a + bc;
export default u;
`;

const { sourceFile } = createSingleFileProject(sourceCode);
const defaultExport = resolveDefaultExportValueNode(sourceFile);

if (!defaultExport) {
  console.log("No default export value.");
} else {
  console.log(defaultExport.name || "No Name");
  console.log(defaultExport.node.getText());
}

// // 2. Find the default export (e.g. `export default ItemList;`)
// const exportAssignments = sourceFile.getExportAssignments();
// if (exportAssignments.length === 0) {
//   throw new Error("No default export found.");
// }
// const exportAssignment = exportAssignments[0];
// const exportedExpr = exportAssignment.getExpression();
// if (!exportedExpr) {
//   throw new Error("Cannot resolve default export expression.");
// }
// const componentName = exportedExpr.getText().trim();
// if (!componentName) {
//   throw new Error("Default export is not a valid identifier.");
// }

// // 3. Locate the component declaration by name (variable or function)
// const variableDecl = sourceFile
//   .getVariableDeclarations()
//   .find((v) => v.getName() === componentName);
// const functionDecl = sourceFile
//   .getFunctions()
//   .find((f) => f.getName() === componentName);

// if (!variableDecl && !functionDecl) {
//   throw new Error(`Component "${componentName}" not found.`);
// }

// const isVariable = !!variableDecl;
// const componentDecl = (isVariable ? variableDecl! : functionDecl!) as
//   | VariableDeclaration
//   | FunctionDeclaration;

// // 4. Extract the function node (arrow or function declaration)
// let componentFunction: ArrowFunction | FunctionDeclaration;
// if (isVariable) {
//   const init = (componentDecl as VariableDeclaration).getInitializer();
//   if (
//     !init ||
//     !(Node.isArrowFunction(init) || Node.isFunctionExpression(init))
//   ) {
//     throw new Error(
//       `Expected "${componentName}" to be an arrow or function expression.`
//     );
//   }
//   componentFunction = init as ArrowFunction;
// } else {
//   componentFunction = componentDecl as FunctionDeclaration;
// }

// const params = componentFunction.getParameters();
// for (const param of params) {
//   const nameNode = param.getNameNode();
//   if (Node.isObjectBindingPattern(nameNode)) {
//     restructureBindingPattern(nameNode, "props");
//   }
// }

// sourceFile.formatText({
//   indentSize: 2,
//   convertTabsToSpaces: true,
//   newLineCharacter: "\n",
// });
// console.log(sourceFile.getText());
