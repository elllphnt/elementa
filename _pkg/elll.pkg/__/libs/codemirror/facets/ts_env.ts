import { Facet } from "@codemirror/state";
import { VirtualTypeScriptEnvironment } from "../../typescript/vfs";
import { TSVirtualFileSystem } from "../../typescript/tsvfs";

export type TsEnv = {
  getEnvironment: () => VirtualTypeScriptEnvironment | undefined;
  getCurrentFileName: () => string | undefined;
  getTsVfs: () => TSVirtualFileSystem | undefined;
};

export const tsVirtualEnvironment = Facet.define<TsEnv, TsEnv | undefined>({
  combine: (sources) => {
    return sources[sources.length - 1];
  },
});
