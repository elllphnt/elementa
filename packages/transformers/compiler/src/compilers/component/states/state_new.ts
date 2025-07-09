import type { StateData } from "@elllphnt/elementa-base";
import * as ts from "typescript";

export function compileState(state: StateData): ts.Statement {
  // Create useState hook call: const [stateName, setStateName] = useState(initialValue);
  const stateName = state.name || "state";
  const setterName = `set${stateName.charAt(0).toUpperCase()}${stateName.slice(
    1
  )}`;

  const initialValue =
    (state as any).init !== undefined
      ? ts.factory.createIdentifier(JSON.stringify((state as any).init))
      : ts.factory.createNull();

  return ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createArrayBindingPattern([
            ts.factory.createBindingElement(
              undefined,
              undefined,
              ts.factory.createIdentifier(stateName)
            ),
            ts.factory.createBindingElement(
              undefined,
              undefined,
              ts.factory.createIdentifier(setterName)
            ),
          ]),
          undefined,
          undefined,
          ts.factory.createCallExpression(
            ts.factory.createIdentifier("useState"),
            undefined,
            [initialValue]
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );
}
