import type {
  TsEnumDeclaration,
  TsInterfaceDeclaration,
  TsType,
} from "@elllphnt/elementa-base";
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

export function tsTypeToTypeNode(type: TsType): ts.TypeNode {
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
export function tsTypeFromTypeNode(node: ts.TypeNode): TsType {
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
        elementType: tsTypeFromTypeNode(arrayNode.elementType),
      };
    }

    case ts.SyntaxKind.TupleType: {
      const tupleNode = node as ts.TupleTypeNode;
      return {
        kind: "tuple",
        elements: tupleNode.elements.map((element) =>
          tsTypeFromTypeNode(element)
        ),
      };
    }

    case ts.SyntaxKind.UnionType: {
      const unionNode = node as ts.UnionTypeNode;
      return {
        kind: "union",
        types: unionNode.types.map((type) => tsTypeFromTypeNode(type)),
      };
    }

    case ts.SyntaxKind.IntersectionType: {
      const intersectionNode = node as ts.IntersectionTypeNode;
      return {
        kind: "intersection",
        types: intersectionNode.types.map((type) => tsTypeFromTypeNode(type)),
      };
    }

    case ts.SyntaxKind.TypeReference: {
      const typeRefNode = node as ts.TypeReferenceNode;
      const typeName = ts.isIdentifier(typeRefNode.typeName)
        ? typeRefNode.typeName.text
        : typeRefNode.typeName.getText();

      return {
        kind: "typeReference",
        name: typeName,
        typeArguments: typeRefNode.typeArguments?.map((arg) =>
          tsTypeFromTypeNode(arg)
        ),
      };
    }

    case ts.SyntaxKind.TypeLiteral: {
      const typeLiteralNode = node as ts.TypeLiteralNode;
      const members: any[] = [];
      let indexSignature: any = undefined;

      for (const member of typeLiteralNode.members) {
        if (ts.isPropertySignature(member)) {
          const name = ts.isIdentifier(member.name)
            ? member.name.text
            : member.name?.getText() || "";

          members.push({
            kind: "property",
            name,
            type: member.type
              ? tsTypeFromTypeNode(member.type)
              : ({ kind: "any" } as TsType),
            optional: !!member.questionToken,
          });
        } else if (ts.isCallSignatureDeclaration(member)) {
          const parameters = member.parameters.map((param) => ({
            name: ts.isIdentifier(param.name)
              ? param.name.text
              : param.name.getText(),
            type: param.type
              ? tsTypeFromTypeNode(param.type)
              : ({ kind: "any" } as TsType),
            optional: !!param.questionToken,
          }));

          const typeParameters = member.typeParameters?.map((typeParam) => ({
            name: typeParam.name.text,
            constraint: typeParam.constraint
              ? tsTypeFromTypeNode(typeParam.constraint)
              : undefined,
            default: typeParam.default
              ? tsTypeFromTypeNode(typeParam.default)
              : undefined,
          }));

          members.push({
            kind: "callSignature",
            parameters,
            returnType: member.type
              ? tsTypeFromTypeNode(member.type)
              : ({ kind: "void" } as TsType),
            typeParameters,
          });
        } else if (ts.isIndexSignatureDeclaration(member)) {
          const keyParam = member.parameters[0];
          const keyType =
            keyParam.type?.kind === ts.SyntaxKind.StringKeyword
              ? "string"
              : "number";

          indexSignature = {
            keyType,
            valueType: member.type
              ? tsTypeFromTypeNode(member.type)
              : ({ kind: "any" } as TsType),
          };
        }
      }

      // Check if this is an object type (has properties) or type literal (has members)
      const hasProperties = members.some((m) => m.kind === "property");
      const hasCallSignatures = members.some((m) => m.kind === "callSignature");

      if (hasProperties && !hasCallSignatures) {
        return {
          kind: "object",
          properties: members.filter((m) => m.kind === "property"),
          indexSignature,
        };
      } else {
        return {
          kind: "typeLiteral",
          members,
        };
      }
    }

    case ts.SyntaxKind.FunctionType: {
      const functionNode = node as ts.FunctionTypeNode;

      const parameters = functionNode.parameters.map((param) => ({
        name: ts.isIdentifier(param.name)
          ? param.name.text
          : param.name.getText(),
        type: param.type
          ? tsTypeFromTypeNode(param.type)
          : ({ kind: "any" } as TsType),
        optional: !!param.questionToken,
      }));

      const typeParameters = functionNode.typeParameters?.map((typeParam) => ({
        name: typeParam.name.text,
        constraint: typeParam.constraint
          ? tsTypeFromTypeNode(typeParam.constraint)
          : undefined,
        default: typeParam.default
          ? tsTypeFromTypeNode(typeParam.default)
          : undefined,
      }));

      return {
        kind: "function",
        parameters,
        returnType: tsTypeFromTypeNode(functionNode.type),
        typeParameters,
      };
    }

    case ts.SyntaxKind.ConditionalType: {
      const conditionalNode = node as ts.ConditionalTypeNode;
      return {
        kind: "conditional",
        checkType: tsTypeFromTypeNode(conditionalNode.checkType),
        extendsType: tsTypeFromTypeNode(conditionalNode.extendsType),
        trueType: tsTypeFromTypeNode(conditionalNode.trueType),
        falseType: tsTypeFromTypeNode(conditionalNode.falseType),
      };
    }

    case ts.SyntaxKind.MappedType: {
      const mappedNode = node as ts.MappedTypeNode;

      const readonlyModifier = mappedNode.readonlyToken
        ? mappedNode.readonlyToken.kind === ts.SyntaxKind.MinusToken
          ? "-"
          : "+"
        : undefined;

      const optionalModifier = mappedNode.questionToken
        ? mappedNode.questionToken.kind === ts.SyntaxKind.MinusToken
          ? "-"
          : "+"
        : undefined;

      return {
        kind: "mapped",
        parameter: mappedNode.typeParameter.name.text,
        constraint: mappedNode.typeParameter.constraint
          ? tsTypeFromTypeNode(mappedNode.typeParameter.constraint)
          : undefined,
        nameType: mappedNode.nameType
          ? tsTypeFromTypeNode(mappedNode.nameType)
          : undefined,
        valueType: mappedNode.type
          ? tsTypeFromTypeNode(mappedNode.type)
          : ({ kind: "any" } as TsType),
        optionalModifier,
        readonlyModifier,
      };
    }

    case ts.SyntaxKind.InferType: {
      const inferNode = node as ts.InferTypeNode;
      return {
        kind: "infer",
        name: inferNode.typeParameter.name.text,
      };
    }

    case ts.SyntaxKind.TemplateLiteralType: {
      const templateNode = node as ts.TemplateLiteralTypeNode;

      const spans = templateNode.templateSpans.map((span) => ({
        type: tsTypeFromTypeNode(span.type),
        literal: span.literal.text,
      }));

      return {
        kind: "templateLiteral",
        head: templateNode.head.text,
        spans,
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

export function tsInterfaceDeclarationToNode(
  type: TsInterfaceDeclaration
): ts.InterfaceDeclaration {
  const typeParameters = type.typeParameters?.map((typeParam) =>
    ts.factory.createTypeParameterDeclaration(
      undefined,
      ts.factory.createIdentifier(typeParam.name),
      typeParam.constraint ? tsTypeToTypeNode(typeParam.constraint) : undefined,
      typeParam.default ? tsTypeToTypeNode(typeParam.default) : undefined
    )
  );

  const heritageClause = type.extends?.length
    ? ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ...type.extends.map((extendType) =>
          ts.factory.createExpressionWithTypeArguments(
            ts.factory.createIdentifier(extendType),
            undefined
          )
        ),
      ])
    : undefined;

  const members = type.members.map((member) => {
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
      const parameters = member.parameters.map((param) =>
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
          typeParam.default ? tsTypeToTypeNode(typeParam.default) : undefined
        )
      );

      return ts.factory.createCallSignature(
        callTypeParameters,
        parameters,
        tsTypeToTypeNode(member.returnType)
      );
    } else {
      throw new Error(`Unsupported member kind: ${(member as any).kind}`);
    }
  });

  return ts.factory.createInterfaceDeclaration(
    undefined,
    ts.factory.createIdentifier(type.name),
    typeParameters,
    heritageClause ? [heritageClause] : undefined,
    members
  );
}

