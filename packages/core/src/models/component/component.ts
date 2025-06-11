import { Observable } from "rxjs";
import { File } from "~/project/_.js";
import { DataInput } from "../_shared/data_input.js";
import { ElementaPreview, ElementaStage } from "../elementa/_.js";
import { Fragment } from "../fragment/fragment.js";
import { State } from "../states/_.js";

export interface Component {
  file: File;

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
