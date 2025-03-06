import {
  Fragment,
  FragmentParam,
  FrameWidget,
  Prop,
  SlotFill,
  Transformer,
} from "@repo/elementa-models";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { updateInstanceList } from "~/src/_lib/instances";
import { Elementa } from "../../elementa";
import { SlotInstance, StateInstance } from "../_";
import {
  ChildFragmentEnvironment,
  FragmentEnvironment,
} from "../fragment/environment";
import { FragmentInstance } from "../fragment/fragment";
import { Instance } from "../instance";
import { WidgetInstance } from "./widget";

export class FrameFragmentEnvironment extends FragmentEnvironment {
  readonly frame: FrameWidgetInstance;

  private _fragments$ = new BehaviorSubject<FragmentInstance[]>([]);

  get id() {
    return `fragment-environment-${this.frame.entity.id}`;
  }

  get states(): StateInstance[] {
    return this.frame.elementa.states;
  }
  get states$(): Observable<StateInstance[]> {
    return this.frame.elementa.states$;
  }

  get componentStack(): string[] {
    return [this.frame.entity.component.url];
  }
  get componentStack$(): Observable<string[]> {
    return of([this.frame.entity.component.url]);
  }

  get paged$() {
    return this.frame.entity.viewport$.pipe(map(Boolean));
  }
  get paged() {
    return Boolean(this.frame.entity.viewport);
  }

  get styleModifiers() {
    return this.frame.entity.styleModifiers;
  }
  get styleModifiers$() {
    return this.frame.entity.styleModifers$;
  }

  get fragments(): FragmentInstance[] {
    return this._fragments$.value;
  }
  get fragments$(): Observable<FragmentInstance[]> {
    return this._fragments$.asObservable();
  }

  get props(): Prop[] {
    return this.frame.entity.component.props;
  }
  get props$(): Observable<Prop[]> {
    return this.frame.entity.component.props$;
  }

  get transformers(): Transformer[] {
    return this.frame.entity.component.transformers;
  }
  get transformers$(): Observable<Transformer[]> {
    return this.frame.entity.component.transformers$;
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

  propValue(prop: Prop): any {
    return this.frame.entity.prop(prop.id) ?? prop.default;
  }
  propValue$(prop: Prop): Observable<any> {
    return this.frame.entity.prop$(prop.id).pipe(
      switchMap((value) => {
        if (value) {
          return of(value);
        } else {
          return prop.default$;
        }
      }),
    );
  }

  paramValue(param: FragmentParam): any {
    return this.frame.entity.prop(param.key);
  }
  paramValue$(param: FragmentParam): Observable<any> {
    return this.frame.entity.prop$(param.key);
  }

  constructor({
    entity,
    frame,
  }: {
    entity: Fragment;
    frame: FrameWidgetInstance;
  }) {
    super({
      entity,
      elementa: frame.elementa,
    });
    this.frame = frame;

    const fragmentsSubscription =
      this.frame.entity.component.fragments$.subscribe((fragments) => {
        const newFragments = updateInstanceList({
          instances: this.fragments,
          entities: fragments,
          createInstance: (fragment) => {
            const environment = new ChildFragmentEnvironment({
              entity: fragment,
              parent: this,
            });
            const instance = new FragmentInstance({
              environment,
              parent: this.frame,
            });

            instance.addDisposer(() => {
              environment.dispose();
            });
            return instance;
          },
        });
        this._fragments$.next(newFragments);
      });

    this.addDisposer(() => {
      fragmentsSubscription.unsubscribe();

      this.fragments.forEach((fragment) => fragment.dispose());
      this._fragments$.next([]);
      this._fragments$.complete();
    });
  }
}

export class FrameWidgetInstance extends WidgetInstance<FrameWidget> {
  private _fragment$ = new BehaviorSubject<FragmentInstance | undefined>(
    undefined,
  );

  get fragment$() {
    return this._fragment$;
  }
  get fragment() {
    return this._fragment$.value;
  }

  constructor({
    widget,
    elementa,
    parent,
  }: {
    widget: FrameWidget;
    elementa: Elementa;
    parent: Instance | null;
  }) {
    super({
      widget,
      elementa,
      parent,
    });

    const fragmentsSubscription = this.entity.fragment$.subscribe(
      (fragment) => {
        const [newFragment] = updateInstanceList({
          instances: this.fragment ? [this.fragment] : [],
          entities: fragment ? [fragment] : [],
          createInstance: (fragment) => {
            const environment = new FrameFragmentEnvironment({
              entity: fragment,
              frame: this,
            });
            const instance = new FragmentInstance({
              environment,
              parent: this,
            });
            instance.addDisposer(() => {
              environment.dispose();
            });
            return instance;
          },
        });

        this._fragment$.next(newFragment);
      },
    );

    this.addDisposer(() => {
      fragmentsSubscription.unsubscribe();
      this.fragment?.dispose();
      this._fragment$.next(undefined);
      this._fragment$.complete();
    });
  }
}
