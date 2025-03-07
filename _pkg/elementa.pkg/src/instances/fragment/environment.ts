import { StyleModifierData } from "@elllphnt/elll-element";
import {
  Fragment,
  FragmentParam,
  Prop,
  SlotFill,
  Transformer,
} from "@repo/elementa-models";
import { Disposable } from "@repo/utils";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Namespace } from "~/src/namespace/_";
import { Elementa } from "../../elementa";
import { SlotInstance } from "../_";
import { StateInstance } from "../states/state";
import { FragmentInstance } from "./fragment";

export abstract class FragmentEnvironment extends Disposable {
  readonly entity: Fragment;
  readonly elementa: Elementa;
  private _namespace$ = new BehaviorSubject<Namespace>(new Namespace());

  abstract get id(): string;

  abstract get componentStack(): string[];
  abstract get componentStack$(): Observable<string[]>;

  abstract get paged(): boolean;
  abstract get paged$(): Observable<boolean>;

  abstract get styleModifiers(): StyleModifierData[];
  abstract get styleModifiers$(): Observable<StyleModifierData[]>;

  abstract get states(): StateInstance[];
  abstract get states$(): Observable<StateInstance[]>;

  abstract get props(): Prop[];
  abstract get props$(): Observable<Prop[]>;

  abstract get slots(): SlotInstance[];
  abstract get slots$(): Observable<SlotInstance[]>;

  abstract slotFill(id: string): SlotFill | undefined;
  abstract slotFill$(id: string): Observable<SlotFill | undefined>;

  get params(): FragmentParam[] {
    return this.entity.params;
  }
  get params$(): Observable<FragmentParam[]> {
    return this.entity.params$;
  }

  abstract get fragments(): FragmentInstance[];
  abstract get fragments$(): Observable<FragmentInstance[]>;

  abstract get transformers(): Transformer[];
  abstract get transformers$(): Observable<Transformer[]>;

  abstract propValue(prop: Prop): any;
  abstract propValue$(prop: Prop): Observable<any>;

  abstract paramValue(param: FragmentParam): any;
  abstract paramValue$(param: FragmentParam): Observable<any>;

  get namespace$() {
    return this._namespace$.asObservable();
  }
  get namespace() {
    return this._namespace$.value;
  }

  constructor({ entity, elementa }: { entity: Fragment; elementa: Elementa }) {
    super();
    this.entity = entity;
    this.elementa = elementa;
    this.addDisposer(() => {
      this._namespace$.complete();
    });
  }

  setNamespace(namespace: Namespace): void {
    this._namespace$.next(namespace);
  }
}

export class ChildFragmentEnvironment extends FragmentEnvironment {
  parent: FragmentEnvironment;

  get id(): string {
    return `${this.parent.id}-child-${this.entity.id}`;
  }
  get componentStack(): string[] {
    return this.parent.componentStack;
  }
  get componentStack$(): Observable<string[]> {
    return this.parent.componentStack$;
  }
  get paged(): boolean {
    return false;
  }
  get paged$(): Observable<boolean> {
    return of(false);
  }
  get styleModifiers(): StyleModifierData[] {
    return this.parent.styleModifiers;
  }
  get styleModifiers$(): Observable<StyleModifierData[]> {
    return this.parent.styleModifiers$;
  }
  get states(): StateInstance[] {
    return this.parent.states;
  }
  get states$(): Observable<StateInstance[]> {
    return this.parent.states$;
  }
  get props(): Prop[] {
    return this.parent.props;
  }
  get props$(): Observable<Prop[]> {
    return this.parent.props$;
  }
  get fragments(): FragmentInstance[] {
    return [];
  }
  get fragments$(): Observable<FragmentInstance[]> {
    return of([]);
    // return this.parent.fragments$;
  }

  get transformers(): Transformer[] {
    return this.parent.transformers;
  }
  get transformers$(): Observable<Transformer[]> {
    return this.parent.transformers$;
  }

  get slots(): SlotInstance[] {
    return this.parent.slots;
  }
  get slots$(): Observable<SlotInstance[]> {
    return this.parent.slots$;
  }

  slotFill(id: string): SlotFill | undefined {
    return this.parent.slotFill(id);
  }
  slotFill$(id: string): Observable<SlotFill | undefined> {
    return this.parent.slotFill$(id);
  }

  propValue(prop: Prop) {
    return this.parent.propValue(prop);
  }
  propValue$(prop: Prop): Observable<any> {
    return this.parent.propValue$(prop);
  }
  paramValue(param: FragmentParam) {
    return this.parent.paramValue(param);
  }
  paramValue$(param: FragmentParam): Observable<any> {
    return this.parent.paramValue$(param);
  }

  constructor({
    entity,
    parent,
  }: {
    entity: Fragment;
    parent: FragmentEnvironment;
  }) {
    super({ entity, elementa: parent.elementa });
    this.parent = parent;
  }
}
