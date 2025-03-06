import { Diagnostic, LintSource } from "@codemirror/lint";
import { DiagnosticCategory, TypeChecker } from "typescript";
import { tsVirtualEnvironment } from "../../../facets/ts_env";


function tsDiagnosticCategoryToSeverity(
  category: number,
): Diagnostic["severity"] {
  switch (category) {
    case DiagnosticCategory.Warning:
      return "warning";
    case DiagnosticCategory.Error:
      return "error";
    case DiagnosticCategory.Message:
      return "info";
    case DiagnosticCategory.Suggestion:
      return "hint";
    default:
      return "error";
  }
}

export const tslintLintSource: LintSource = (view) => {
  const ts = view.state.facet(tsVirtualEnvironment);

  const env = ts?.getEnvironment();
  const fileName = ts?.getCurrentFileName();

  if (!fileName || !env) return [];

  try {
    const diagnostics = env.languageService.getSemanticDiagnostics(fileName);

    return diagnostics.map((diagnostic) => {
      let message: string;
      if (typeof diagnostic.messageText === "string") {
        message = diagnostic.messageText;
      } else {
        message = diagnostic.messageText.messageText;
      }
      return {
        from: diagnostic.start ?? 0,
        to: (diagnostic.start ?? 0) + (diagnostic.length ?? 0),
        message,
        severity: tsDiagnosticCategoryToSeverity(diagnostic.category),
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
};
