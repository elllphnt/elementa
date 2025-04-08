import loader, { Monaco } from "@monaco-editor/loader";
import { useObservable } from "@repo/utils";
import { MonacoEditorState } from "../editors/monaco/monaco";
import { useElll } from "../hooks/elll/elll";
import { IElll } from "../types/elll";
import { TSVirtualFileSystem } from "./code/tsvfs";
import { keys } from "./keys";

// loader.config({ monaco });

const monacoPromise = loader.init();

export function getMonaco() {
  return monacoPromise as Promise<Monaco>;
}

export function useMonaco() {
  const elll = useElll();
  return useObservable(
    elll.property$(keys.configs.editors.monaco.instance),
    elll.property(keys.configs.editors.monaco.instance),
  );
}

function setupTypescript({ monaco, elll }: { monaco: Monaco; elll: IElll }) {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    jsx: monaco.languages.typescript.JsxEmit.React,
    esModuleInterop: true,
    typeRoots: ["node_modules/@types"], // Ensures React type definitions are recognized
  });

  const tsvfs = new TSVirtualFileSystem({ elll });
  tsvfs.init();
}

function getActiveMonacoEditor(elll: IElll) {
  const activeEditor = elll.shell.workspace?.activeEditor;
  if (activeEditor instanceof MonacoEditorState) {
    return activeEditor as MonacoEditorState<any>;
  } else {
    return null;
  }
}

function setupCommands({ monaco, elll }: { monaco: Monaco; elll: IElll }) {
  monaco.editor.addCommand({
    id: "save",
    run: async (...args) => {
      const editor = getActiveMonacoEditor(elll);
      if (!editor) return;
      await editor.format();
      await editor.save();
    },
  });
  monaco.editor.addKeybindingRule({
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
    command: "save",
  });
}

export async function setupMonaco(elll: IElll) {
  try {
    const monaco = await loader.init();

    setupTypescript({ monaco, elll });
    setupCommands({ monaco, elll });

    elll.setProperty(keys.configs.editors.monaco.instance, monaco);
  } catch (e) {
    console.error("Failed to setup Monaco");
    console.error(e);
  }
}
