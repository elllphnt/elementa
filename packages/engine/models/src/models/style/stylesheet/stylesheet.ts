import type {
  KeyframeSetData,
  StyleClassData,
  StyleSheetData,
} from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { AggregatedModelList, reconcileList } from "@elllphnt/elementa-kernel";
import { BehaviorSubject, type Observable } from "rxjs";
import { StyleClassCssStyleSheet } from "~/css/stylesheets/stylesheet/stylesheet.js";
import { ProjectModel } from "~/models/project.js";
import type { Project } from "~/project/project.js";
import { KeyframeSet } from "./keyframes/keyframe_set.js";
import type { StyleFragmentRegistry } from "./style_fragment_registry.js";
import { StyleClass } from "./styleclass.js";

export class Stylesheet extends ProjectModel<RecordState<StyleSheetData>> {
  readonly fragmentRegistry: StyleFragmentRegistry;

  private _classes: AggregatedModelList<
    RecordState<StyleClassData>,
    StyleClass
  >;
  private _keyframeSets: AggregatedModelList<
    RecordState<KeyframeSetData>,
    KeyframeSet
  >;
  private _cssStylesheets$ = new BehaviorSubject<StyleClassCssStyleSheet[]>([]);

  get className(): string {
    return this.key;
  }

  get cssStylesheets() {
    return this._cssStylesheets$.value;
  }
  get cssStylesheets$() {
    return this._cssStylesheets$.asObservable();
  }

  constructor({
    state,
    project,
    initialized,
  }: {
    state: RecordState<StyleSheetData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });

    this._classes = new AggregatedModelList({
      state: state.getListOfRecordStates("classes"),
      create: (state, init) =>
        new StyleClass({
          state,
          project: this.project,
          initialized: init && initialized,
        }),
    });
    this._keyframeSets = new AggregatedModelList({
      state: state.getListOfRecordStates("keyframeSets"),
      create: (state, init) =>
        new KeyframeSet({
          state,
          project: this.project,
          initialized: init && initialized,
        }),
    });

    this.addInitializer(() => {
      const systemCssStylesheetsSubscription = this._classes.models$.subscribe(
        (styleClasses) => {
          const [nextStylesheets, removed] = reconcileList({
            sources: styleClasses,
            targets: this.cssStylesheets,
            sourceRef: (s) => s,
            targetRef: (s) => s.styleClass,
            create: (stylesheet) =>
              new StyleClassCssStyleSheet({
                target: "style-system",
                styleClass: stylesheet,
              }),
          });

          this._cssStylesheets$.next(nextStylesheets);
          removed.forEach((r) => r.dispose());
        }
      );

      this.addDisposer(() => {
        systemCssStylesheetsSubscription.unsubscribe();
      });
    });

    this.addLifecycle(this._classes);
    this.addLifecycle(this._keyframeSets);

    this.addDisposer(() => {
      this._cssStylesheets$.complete();
    })
  }

  get classes(): StyleClass[] {
    return this._classes.models;
  }
  get classes$(): Observable<StyleClass[]> {
    return this._classes.models$;
  }

  get keyframeSets(): KeyframeSet[] {
    return this._keyframeSets.models;
  }
  get keyframeSets$(): Observable<KeyframeSet[]> {
    return this._keyframeSets.models$;
  }
}
