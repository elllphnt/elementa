export type ObjectSchema = {
  type: "object";
  properties: {
    [key: string]: Schema;
  };
};
export type ListSchema = {
  type: "list";
  items: Schema;
};
export type Schema =
  | "string"
  | "number"
  | "boolean"
  | ObjectSchema
  | ListSchema;

export type ObjectSchemaValue<S extends ObjectSchema> = {
  [K in keyof S["properties"]]?: SchemaValue<S["properties"][K]>;
};

export type ListSchemaValue<S extends ListSchema> = SchemaValue<S["items"]>[];

export type SchemaValue<S extends Schema> = S extends "string"
  ? string | undefined
  : S extends "number"
    ? number | undefined
    : S extends "boolean"
      ? boolean | undefined
      : S extends ObjectSchema
        ? ObjectSchemaValue<S>
        : S extends ListSchema
          ? ListSchemaValue<S>
          : never;
