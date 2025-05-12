import { Observable } from "rxjs";
import { Project } from "../../../infrastructure/_.js";
import { DataInput } from "./data_input.js";
import { ElementaPreview, ElementaStage } from "./editors/_.js";
import { Fragment } from "./fragment.js";
import { State } from "./states/_.js";

export interface Component {
  project: Project;

  stage: ElementaStage;
  preview: ElementaPreview;

  template: Fragment;

  props$: Observable<DataInput[]>;
  props: DataInput[];

  fragments$: Observable<Fragment[]>;
  fragments: Fragment[];

  states$: Observable<State[]>;
  states: State[];

  name: string | undefined;
  name$: Observable<string | undefined>;

  fragment(id: string): Fragment | undefined;
  fragment$(id: string): Observable<Fragment | undefined>;
}
