import { KeyBinding } from "@codemirror/view";
import { format } from "../commands/format";
import { save } from "../commands/save";

export const editingKeyMap: KeyBinding[] = [
  {
    key: "Ctrl-s",
    run: save,
  },
  {
    key: "Alt-f",
    shift: format,
  },
];
