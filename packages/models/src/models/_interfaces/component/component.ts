import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../css/_.js";
import { Project } from "../../../infrastructure/_.js";
import { DataInput } from "./data_input.js";
import { ElementaPreview, ElementaStage } from "./editors/_.js";
import { Fragment } from "./fragment.js";
import { State } from "./states/_.js";
import { Template } from "./template.js";

export interface Component {
  project: Project;
  stage: ElementaStage;
  preview: ElementaPreview;

  template: Template;

  props$: Observable<DataInput[]>;
  props: DataInput[];

  fragments$: Observable<Fragment[]>;
  fragments: Fragment[];

  states$: Observable<State[]>;
  states: State[];

  name: string;
  name$: Observable<string>;

  fragment(id: string): Fragment | undefined;
  fragment$(id: string): Observable<Fragment | undefined>;

  allStylesheets$: Observable<CssStyleSheet[]>;
  allStylesheets: CssStyleSheet[];
}
