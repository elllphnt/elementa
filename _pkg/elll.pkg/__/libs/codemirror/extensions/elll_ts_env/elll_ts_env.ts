import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { EditorFile } from "../../../../editors/content";
import { Elll } from "../../../../elll/elll";
import { TSVirtualFileSystem } from "../../../typescript/tsvfs";
import { tsVirtualEnvironment } from "../../facets/ts_env";

export function elllTsEnvironment({
  elll,
  getFile,
}: {
  elll: Elll;
  getFile: () => EditorFile | undefined;
}): Extension {
  const facet = tsVirtualEnvironment.of({
    getEnvironment: () => {
      const tsvfs = elll.tsvfs;
      return tsvfs?.environment;
    },
    getCurrentFileName: () => {
      const file = getFile();
      if (!file) return undefined;
      return TSVirtualFileSystem.modulePath(file.fid);
    },
    getTsVfs: () => {
      return elll.tsvfs;
    },
  });

  const syncer = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const ts = update.state.facet(tsVirtualEnvironment);
      const env = ts?.getEnvironment();
      const fileName = ts?.getCurrentFileName();
      if (env && fileName) {
        const content = update.state.doc.toString();
        if (env.getSourceFile(fileName)) {
          env.updateFile(fileName, content);
        } else {
          env.createFile(fileName, content);
        }
      }
    }
  });

  return [facet, syncer];
}
