import { StyleModifierData } from "@elllphnt/elementa-base";
import {
  Fragment,
  FragmentParam,
  Prop,
  SlotFill,
} from "@elllphnt/elementa-models";
import { Disposable } from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Namespace } from "~/src/namespace/_";
import { Elementa } from "../../elementa";
import { SlotInstance } from "../_";
import { StateInstance } from "../states/state";
import { FragmentInstance } from "./fragment";

export abstract class FragmentEnvironment extends Disposable {
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

  abstract get fragments(): FragmentInstance[];
  abstract get fragments$(): Observable<FragmentInstance[]>;

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

  constructor({ elementa }: { elementa: Elementa }) {
    super();
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
    return `${this.parent.id}-child`;
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
    super({ elementa: parent.elementa });
    this.parent = parent;
  }
}

export class DefaultFragmentEnvironment extends FragmentEnvironment {
  get id(): string {
    return "default";
  }
  get componentStack(): string[] {
    return [];
  }
  get componentStack$(): Observable<string[]> {
    return of([]);
  }
  get paged(): boolean {
    return false;
  }
  get paged$(): Observable<boolean> {
    return of(false);
  }
  get styleModifiers(): StyleModifierData[] {
    return [];
  }
  get styleModifiers$(): Observable<StyleModifierData[]> {
    return of([]);
  }
  get states(): StateInstance[] {
    return [];
  }
  get states$(): Observable<StateInstance[]> {
    return of([]);
  }
  get props(): Prop[] {
    return [];
  }
  get props$(): Observable<Prop[]> {
    return of([]);
  }
  get slots(): SlotInstance[] {
    return [];
  }
  get slots$(): Observable<SlotInstance[]> {
    return of([]);
  }
  slotFill(id: string): SlotFill | undefined {
    return undefined;
  }
  slotFill$(id: string): Observable<SlotFill | undefined> {
    return of(undefined);
  }
  get fragments(): FragmentInstance[] {
    return [];
  }
  get fragments$(): Observable<FragmentInstance[]> {
    return of([]);
  }
  propValue(prop: Prop): any {
    return null;
  }
  propValue$(prop: Prop): Observable<any> {
    return of(null);
  }
  paramValue(param: FragmentParam): any {
    return null;
  }
  paramValue$(param: FragmentParam): Observable<any> {
    return of(null);
  }
}
