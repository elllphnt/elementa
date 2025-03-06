import { linter } from "@codemirror/lint";
import { tslintLintSource } from "./source";

export function tslint() {
  return linter(tslintLintSource);
}