export function tsInterfaceDeclarationFromNode(
  node: ts.InterfaceDeclaration
): TsInterfaceDeclaration {
  const typeParameters = node.typeParameters?.map((typeParam) => ({
    name: typeParam.name.text,
    constraint: typeParam.constraint
      ? tsTypeFromTypeNode(typeParam.constraint)
      : undefined,
    default: typeParam.default
      ? tsTypeFromTypeNode(typeParam.default)
      : undefined,
  }));

  const extendsClause = node.heritageClauses?.find(
    (clause) => clause.token === ts.SyntaxKind.ExtendsKeyword
  );

  const extendsTypes = extendsClause?.types.map((type) => {
    if (ts.isIdentifier(type.expression)) {
      return type.expression.text;
    } else {
      return type.expression.getText();
    }
  });

  const members = node.members.map((member) => {
    if (ts.isPropertySignature(member)) {
      const name = ts.isIdentifier(member.name)
        ? member.name.text
        : member.name?.getText() || "";

      return {
        kind: "property" as const,
        name,
        type: member.type
          ? tsTypeFromTypeNode(member.type)
          : ({ kind: "any" } as TsType),
        optional: !!member.questionToken,
      };
    } else if (ts.isCallSignatureDeclaration(member)) {
      const parameters = member.parameters.map((param) => ({
        name: ts.isIdentifier(param.name)
          ? param.name.text
          : param.name.getText(),
        type: param.type
          ? tsTypeFromTypeNode(param.type)
          : ({ kind: "any" } as TsType),
        optional: !!param.questionToken,
      }));

      const typeParameters = member.typeParameters?.map((typeParam) => ({
        name: typeParam.name.text,
        constraint: typeParam.constraint
          ? tsTypeFromTypeNode(typeParam.constraint)
          : undefined,
        default: typeParam.default
          ? tsTypeFromTypeNode(typeParam.default)
          : undefined,
      }));

      return {
        kind: "callSignature" as const,
        parameters,
        returnType: member.type
          ? tsTypeFromTypeNode(member.type)
          : ({ kind: "void" } as TsType),
        typeParameters,
      };
    } else {
      throw new Error(`Unsupported member kind: ${ts.SyntaxKind[member.kind]}`);
    }
  });

  return {
    kind: "interface",
    name: node.name.text,
    typeParameters,
    extends: extendsTypes,
    members,
  };
}

