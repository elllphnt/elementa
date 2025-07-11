import type { Type, TypeProperty } from "@elllphnt/elementa-base";
import * as ts from "typescript";

export function parseTypeNode(typeStr: string): ts.TypeNode {
  const sourceCode = `type _T = ${typeStr};`;

  const sourceFile = ts.createSourceFile(
    "temp.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  const statement = sourceFile.statements[0];

  if (ts.isTypeAliasDeclaration(statement) && ts.isTypeNode(statement.type)) {
    return statement.type;
  }

  throw new Error("Failed to parse type node from string.");
}
export function printTypeNode(typeNode: ts.TypeNode): string {
  const printer = ts.createPrinter();
  const dummySource = ts.createSourceFile(
    "dummy.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  return printer.printNode(ts.EmitHint.Unspecified, typeNode, dummySource);
}

export function tsTypeToTypeNode(type: Type): ts.TypeNode {
  switch (type.kind) {
    case "primitive": {
      switch (type.name) {
        case "string":
          return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        case "number":
          return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
        case "boolean":
          return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
        case "symbol":
          return ts.factory.createKeywordTypeNode(ts.SyntaxKind.SymbolKeyword);
        case "bigint":
          return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword);
        default: {
          const name = (type as any).name;
          throw new Error(`Unknown primitive type: ${name}`);
        }
      }
    }
    case "literal": {
      if (typeof type.value === "string") {
        return ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(type.value)
        );
      } else if (typeof type.value === "number") {
        return ts.factory.createLiteralTypeNode(
          ts.factory.createNumericLiteral(type.value)
        );
      } else if (typeof type.value === "boolean") {
        return ts.factory.createLiteralTypeNode(
          type.value ? ts.factory.createTrue() : ts.factory.createFalse()
        );
      } else if (type.value === null) {
        return ts.factory.createLiteralTypeNode(ts.factory.createNull());
      } else {
        throw new Error(`Unsupported literal value: ${type.value}`);
      }
    }
    case "array": {
      return ts.factory.createArrayTypeNode(tsTypeToTypeNode(type.elementType));
    }
    case "tuple": {
      return ts.factory.createTupleTypeNode(
        type.elements.map((element) => tsTypeToTypeNode(element))
      );
    }
    case "union": {
      return ts.factory.createUnionTypeNode(
        type.types.map((unionType) => tsTypeToTypeNode(unionType))
      );
    }
    case "intersection": {
      return ts.factory.createIntersectionTypeNode(
        type.types.map((intersectionType) => tsTypeToTypeNode(intersectionType))
      );
    }
    case "object": {
      const properties = type.properties.map((prop) => {
        const signature = ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier(prop.name),
          prop.optional
            ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
            : undefined,
          tsTypeToTypeNode(prop.type)
        );
        return signature;
      });

      const indexSignature = type.indexSignature
        ? ts.factory.createIndexSignature(
            undefined,
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                ts.factory.createIdentifier("key"),
                undefined,
                type.indexSignature.keyType === "string"
                  ? ts.factory.createKeywordTypeNode(
                      ts.SyntaxKind.StringKeyword
                    )
                  : ts.factory.createKeywordTypeNode(
                      ts.SyntaxKind.NumberKeyword
                    )
              ),
            ],
            tsTypeToTypeNode(type.indexSignature.valueType)
          )
        : undefined;

      const members = indexSignature
        ? [...properties, indexSignature]
        : properties;
      return ts.factory.createTypeLiteralNode(members);
    }
    case "function": {
      const parameters = type.parameters.map((param) =>
        ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          ts.factory.createIdentifier(param.name),
          param.optional
            ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
            : undefined,
          tsTypeToTypeNode(param.type)
        )
      );

      const typeParameters = type.typeParameters?.map((typeParam) =>
        ts.factory.createTypeParameterDeclaration(
          undefined,
          ts.factory.createIdentifier(typeParam.name),
          typeParam.constraint
            ? tsTypeToTypeNode(typeParam.constraint)
            : undefined,
          typeParam.default ? tsTypeToTypeNode(typeParam.default) : undefined
        )
      );

      return ts.factory.createFunctionTypeNode(
        typeParameters,
        parameters,
        tsTypeToTypeNode(type.returnType)
      );
    }
    case "typeReference": {
      const typeArguments = type.typeArguments?.map((arg) =>
        tsTypeToTypeNode(arg)
      );
      return ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(type.name),
        typeArguments
      );
    }
    case "typeLiteral": {
      const literalMembers = type.members.map((member) => {
        if (member.kind === "property") {
          return ts.factory.createPropertySignature(
            undefined,
            ts.factory.createIdentifier(member.name),
            member.optional
              ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
              : undefined,
            tsTypeToTypeNode(member.type)
          );
        } else if (member.kind === "callSignature") {
          const callParameters = member.parameters.map((param) =>
            ts.factory.createParameterDeclaration(
              undefined,
              undefined,
              ts.factory.createIdentifier(param.name),
              param.optional
                ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                : undefined,
              tsTypeToTypeNode(param.type)
            )
          );

          const callTypeParameters = member.typeParameters?.map((typeParam) =>
            ts.factory.createTypeParameterDeclaration(
              undefined,
              ts.factory.createIdentifier(typeParam.name),
              typeParam.constraint
                ? tsTypeToTypeNode(typeParam.constraint)
                : undefined,
              typeParam.default
                ? tsTypeToTypeNode(typeParam.default)
                : undefined
            )
          );

          return ts.factory.createCallSignature(
            callTypeParameters,
            callParameters,
            tsTypeToTypeNode(member.returnType)
          );
        } else {
          throw new Error(`Unsupported member kind: ${(member as any).kind}`);
        }
      });

      return ts.factory.createTypeLiteralNode(literalMembers);
    }
    case "conditional": {
      return ts.factory.createConditionalTypeNode(
        tsTypeToTypeNode(type.checkType),
        tsTypeToTypeNode(type.extendsType),
        tsTypeToTypeNode(type.trueType),
        tsTypeToTypeNode(type.falseType)
      );
    }
    case "mapped": {
      return ts.factory.createMappedTypeNode(
        type.readonlyModifier === "+"
          ? ts.factory.createToken(ts.SyntaxKind.ReadonlyKeyword)
          : type.readonlyModifier === "-"
          ? ts.factory.createToken(ts.SyntaxKind.MinusToken)
          : undefined,
        ts.factory.createTypeParameterDeclaration(
          undefined,
          ts.factory.createIdentifier(type.parameter),
          type.constraint ? tsTypeToTypeNode(type.constraint) : undefined
        ),
        type.nameType ? tsTypeToTypeNode(type.nameType) : undefined,
        type.optionalModifier === "+"
          ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
          : type.optionalModifier === "-"
          ? ts.factory.createToken(ts.SyntaxKind.MinusToken)
          : undefined,
        tsTypeToTypeNode(type.valueType),
        undefined
      );
    }
    case "infer": {
      return ts.factory.createInferTypeNode(
        ts.factory.createTypeParameterDeclaration(
          undefined,
          ts.factory.createIdentifier(type.name)
        )
      );
    }
    case "templateLiteral": {
      const spans = type.spans.map((span) =>
        ts.factory.createTemplateLiteralTypeSpan(
          tsTypeToTypeNode(span.type),
          ts.factory.createTemplateMiddle(span.literal)
        )
      );

      return ts.factory.createTemplateLiteralType(
        ts.factory.createTemplateHead(type.head),
        spans
      );
    }
    case "unknown": {
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
    }
    case "any": {
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    }
    case "void": {
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    }
    case "never": {
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
    }
    case "null": {
      return ts.factory.createLiteralTypeNode(ts.factory.createNull());
    }
    case "undefined": {
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
    }
    case "raw": {
      return parseTypeNode(type.text);
    }
    default: {
      throw new Error(`Unsupported type kind: ${(type as any).kind}`);
    }
  }
}

