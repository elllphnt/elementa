import {
  CompletionContext,
  CompletionResult,
  CompletionSource,
} from "@codemirror/autocomplete";
import { CodeAction, CompletionTriggerKind } from "typescript";
import { tsVirtualEnvironment } from "../facets/ts_env";

export const tsCompletion: CompletionSource = (context: CompletionContext) => {
  const ts = context.state.facet(tsVirtualEnvironment);

  const env = ts?.getEnvironment();
  const fileName = ts?.getCurrentFileName();

  if (!fileName || !env) return null;

  const word = context.matchBefore(/[\w"'\.]+$/);
  // if (!word) {
  //   return null;
  // }

  const completions = env.languageService.getCompletionsAtPosition(
    fileName,
    context.pos,
    {
      triggerKind: context.explicit
        ? CompletionTriggerKind.Invoked
        : CompletionTriggerKind.TriggerCharacter,
      importModuleSpecifierPreference: "non-relative",
      includeCompletionsForModuleExports: true,
      includeCompletionsForImportStatements: true,
    },
  );
  if (!completions) return null;

  const entries = completions.entries.sort((a, b) => {
    return a.sortText.localeCompare(b.sortText);
  });

  const result: CompletionResult = {
    from: word?.from || context.pos,
    options: entries.map((entry, index) => {
      let boost = 1 / index;

      if (entry.kind === "alias" && !entry.source) {
        boost++;
      }
      if (word && entry.name.startsWith(word.text)) {
        boost++;
      }
      if (entry.source?.startsWith("/modules/")) {
        boost += 2;
      }
      if (entry.source?.startsWith("/node_modules/")) {
        boost += 1;
      }

      return {
        label: entry.name,
        type: "keyword",
        boost,
        apply: async (view, completion, from, to) => {
          let actions: CodeAction[] | undefined = undefined;
          if (entry.hasAction) {
            const details = env.languageService.getCompletionEntryDetails(
              fileName,
              context.pos,
              entry.name,
              {},
              entry.source,
              {
                importModuleSpecifierPreference: "non-relative",
              },
              entry.data,
            );
            if (!details) {
            }

            actions = details?.codeActions;
          }

          view.dispatch({
            changes: { from, to, insert: entry.name },
            selection: { anchor: from + entry.name.length },
          });

          if (actions) {
            for (const action of actions) {
              for (const change of action.changes) {
                for (const textChange of change.textChanges) {
                  view.dispatch({
                    changes: {
                      from: textChange.span.start,
                      to: textChange.span.start + textChange.span.length,
                      insert: textChange.newText,
                    },
                  });
                }
              }
            }
          }
        },
      };
    }),
  };

  return result;
};
