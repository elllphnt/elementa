import { createContext } from "react";
import { EditorState } from "~/src";

export const EditorContext = createContext<EditorState | undefined>(undefined);
