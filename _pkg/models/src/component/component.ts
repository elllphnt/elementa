import { ComponentData } from "@elllphnt/elementa-base";
import { CRDTModel, CRDTModelList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { Project } from "../project/project";
import { DataInput } from "./data_input";
import { Fragment } from "./fragment";
import { State } from "./states/_";
import { createState } from "./states/_create";
import { Template } from "./template";

export abstract class Component extends CRDTModel<ComponentData> {
  readonly project: Project;

  readonly template: Template;
  readonly editorStates: y.Map<y.Map<any>>;

  readonly props: CRDTModelList<DataInput>;
  readonly fragments: CRDTModelList<Fragment>;
  readonly states: CRDTModelList<State>;

  private readonly _fragmentsById$ = new BehaviorSubject<
    Record<string, Fragment>
  >({});

  abstract get url(): string;

  get name() {
    return this.state.name;
  }

  get name$() {
    return this.state$.pipe(
      map((v) => v.name ?? ""),
      distinctUntilChanged()
    );
  }

  fragment(id: string) {
    return this._fragmentsById$.value[id];
  }
  fragment$(id: string) {
    return this._fragmentsById$.pipe(
      map((fragments) => fragments[id]),
      distinctUntilChanged()
    );
  }

  constructor(ymap: y.Map<any>, project: Project) {
    super(ymap);

    this.project = project;

    this.template = new Template(this.getOrCreateMap("template"), this);
    this.editorStates = this.getOrCreateMap("editors");

    this.props = new CRDTModelList(
      this.getOrCreateArray("props"),
      (map) => new DataInput(map, this)
    );
    this.fragments = new CRDTModelList(
      this.getOrCreateArray("fragments"),
      (map) => new Fragment(map, this)
    );
    this.states = new CRDTModelList(this.getOrCreateArray("states"), (map) =>
      createState(map, this)
    );

    const fragmentsByIdSubscription = this.fragments.items$.subscribe(
      (fragments) => {
        this._fragmentsById$.next(
          Object.fromEntries(
            fragments.map((fragment) => [fragment.id, fragment])
          )
        );
      }
    );

    this.addDisposer(() => {
      this.props.dispose();
      this.fragments.dispose();
      this.states.dispose();
      this._fragmentsById$.complete();
      fragmentsByIdSubscription.unsubscribe();
    });
  }

  getEditorState(key: string): y.Map<any> {
    let map = this.editorStates.get(key);
    if (!map || !(map instanceof y.Map)) {
      map = new y.Map();
      this.editorStates.set(key, map);
    }
    return map;
  }
}
