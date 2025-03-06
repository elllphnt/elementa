import { javascript } from "@codemirror/lang-javascript";
import { tsCompletion } from "../../completions/ts_completion";

export function typescript() {
  const ts = javascript({
    typescript: true,
    jsx: true,
  });
  const autoCompletion = ts.language.data.of({
    autocomplete: tsCompletion,
  });

  return [ts, autoCompletion];
}
