import { getUrlScheme } from "@elllphnt/utils";
import { File } from "@repo/backend";
import { EditorStateStore, Project, ProjectData } from "@repo/elementa";
import { debounceTime } from "rxjs";
import { Elll } from "../../elll/elll";
import { mimeTypes } from "../constants/mime_types";
import { Persistor } from "../persitor";
import { ElllComponentStore } from "./components/component_store";
import { ElllContextManager } from "./contexts/context_manager";
import { ElllEditorStateStore } from "./editor_states/editor_state_store";
import { EntityFileStore } from "./elementa_files/elementa_file_store";
import { ElllFileManager } from "./files/file_manager";
import { ElllKeyframeSetStore } from "./keyframe_sets/keyframe_set_store";
import { LibraryStore } from "./libraries/library_store";
import { ElllPackageManager } from "./packages/package_manager";
import { ElllStylesheetStore } from "./stylesheets/stylesheet_store";
import { ElllThemeStore } from "./themes/theme_store";
import { ElllTransitionStore } from "./transitions/transition_store";
import { ElllTypefaceManager } from "./typefaces/typeface_manager";
import { ElllVariableStore } from "./variables/variable_store";

const projectFilePath = ".elll/project.json";

export class ElllProject extends Project {
  readonly elll: Elll;

  readonly persitor: Persistor<ProjectData>;

  readonly componentStore: ElllComponentStore;
  readonly variableStore: ElllVariableStore;
  readonly themeStore: ElllThemeStore;
  readonly contextManager: ElllContextManager;
  readonly typefaceManager: ElllTypefaceManager;
  readonly editorStateStore: EditorStateStore;
  readonly packageManager: ElllPackageManager;
  readonly libraryStore: LibraryStore;
  readonly entityFileStore: EntityFileStore;
  readonly transitionStore: ElllTransitionStore;
  readonly stylesheetStore: ElllStylesheetStore;
  readonly keyframeSetStore: ElllKeyframeSetStore;
  readonly fileManager: ElllFileManager;

  get languageService() {
    return this.elll.tsvfs.environment?.languageService;
  }

  urlToResourceUrl(url: string): string {
    const scheme = getUrlScheme(url);
    switch (scheme) {
      // case "fid": {
      //   const { id } = parseFidUrl(url);
      //   if (!this.elll.workspaceId) {
      //     throw new Error("Workspace ID is not set");
      //   }
      //   return makeElllResourceUrl({
      //     type: "workspace-file",
      //     key: WorkspaceFile.key({
      //       driveId: this.elll.workspaceId,
      //       fid: id,
      //     }),
      //   });
      // }
      case "elll": {
        return url;
      }
      default: {
        throw new Error(`Unsupported URL scheme: ${scheme}`);
      }
    }
  }
  fileFromResourceUrl(url: string): File {
    const instance = this.elll.backend.instance(url, true);
    return instance as File;
  }

  constructor({ elll }: { elll: Elll }) {
    super();
    this.elll = elll;

    this.componentStore = new ElllComponentStore({ project: this });
    this.variableStore = new ElllVariableStore({ project: this });
    this.themeStore = new ElllThemeStore({ project: this });
    this.contextManager = new ElllContextManager({ project: this });
    this.typefaceManager = new ElllTypefaceManager({ project: this });
    this.editorStateStore = new ElllEditorStateStore({ project: this });
    this.packageManager = new ElllPackageManager({ project: this });
    this.libraryStore = new LibraryStore({ project: this });
    this.entityFileStore = new EntityFileStore({ project: this });
    this.transitionStore = new ElllTransitionStore({ project: this });
    this.stylesheetStore = new ElllStylesheetStore({ project: this });
    this.keyframeSetStore = new ElllKeyframeSetStore({ project: this });
    this.fileManager = new ElllFileManager({ project: this });

    this.persitor = new Persistor({
      elll: this.elll,
      resolveFile: (elll) =>
        elll.fileAtPath(projectFilePath, { type: mimeTypes.json }),
      resolveFile$: (elll) =>
        elll.fileAtPath$(projectFilePath, { type: mimeTypes.json }),
    });

    const loadSubscription = this.persitor.data$.subscribe((data) => {
      this.restore(data);
    });
    const saveSubscription = this.data$
      .pipe(debounceTime(500))
      .subscribe((data) => {
        this.persitor.save(data);
      });
  }
}
