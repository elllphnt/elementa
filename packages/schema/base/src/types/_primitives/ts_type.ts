export type TsType =
  | TsPrimitiveType
  | TsLiteralType
  | TsArrayType
  | TsTupleType
  | TsUnionType
  | TsIntersectionType
  | TsObjectType
  | TsFunctionType
  | TsConditionalType
  | TsMappedType
  | TsInferType
  | TsUnknownType
  | TsAnyType
  | TsVoidType
  | TsNeverType
  | TsNullType
  | TsUndefinedType
  | TsTemplateLiteralType
  | TsTypeLiteral
  | TsTypeReference
  | TsRawType;

// Core Types
export interface TsPrimitiveType {
  kind: "primitive";
  name: "string" | "number" | "boolean" | "symbol" | "bigint";
}

export interface TsLiteralType {
  kind: "literal";
  value: string | number | boolean | null;
}

export interface TsArrayType {
  kind: "array";
  elementType: TsType;
}

export interface TsTupleType {
  kind: "tuple";
  elements: TsType[];
}

export interface TsUnionType {
  kind: "union";
  types: TsType[];
}

export interface TsIntersectionType {
  kind: "intersection";
  types: TsType[];
}

export interface TsObjectType {
  kind: "object";
  properties: TsProperty[];
  indexSignature?: TsIndexSignature;
}

export interface TsFunctionType {
  kind: "function";
  parameters: TsParameter[];
  returnType: TsType;
  typeParameters?: TsTypeParameter[];
}

export interface TsTypeReference {
  kind: "typeReference";
  name: string;
  typeArguments?: TsType[];
}

export interface TsTypeLiteral {
  kind: "typeLiteral";
  members: TsTypeLiteralMember[];
}

export interface TsProperty extends TsModifiers {
  kind: "property";
  name: string;
  type: TsType;
  decorators?: TsDecorator[];
}

export interface TsParameter extends TsModifiers {
  name: string;
  type: TsType;
}

export interface TsIndexSignature {
  keyType: "string" | "number";
  valueType: TsType;
}

export type TsTypeLiteralMember = TsProperty | TsCallSignature;

export interface TsCallSignature {
  kind: "callSignature";
  parameters: TsParameter[];
  returnType: TsType;
  typeParameters?: TsTypeParameter[];
}

export interface TsTypeParameter {
  name: string;
  constraint?: TsType;
  default?: TsType;
}

// Advanced Types
export interface TsConditionalType {
  kind: "conditional";
  checkType: TsType;
  extendsType: TsType;
  trueType: TsType;
  falseType: TsType;
}

export interface TsMappedType {
  kind: "mapped";
  parameter: string;
  constraint?: TsType;
  nameType?: TsType;
  valueType: TsType;
  optionalModifier?: "+" | "-";
  readonlyModifier?: "+" | "-";
}

export interface TsInferType {
  kind: "infer";
  name: string;
}

export interface TsTemplateLiteralType {
  kind: "templateLiteral";
  head: string;
  spans: TsTemplateSpan[];
}

export interface TsTemplateSpan {
  type: TsType;
  literal: string;
}

// Special Atomic Types
export interface TsUnknownType {
  kind: "unknown";
}

export interface TsAnyType {
  kind: "any";
}

export interface TsVoidType {
  kind: "void";
}

export interface TsNeverType {
  kind: "never";
}

export interface TsNullType {
  kind: "null";
}

export interface TsUndefinedType {
  kind: "undefined";
}

// Modifiers & Decorators
export interface TsModifiers {
  optional?: boolean;
  readonly?: boolean;
}

export interface TsDecorator {
  name: string;
  arguments?: any[];
}

export interface TsRawType {
  kind: "raw";
  text: string;
}

// Alias

export type TsTypeAlias = {
  kind: "alias";
  name: string;
  type: TsType;
  typeParameters?: {
    name: string;
    constraint?: TsType;
    default?: TsType;
  }[];
};

// Interface

export type TsInterfaceDeclaration = {
  kind: "interface";
  name: string;
  typeParameters?: {
    name: string;
    constraint?: TsType;
    default?: TsType;
  }[];
  extends?: string[]; // Could be upgraded to TsTypeReference[] if needed
  members: TsTypeLiteralMember[];
};

// Enums

export type TsEnumDeclaration = {
  kind: "enum";
  name: string;
  members: { name: string; value?: string | number }[];
  const?: boolean; // Optional, to track `const enum`
};

export type TsTypeDeclarationLike =
  | TsTypeAlias
  | TsInterfaceDeclaration
  | TsEnumDeclaration;