export function tsTypeFromTypeNode({
  node,
  checker,
  args = {},
  stack = [],
}: {
  node: ts.TypeNode;
  checker: ts.TypeChecker;
  args: Record<string, Type>;
  stack: string[];
}): Type {
  switch (node.kind) {
    case ts.SyntaxKind.StringKeyword:
      return { kind: "primitive", name: "string" };
    case ts.SyntaxKind.NumberKeyword:
      return { kind: "primitive", name: "number" };
    case ts.SyntaxKind.BooleanKeyword:
      return { kind: "primitive", name: "boolean" };
    case ts.SyntaxKind.SymbolKeyword:
      return { kind: "primitive", name: "symbol" };
    case ts.SyntaxKind.BigIntKeyword:
      return { kind: "primitive", name: "bigint" };
    case ts.SyntaxKind.UnknownKeyword:
      return { kind: "unknown" };
    case ts.SyntaxKind.AnyKeyword:
      return { kind: "any" };
    case ts.SyntaxKind.VoidKeyword:
      return { kind: "void" };
    case ts.SyntaxKind.NeverKeyword:
      return { kind: "never" };
    case ts.SyntaxKind.UndefinedKeyword:
      return { kind: "undefined" };
    case ts.SyntaxKind.NullKeyword:
      return { kind: "null" };
    case ts.SyntaxKind.LiteralType: {
      const literalNode = node as ts.LiteralTypeNode;
      const literal = literalNode.literal;

      if (ts.isStringLiteral(literal)) {
        return { kind: "literal", value: literal.text };
      } else if (ts.isNumericLiteral(literal)) {
        return { kind: "literal", value: Number(literal.text) };
      } else if (literal.kind === ts.SyntaxKind.TrueKeyword) {
        return { kind: "literal", value: true };
      } else if (literal.kind === ts.SyntaxKind.FalseKeyword) {
        return { kind: "literal", value: false };
      } else if (literal.kind === ts.SyntaxKind.NullKeyword) {
        return { kind: "literal", value: null };
      } else {
        throw new Error(
          `Unsupported literal type: ${ts.SyntaxKind[literal.kind]}`
        );
      }
    }
    case ts.SyntaxKind.ArrayType: {
      const arrayNode = node as ts.ArrayTypeNode;
      return {
        kind: "array",
        elementType: tsTypeFromTypeNode({
          node: arrayNode.elementType,
          checker,
          args,
          stack,
        }),
      };
    }
    case ts.SyntaxKind.TupleType: {
      const tupleNode = node as ts.TupleTypeNode;
      return {
        kind: "tuple",
        elements: tupleNode.elements.map((element) =>
          tsTypeFromTypeNode({ node: element, checker, args, stack })
        ),
      };
    }
    case ts.SyntaxKind.UnionType: {
      const unionNode = node as ts.UnionTypeNode;
      return {
        kind: "union",
        types: unionNode.types.map((type) =>
          tsTypeFromTypeNode({ node: type, checker, args, stack })
        ),
      };
    }
    case ts.SyntaxKind.IntersectionType: {
      const intersectionNode = node as ts.IntersectionTypeNode;
      return {
        kind: "intersection",
        types: intersectionNode.types.map((type) =>
          tsTypeFromTypeNode({ node: type, checker, args, stack })
        ),
      };
    }
    case ts.SyntaxKind.FunctionType: {
      const functionNode = node as ts.FunctionTypeNode;

      const parameters = functionNode.parameters.map((param) => ({
        name: ts.isIdentifier(param.name)
          ? param.name.text
          : param.name.getText(),
        type: param.type
          ? tsTypeFromTypeNode({ node: param.type, checker, args, stack })
          : ({ kind: "any" } as Type),
        optional: !!param.questionToken,
      }));

      return {
        kind: "function",
        parameters,
        returnType: tsTypeFromTypeNode({
          node: functionNode.type,
          checker,
          args,
          stack,
        }),
      };
    }
    case ts.SyntaxKind.TemplateLiteralType: {
      return {
        kind: "primitive",
        name: "string",
      };
    }
    case ts.SyntaxKind.TypeLiteral: {
      const typeLiteralNode = node as ts.TypeLiteralNode;

      const properties: TypeProperty[] = [];
      let index:
        | {
            keyType?: Type;
            valueType?: Type;
          }
        | undefined;

      for (const member of typeLiteralNode.members) {
        if (ts.isPropertySignature(member)) {
          const name = ts.isIdentifier(member.name)
            ? member.name.text
            : member.name?.getText() || "";

          properties.push({
            kind: "property",
            name,
            type: member.type
              ? tsTypeFromTypeNode({ node: member.type, checker, args, stack })
              : ({ kind: "any" } as Type),
            optional: !!member.questionToken,
          });
        } else if (ts.isIndexSignatureDeclaration(member)) {
          if (!index) {
            index = {};
          }

          if (member.parameters.length > 0) {
            const param = member.parameters[0];
            if (param.type) {
              index.keyType = tsTypeFromTypeNode({
                node: param.type,
                checker,
                args,
                stack,
              });
            }
          }

          if (member.type) {
            index.valueType = tsTypeFromTypeNode({
              node: member.type,
              checker,
              args,
              stack,
            });
          }
        }
      }

      return {
        kind: "object",
        properties,
        index,
      };
    }
    case ts.SyntaxKind.TypeReference: {
      const typeRefNode = node as ts.TypeReferenceNode;
      const typeNameNode = typeRefNode.typeName;
      const typeName = typeNameNode.getText();
      const typeArgs = typeRefNode.typeArguments?.map((arg) =>
        tsTypeFromTypeNode({ node: arg, checker, args, stack })
      );

      const symbol = checker.getSymbolAtLocation(typeNameNode);

      if (symbol) {
        return typeFromSymbol({
          symbol,
          checker,
          sourceFile: node.getSourceFile(),
          args: Object.fromEntries(
            (
              symbol.getDeclarations()?.[0] as
                | ts.TypeAliasDeclaration
                | ts.InterfaceDeclaration
            )?.typeParameters?.map((param, i) => [
              param.name.text,
              typeArgs?.[i] ?? { kind: "any" },
            ]) ?? []
          ),
          stack,
        });
      }

      // If no symbol, return unresolved reference
      return {
        kind: "reference",
        url: node.getSourceFile().fileName,
        specifier: typeName,
        args: typeArgs,
      };
    }
    default: {
      return {
        kind: "raw",
        text: printTypeNode(node),
      };
    }
  }
}

