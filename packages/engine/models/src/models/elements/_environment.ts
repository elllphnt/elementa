import { Observable } from "rxjs";
import { Project } from "~/project/project.js";
import { Fragment } from "../fragment/fragment.js";

export interface ElementEnvironment {
  project: Project;

  fragment$(id: string): Observable<Fragment | undefined>;
  fragment(id: string): Fragment | undefined;

  slotIds$: Observable<string[]>;
  slotIds: string[];

  registerSlotId(id: string): void;
  unregisterSlotId(id: string): void;
}