export function tsEnumDeclarationToNode(
  type: TsEnumDeclaration
): ts.EnumDeclaration {
  const members = type.members.map((member) => {
    if (member.value !== undefined) {
      let initializer: ts.Expression;
      if (typeof member.value === "string") {
        initializer = ts.factory.createStringLiteral(member.value);
      } else if (typeof member.value === "number") {
        initializer = ts.factory.createNumericLiteral(member.value);
      } else {
        throw new Error(
          `Unsupported enum member value type: ${typeof member.value}`
        );
      }

      return ts.factory.createEnumMember(
        ts.factory.createIdentifier(member.name),
        initializer
      );
    } else {
      return ts.factory.createEnumMember(
        ts.factory.createIdentifier(member.name),
        undefined
      );
    }
  });

  const modifiers = type.const
    ? [ts.factory.createModifier(ts.SyntaxKind.ConstKeyword)]
    : undefined;

  return ts.factory.createEnumDeclaration(
    modifiers,
    ts.factory.createIdentifier(type.name),
    members
  );
}

export function tsEnumDeclarationFromNode(
  node: ts.EnumDeclaration
): TsEnumDeclaration {
  const members = node.members.map((member) => {
    const name = ts.isIdentifier(member.name)
      ? member.name.text
      : member.name.getText();

    let value: string | number | undefined;
    if (member.initializer) {
      if (ts.isStringLiteral(member.initializer)) {
        value = member.initializer.text;
      } else if (ts.isNumericLiteral(member.initializer)) {
        value = Number(member.initializer.text);
      } else {
        // For complex initializers, we could evaluate them or store as raw text
        // For now, we'll leave them undefined
        value = undefined;
      }
    }

    return {
      name,
      value,
    };
  });

  const isConst = node.modifiers?.some(
    (modifier) => modifier.kind === ts.SyntaxKind.ConstKeyword
  );

  return {
    kind: "enum",
    name: node.name.text,
    members,
    const: isConst,
  };
}