export function typeFromSymbol({
  symbol,
  checker,
  sourceFile,
  args = {},
  stack: incomingStack = [],
}: {
  symbol: ts.Symbol;
  checker: ts.TypeChecker;
  sourceFile: ts.SourceFile;
  args?: Record<string, Type>;
  stack: string[];
}): Type {
  const symbolName = symbol.getName();

  // Circular ref guard
  if (incomingStack.includes(symbolName)) {
    return {
      kind: "reference",
      url: sourceFile.fileName,
      specifier: symbolName,
      args: Object.values(args),
    };
  }
  const stack = [...incomingStack, symbolName];

  const declarations = symbol.getDeclarations();
  if (!declarations || declarations.length === 0) {
    return { kind: "unknown" };
  }

  // Check if at least one declaration is in the current source file
  const isLocal = declarations.some(
    (decl) => decl.getSourceFile().fileName === sourceFile.fileName
  );

  if (!isLocal) {
    return {
      kind: "reference",
      url: declarations[0].getSourceFile().fileName,
      specifier: symbol.getName(),
      args: Object.values(args),
    };
  }

  const decl = declarations[0];

  if (ts.isTypeAliasDeclaration(decl)) {
    return tsTypeFromTypeNode({ node: decl.type, checker, args, stack });
  }

  if (ts.isInterfaceDeclaration(decl)) {
    return tsTypeFromInterfaceDeclaration({
      node: decl,
      checker,
      args,
      stack,
    });
  }

  if (ts.isEnumDeclaration(decl)) {
    const types: Type[] = decl.members.map((member) => {
      const name = member.name.getText();
      const value = checker.getConstantValue(member);
      return {
        kind: "literal",
        value: typeof value !== "undefined" ? value : name,
      };
    });

    return {
      kind: "union",
      types,
    };
  }

  return {
    kind: "raw",
    text: checker.symbolToString(symbol),
  };
}

