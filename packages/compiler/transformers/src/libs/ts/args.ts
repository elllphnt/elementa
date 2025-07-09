import type { CallExpression, Expression } from "ts-morph";
import { Node } from "ts-morph";

export function parseArguments({
  node,
  argModeNamed,
}: {
  node: CallExpression;
  argModeNamed?: boolean;
}): {
  args: Record<string, any>;
  argMode: "positional" | "named";
} {
  const args: Record<string, any> = {};
  const callArgs = node.getArguments();

  if (callArgs.length === 0) {
    // No arguments provided
    return { args, argMode: argModeNamed ? "named" : "positional" };
  } else if (
    callArgs.length === 1 &&
    Node.isObjectLiteralExpression(callArgs[0])
  ) {
    // Named arguments mode
    const obj = callArgs[0];
    obj.getProperties().forEach((prop) => {
      if (Node.isPropertyAssignment(prop)) {
        const name = prop.getName();
        const initializer = prop.getInitializer();
        console.log({
          name,
          initializer: initializer?.getText(),
          kind: initializer?.getKindName(),
        });
        if (initializer) {
          if (Node.isStringLiteral(initializer)) {
            args[name] = initializer.getLiteralValue();
          } else if (Node.isNumericLiteral(initializer)) {
            args[name] = initializer.getLiteralValue();
          } else if (Node.isNullLiteral(initializer)) {
            args[name] = null;
          } else if (Node.isBooleanKeyword(initializer)) {
            args[name] = initializer.getText() === "true";
          } else if (Node.isExpression(initializer)) {
            args[name] = {
              __expression: (initializer as Expression).getText(),
            };
          }
        }
      } else if (Node.isShorthandPropertyAssignment(prop)) {
        const name = prop.getName();
        args[name] = {
          __expression: name, // shorthand property name
        };
      }
    });
    return { args, argMode: "named" };
  } else {
    if (argModeNamed) {
      throw Error(
        `Expected named arguments, but received positional arguments: ${callArgs
          .map((arg) => arg.getText())
          .join(", ")}`
      );
    }

    // Positional arguments mode
    callArgs.forEach((arg, idx) => {
      args[idx] = arg.getText();
    });
    return { args, argMode: "positional" };
  }
}
