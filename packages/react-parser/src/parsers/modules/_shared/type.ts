import {
  EnumDeclaration,
  InterfaceDeclaration,
  TypeAliasDeclaration,
} from "ts-morph";
import { ParsedModule } from "../../../module/module";

export function extractType(
  statement: TypeAliasDeclaration | InterfaceDeclaration | EnumDeclaration,
  module: ParsedModule
) {
  const name = statement.getName();
  const source = statement.getText();
  const cleanedSource = source.replace(/\bexport\s+/, "");
  module.types[name] = `export ${cleanedSource}`;
}
