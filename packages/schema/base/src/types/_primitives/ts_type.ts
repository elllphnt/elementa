import type { ImportReference } from "./import.js";

export type Type =
  | PrimitiveType
  | LiteralType
  | ArrayType
  | TupleType
  | UnionType
  | IntersectionType
  | ObjectType
  | FunctionType
  | UnknownType
  | AnyType
  | VoidType
  | NeverType
  | NullType
  | UndefinedType
  | TypeReference
  | RawType;

export interface PrimitiveType {
  kind: "primitive";
  name: "string" | "number" | "boolean" | "symbol" | "bigint";
}

export interface LiteralType {
  kind: "literal";
  value: string | number | boolean | null;
}

export interface ArrayType {
  kind: "array";
  elementType: Type;
}

export interface TupleType {
  kind: "tuple";
  elements: Type[];
}

export interface UnionType {
  kind: "union";
  types: Type[];
}

export interface IntersectionType {
  kind: "intersection";
  types: Type[];
}

export interface ObjectType {
  kind: "object";
  properties: TypeProperty[];
  index?: {
    keyType?: Type;
    valueType?: Type;
  };
}

export interface FunctionType {
  kind: "function";
  parameters: TypeParameter[];
  returnType: Type;
}

export interface TypeReference {
  kind: "reference";
  ref: ImportReference;
  args?: Type[];
}

export interface TypeProperty {
  kind: "property";
  name: string;
  type: Type;
  optional?: boolean;
}

export interface TypeParameter {
  name: string;
  type: Type;
  optional?: boolean;
}
export interface UnknownType {
  kind: "unknown";
}
export interface AnyType {
  kind: "any";
}

export interface VoidType {
  kind: "void";
}

export interface NeverType {
  kind: "never";
}

export interface NullType {
  kind: "null";
}

export interface UndefinedType {
  kind: "undefined";
}

export interface RawType {
  kind: "raw";
  text: string;
}