export function tsTypeFromInterfaceDeclaration({
  node,
  checker,
  args,
  stack,
}: {
  node: ts.InterfaceDeclaration;
  checker: ts.TypeChecker;
  args: Record<string, Type>;
  stack: string[];
}): Type {
  // Extract own properties
  const properties: TypeProperty[] = [];
  for (const member of node.members) {
    if (ts.isPropertySignature(member)) {
      const name = ts.isIdentifier(member.name)
        ? member.name.text
        : member.name.getText();
      const typeAnnotation = member.type;
      properties.push({
        kind: "property",
        name,
        type: typeAnnotation
          ? tsTypeFromTypeNode({ node: typeAnnotation, checker, args, stack })
          : { kind: "any" },
        optional: Boolean(member.questionToken),
      });
    }
  }

  // Resolve local extended interfaces
  const extendedTypes: Type[] = [];
  node.heritageClauses?.forEach((clause) => {
    if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
      clause.types.forEach((exprWithTypeArgs) => {
        const expr = exprWithTypeArgs.expression;
        const symbol = checker.getSymbolAtLocation(expr);
        const decl = symbol?.getDeclarations()?.[0];
        if (
          decl &&
          ts.isInterfaceDeclaration(decl) &&
          decl.getSourceFile().fileName === node.getSourceFile().fileName
        ) {
          // Map type arguments for the extended interface
          const typeArgMap: Record<string, Type> = {};
          if (exprWithTypeArgs.typeArguments && decl.typeParameters) {
            decl.typeParameters.forEach((param, idx) => {
              const argNode = exprWithTypeArgs.typeArguments![idx];
              typeArgMap[param.name.text] = tsTypeFromTypeNode({
                node: argNode,
                checker,
                args,
                stack,
              });
            });
          }
          extendedTypes.push(
            tsTypeFromInterfaceDeclaration({
              node: decl,
              checker,
              args: typeArgMap,
              stack,
            })
          );
        }
      });
    }
  });

  // Merge extended types via intersection, or return a simple object
  if (extendedTypes.length > 0) {
    return {
      kind: "intersection",
      types: [
        ...extendedTypes,
        {
          kind: "object",
          properties,
        },
      ],
    };
  }

  return {
    kind: "object",
    properties,
  };
}
