import { elllFileTypes } from "@elllphnt/utils";
import { keys } from "./keys";
import { mimeTypes } from "./mimetypes";

export function getEditorForFileType(type: string): string | undefined {
  switch (type) {
    case elllFileTypes.component:
      return keys.editors.elementa.editor;
    case elllFileTypes.primitive:
      return keys.editors.react;
    case elllFileTypes.hook:
      return keys.editors.typescript;
    case elllFileTypes.routine:
      return keys.editors.typescript;
    case elllFileTypes.context:
      return keys.editors.typescript;
    case mimeTypes.json:
      return keys.editors.json;
    default:
      return undefined;
  }
}
