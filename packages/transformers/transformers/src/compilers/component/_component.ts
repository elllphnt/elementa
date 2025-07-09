import type { ComponentData } from "@elllphnt/elementa-base";
import * as ts from "typescript";
import { compileElement } from "./elements/element.js";
import { compileFragment } from "./fragment_new.js";
import { compileState } from "./states/state_new.js";

export function createComponentFunction(
  data: ComponentData
): ts.FunctionDeclaration {
  const componentName = data.name || "Component";

  // Create props parameter type
  const propsType = createPropsType(data);

  // Create parameter: (props: PropsType)
  const propsParameter = ts.factory.createParameterDeclaration(
    undefined,
    undefined,
    ts.factory.createIdentifier("props"),
    undefined,
    propsType,
    undefined
  );

  // Create function body
  const functionBody = createFunctionBody(data);

  // Create the function declaration
  return ts.factory.createFunctionDeclaration(
    [
      ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
      ts.factory.createModifier(ts.SyntaxKind.DefaultKeyword),
    ],
    undefined,
    ts.factory.createIdentifier(componentName),
    undefined,
    [propsParameter],
    ts.factory.createTypeReferenceNode("JSX.Element"),
    functionBody
  );
}

function createPropsType(data: ComponentData): ts.TypeNode {
  const properties: ts.TypeElement[] = [];

  // Add __fills property for fragment fills
  properties.push(
    ts.factory.createPropertySignature(
      undefined,
      ts.factory.createIdentifier("__fills"),
      ts.factory.createToken(ts.SyntaxKind.QuestionToken),
      ts.factory.createTypeReferenceNode("Record", [
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      ])
    )
  );

  // Add component props
  if (data.props) {
    for (const prop of data.props) {
      const propType = mapDataInputToTSType(prop);
      properties.push(
        ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier(prop.name || "prop"),
          prop.required
            ? undefined
            : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          propType
        )
      );
    }
  }

  return ts.factory.createTypeLiteralNode(properties);
}

function mapDataInputToTSType(input: any): ts.TypeNode {
  // Map data input types to TypeScript types based on tsType or fallback
  if (input.tsType) {
    switch (input.tsType) {
      case "string":
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
      case "number":
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
      case "boolean":
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
      default:
        return ts.factory.createTypeReferenceNode(input.tsType);
    }
  }
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
}

function createFunctionBody(data: ComponentData): ts.Block {
  const statements: ts.Statement[] = [];

  // Create fills constant: const fills = props.__fills || {};
  statements.push(
    ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier("fills"),
            undefined,
            undefined,
            ts.factory.createBinaryExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("props"),
                ts.factory.createIdentifier("__fills")
              ),
              ts.factory.createToken(ts.SyntaxKind.BarBarToken),
              ts.factory.createObjectLiteralExpression()
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    )
  );

  // Create fragments object if fragments exist
  if (data.fragments && data.fragments.length > 0) {
    const fragmentProperties = data.fragments.map((fragment) =>
      ts.factory.createPropertyAssignment(
        ts.factory.createStringLiteral(fragment.id || "fragment"),
        compileFragment(fragment)
      )
    );

    statements.push(
      ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
          [
            ts.factory.createVariableDeclaration(
              ts.factory.createIdentifier("fragments"),
              undefined,
              undefined,
              ts.factory.createObjectLiteralExpression(fragmentProperties, true)
            ),
          ],
          ts.NodeFlags.Const
        )
      )
    );
  }

  // Add state declarations
  if (data.states) {
    for (const state of data.states) {
      statements.push(compileState(state));
    }
  }

  // Create return statement with JSX
  const jsxElement = createJSXElement(data);
  statements.push(ts.factory.createReturnStatement(jsxElement));

  return ts.factory.createBlock(statements, true);
}

function createJSXElement(data: ComponentData): ts.Expression {
  // If no content, return empty fragment
  if (!data.content || data.content.length === 0) {
    return ts.factory.createJsxFragment(
      ts.factory.createJsxOpeningFragment(),
      [],
      ts.factory.createJsxJsxClosingFragment()
    );
  }

  // If single element, return it directly
  if (data.content.length === 1) {
    const element = compileElement(data.content[0]);
    // Ensure we return an expression
    if (ts.isJsxText(element)) {
      // Wrap text in a fragment if it's standalone
      return ts.factory.createJsxFragment(
        ts.factory.createJsxOpeningFragment(),
        [element],
        ts.factory.createJsxJsxClosingFragment()
      );
    }
    return element as ts.Expression;
  }

  // Multiple elements, wrap in fragment
  const children = data.content.map(compileElement);
  return ts.factory.createJsxFragment(
    ts.factory.createJsxOpeningFragment(),
    children,
    ts.factory.createJsxJsxClosingFragment()
  );
}
