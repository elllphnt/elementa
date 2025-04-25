import { StateData, StyleModifierData } from "@elllphnt/elll-element";
import {
  Component,
  FragmentParam,
  Prop,
  SlotFill,
  State,
} from "@repo/elementa-models";
import { Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { FragmentInstance, SlotInstance, StateInstance } from "../_";
import { FragmentEnvironment } from "../fragment/environment";

export abstract class ComponentPropResolver {
  readonly environment: FragmentEnvironment;

  abstract get paged(): boolean;
  abstract get paged$(): Observable<boolean>;

  abstract propValue(prop: Prop): any;
  abstract propValue$(prop: Prop): Observable<any>;

  abstract paramValue(param: FragmentParam): any;
  abstract paramValue$(param: FragmentParam): Observable<any>;

  abstract slotFill(id: string): SlotFill | undefined;
  abstract slotFill$(id: string): Observable<SlotFill | undefined>;

  constructor({ environment }: { environment: FragmentEnvironment }) {
    this.environment = environment;
  }
}

export class ComponentInstanceEnvironment extends FragmentEnvironment {
  readonly propResolver: ComponentPropResolver;
  readonly component: Component;

  private _states$ = new BehaviorSubject<StateInstance[]>([]);
  private _fragments$ = new BehaviorSubject<FragmentInstance[]>([]);
  private _slots$ = new BehaviorSubject<SlotInstance[]>([]);

  get id(): string {
    return `component-environment-${this.component.id}`;
  }

  slotFill(id: string): SlotFill | undefined {
    return this.propResolver.slotFill(id);
  }
  slotFill$(id: string): Observable<SlotFill | undefined> {
    return this.propResolver.slotFill$(id);
  }
  propValue(prop: Prop) {
    return this.propResolver.propValue(prop);
  }
  propValue$(prop: Prop): Observable<any> {
    return this.propResolver.propValue$(prop);
  }
  paramValue(param: FragmentParam) {
    return this.propResolver.paramValue(param);
  }
  paramValue$(param: FragmentParam): Observable<any> {
    return this.propResolver.paramValue$(param);
  }

  get componentStack(): string[] {
    return [...this.propResolver.environment.componentStack, this.component.id];
  }
  get componentStack$(): Observable<string[]> {
    return this.propResolver.environment.componentStack$.pipe(
      map((stack) => [...stack, this.component.id]),
    );
  }
  get paged(): boolean {
    return this.propResolver.paged;
  }
  get paged$(): Observable<boolean> {
    return this.propResolver.paged$;
  }
  get styleModifiers(): StyleModifierData[] {
    return this.propResolver.environment.styleModifiers;
  }
  get styleModifiers$(): Observable<StyleModifierData[]> {
    return this.propResolver.environment.styleModifiers$.pipe(
      map((styles) => styles),
    );
  }
  get states(): StateInstance<State<StateData>>[] {
    return this._states$.value;
  }
  get states$(): Observable<StateInstance<State<StateData>>[]> {
    return this._states$.asObservable();
  }
  get props(): Prop[] {
    return this.component.props;
  }
  get props$(): Observable<Prop[]> {
    return this.component.props$;
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

export class ComponentInstance extends Disposable {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${ComponentInstance.keySeed}-${ComponentInstance.key++}`;

  readonly environment: FragmentEnvironment;
  readonly template: FragmentInstance;

  constructor({
    component,
    propResolver,
  }: {
    component: Component;
    propResolver: ComponentPropResolver;
  }) {
    super();
    this.environment = new ComponentInstanceEnvironment({
      component,
      propResolver,
    });

    this.template = new FragmentInstance({
      environment: this.environment,
      entity: component.template,
      parent: null,
    });
  }
}
