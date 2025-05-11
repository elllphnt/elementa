import { ReactiveList } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet } from "../../../css/_.js";
import { Project } from "../../../infrastructure/_.js";
import { DataInput } from "./data_input.js";
import { Fragment } from "./fragment.js";
import { State } from "./states/_.js";
import { Template } from "./template.js";

export interface Component {
  project: Project;

  template: Template;
  editorStates: y.Map<y.Map<any>>;

  props: ReactiveList<DataInput>;
  fragments: ReactiveList<Fragment>;
  states: ReactiveList<State>;

  name: string;
  name$: Observable<string>;

  fragment(id: string): Fragment | undefined;
  fragment$(id: string): Observable<Fragment | undefined>;

  allStylesheets$: Observable<CssStyleSheet[]>;
  allStylesheets: CssStyleSheet[];

  getEditorState(key: string): y.Map<any>;
}
