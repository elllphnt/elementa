import { BehaviorSubject, Observable } from "rxjs";
import { ElementEnvironment } from "~/_models/elements/_environment.js";
import { File } from "~/project/_.js";
import { DataInput } from "../_shared/data_input.js";
import {
  ElementaEnvironment,
  ElementaPreview,
  ElementaStage,
} from "../elementa/_.js";
import { ExpressionElement, FragmentElement } from "../elements/_.js";
import { Fragment } from "../fragment/fragment.js";
import { State } from "../states/_.js";

export class ComponentElementEnvironment implements ElementEnvironment {
  component: Component;
  get project() {
    return this.component.file.project;
  }

  private _slotIds$ = new BehaviorSubject<string[]>([]);

  get slotIds$(): Observable<string[]> {
    return this._slotIds$.asObservable();
  }
  get slotIds(): string[] {
    return this._slotIds$.value;
  }

  fragment(id: string): Fragment | undefined {
    return this.component.fragment(id);
  }
  fragment$(id: string): Observable<Fragment | undefined> {
    return this.component.fragment$(id);
  }

  constructor({ component }: { component: Component }) {
    this.component = component;
  }

  registerSlotId(id: string): void {
    const current = new Set(this._slotIds$.value);
    current.add(id);
    this._slotIds$.next(Array.from(current));
  }
  unregisterSlotId(id: string): void {
    this._slotIds$.next(this._slotIds$.value.filter((slotId) => slotId !== id));
  }
}
export class ComponentElementaEnvironment implements ElementaEnvironment {
  component: Component;
  get project() {
    return this.component.file.project;
  }

  get hostUrl(): string | undefined {
    return this.component.file.url;
  }

  fragment(id: string): Fragment | undefined {
    return this.component.fragment(id);
  }
  fragment$(id: string): Observable<Fragment | undefined> {
    return this.component.fragment$(id);
  }

  constructor({ component }: { component: Component }) {
    this.component = component;
  }
  get defaultRouterUrl(): string | undefined {
    throw new Error("Method not implemented.");
  }
}

export interface Component {
  file: File;

  stage: ElementaStage;
  preview: ElementaPreview;

  props$: Observable<DataInput[]>;
  props: DataInput[];

  slotIds$: Observable<string[]>;
  slotIds: string[];

  fragments$: Observable<Fragment[]>;
  fragments: Fragment[];

  states$: Observable<State[]>;
  states: State[];

  template: FragmentElement | ExpressionElement | undefined;
  template$: Observable<FragmentElement | ExpressionElement | undefined>;

  name: string | undefined;
  name$: Observable<string | undefined>;

  fragment(id: string): Fragment | undefined;
  fragment$(id: string): Observable<Fragment | undefined>;
}
