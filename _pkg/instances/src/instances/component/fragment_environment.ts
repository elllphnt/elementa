import { StateData, StyleModifierData } from "@elllphnt/elementa-base";
import {
  Component,
  DataInput,
  SlotFill,
  State,
} from "@elllphnt/elementa-models";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { FragmentInstance, SlotInstance, StateInstance } from "../_";
import { FragmentEnvironment } from "../fragment/environment/environment";
import { ComponentPropResolver } from "./prop_resolver";

export class ComponentInstanceFragmentEnvironment extends FragmentEnvironment {
  readonly propResolver: ComponentPropResolver;
  readonly component: Component;

  private _states$ = new BehaviorSubject<StateInstance[]>([]);
  private _fragments$ = new BehaviorSubject<FragmentInstance[]>([]);
  private _slots$ = new BehaviorSubject<SlotInstance[]>([]);

  get id(): string {
    return `component-instance-fragment-environment-${this.component.url}`;
  }

  slotFill(id: string): SlotFill | undefined {
    return this.propResolver.slotFill(id);
  }
  slotFill$(id: string): Observable<SlotFill | undefined> {
    return this.propResolver.slotFill$(id);
  }

  propValue(varName: string) {
    return this.propResolver.propValue(varName);
  }
  propValue$(varName: string): Observable<any> {
    return this.propResolver.propValue$(varName);
  }

  paramValue() {
    return undefined;
  }
  paramValue$() {
    return of(undefined);
  }

  get componentStack(): string[] {
    return [
      ...this.propResolver.environment.componentStack,
      this.component.url,
    ];
  }
  get componentStack$(): Observable<string[]> {
    return this.propResolver.environment.componentStack$.pipe(
      map((stack) => [...stack, this.component.url])
    );
  }
  get styleModifiers(): StyleModifierData[] {
    return this.propResolver.environment.styleModifiers;
  }
  get styleModifiers$(): Observable<StyleModifierData[]> {
    return this.propResolver.environment.styleModifiers$.pipe(
      map((styles) => styles)
    );
  }
  get states(): StateInstance<State<StateData>>[] {
    return this._states$.value;
  }
  get states$(): Observable<StateInstance<State<StateData>>[]> {
    return this._states$.asObservable();
  }
  get props(): DataInput[] {
    return this.component.props.toArray();
  }
  get props$(): Observable<DataInput[]> {
    return this.component.props.observable$;
  }
  get slots(): SlotInstance[] {
    return this._slots$.value;
  }
  get slots$(): Observable<SlotInstance[]> {
    return this._slots$.asObservable();
  }
  get fragments(): FragmentInstance[] {
    return this._fragments$.value;
  }
  get fragments$(): Observable<FragmentInstance[]> {
    return this._fragments$.asObservable();
  }

  constructor({
    component,
    propResolver,
  }: {
    component: Component;
    propResolver: ComponentPropResolver;
  }) {
    super({
      elementa: propResolver.environment.elementa,
    });

    this.component = component;
    this.propResolver = propResolver;
  }
}
