import { elllFileTypes } from "@elllphnt/utils";
import { componentEditor } from "../editors/elementa/editor";
import { mimeTypes } from "./mimetypes";
import { jsonEditor } from "../editors/monaco/json";
import { reactEditor } from "../editors/monaco/react";

export function getEditorForFileType(type: string): string | undefined {
  switch (type) {
    case elllFileTypes.components.elll:
      return componentEditor.id;
    case elllFileTypes.components.react:
      return reactEditor.id;
    case mimeTypes.json:
      return jsonEditor.id;
    default:
      return undefined;
  }
}
