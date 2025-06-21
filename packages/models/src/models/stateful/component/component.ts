import { ComponentData } from "@elllphnt/elementa-base";
import {
  Component,
  ComponentElementEnvironment,
  ComponentElementaEnvironment,
  File,
} from "@elllphnt/elementa-core";
import {
  AggregatedModelList,
  Model,
  OptionalModel,
  RecordState,
  combineLatestMerged,
  keyManager,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable, combineLatest, map } from "rxjs";
import { StatefulDataInput } from "../_shared/data_input.js";
import { StatefulElementaPreview } from "../elementa/preview.js";
import { StatefulElementaStage } from "../elementa/stage.js";
import { StatefulExpressionElement } from "../elements/expression.js";
import { StatefulFragmentElement } from "../elements/fragment.js";
import { StatefulFragment } from "../fragment/fragment.js";
import { StatefulState, StatefulcreateState } from "../states/_.js";

export class StatefulComponent
  extends Model<ComponentData>
  implements Component
{
  readonly file: File;
  readonly elementaEnvironment: ComponentElementaEnvironment;
  readonly elementEnvironment: ComponentElementEnvironment;
  readonly stage: StatefulElementaStage;
  readonly preview: StatefulElementaPreview;

  private _state: RecordState<
    Omit<
      ComponentData,
      "template" | "props" | "fragments" | "states" | "stage" | "preview"
    >
  >;
  readonly _template: OptionalModel<
    StatefulFragmentElement | StatefulExpressionElement
  >;
  private _props: AggregatedModelList<StatefulDataInput>;
  private _states: AggregatedModelList<StatefulState>;
  private _fragments: AggregatedModelList<StatefulFragment>;
  private _fragmentById$ = new BehaviorSubject<
    Record<string, StatefulFragment | undefined>
  >({});

  get template():
    | StatefulFragmentElement
    | StatefulExpressionElement
    | undefined {
    return this._template.state.value;
  }
  get template$(): Observable<
    StatefulFragmentElement | StatefulExpressionElement | undefined
  > {
    return this._template.state.value$;
  }

  get slotIds(): string[] {
    return this.elementEnvironment.slotIds;
  }
  get slotIds$(): Observable<string[]> {
    return this.elementEnvironment.slotIds$;
  }

  constructor({ init, file }: { init: ComponentData; file: File }) {
    const { template, props, fragments, states, editors, ...stateData } = init;
    const { stage, preview } = editors || {};
    super({ key: keyManager.next("component") });

    this.file = file;
    this.elementaEnvironment = new ComponentElementaEnvironment({
      component: this,
    });
    this.elementEnvironment = new ComponentElementEnvironment({
      component: this,
    });

    // Create stage and preview first
    this.stage = new StatefulElementaStage({
      init: stage || {},
      environment: this.elementaEnvironment,
    });
    this.preview = new StatefulElementaPreview({
      init: preview || {},
      environment: this.elementaEnvironment,
    });

    this._state = new RecordState({
      init: stateData,
    });

    // Create template
    this._template = new OptionalModel<
      StatefulFragmentElement | StatefulExpressionElement
    >({
      init: template,
      create: (data) => {
        switch (data.type) {
          case "fragment":
            return new StatefulFragmentElement({
              init: data,
              environment: this.elementEnvironment,
            });
          case "expression":
            return new StatefulExpressionElement({
              init: data,
              environment: this.elementEnvironment,
            });
          default:
            throw new Error(`Unknown template type: ${(data as any).type}`);
        }
      },
    });

    this._props = new AggregatedModelList({
      init: props || [],
      create: (data) => new StatefulDataInput({ init: data }),
      dataRef: (d) => d.name,
      modelRef: (m) => m.name,
    });

    this._fragments = new AggregatedModelList({
      init: fragments || [],
      create: (data) =>
        new StatefulFragment({
          init: data,
          environment: this.elementEnvironment,
        }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this._states = new AggregatedModelList({
      init: states || [],
      create: (data) => StatefulcreateState({ init: data, component: this }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    // watch fragments
    const fragmentSubscription = this._fragments.state.items$.subscribe(
      (fragments) => {
        const fragmentsById = Object.fromEntries(
          fragments.map((f) => [f.id, f])
        );
        this._fragmentById$.next(fragmentsById);
      }
    );

    this.addDisposer(() => {
      fragmentSubscription.unsubscribe();

      this.stage.dispose();
      this.preview.dispose();
      this._template.dispose();
      this._state.dispose();
      this._props.dispose();
      this._fragments.dispose();
      this._states.dispose();
    });
  }

  // data getters
  get data(): ComponentData {
    return {
      ...this._state.record,
      template: this._template.data,
      props: this._props.data,
      fragments: this._fragments.data,
      states: this._states.data,
      editors: {
        stage: this.stage.data,
        preview: this.preview.data,
      },
    };
  }

  get data$(): Observable<ComponentData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        template: this._template.data$,
        props: this._props.data$,
        fragments: this._fragments.data$,
        states: this._states.data$,
        editors: combineLatest({
          stage: this.stage.data$,
          preview: this.preview.data$,
        }),
      }),
    ]);
  }

  get props(): StatefulDataInput[] {
    return this._props.state.items;
  }

  get props$(): Observable<StatefulDataInput[]> {
    return this._props.state.items$;
  }

  get fragmentsById$(): Observable<
    Record<string, StatefulFragment | undefined>
  > {
    return this._fragmentById$.asObservable();
  }
  get fragmentsById(): Record<string, StatefulFragment | undefined> {
    return this._fragmentById$.getValue();
  }

  get fragments(): StatefulFragment[] {
    return this._fragments.state.items;
  }
  get fragments$(): Observable<StatefulFragment[]> {
    return this._fragments.state.items$;
  }

  fragment(id: string) {
    return this.fragmentsById[id];
  }
  fragment$(id: string): Observable<StatefulFragment | undefined> {
    return this.fragmentsById$.pipe(map((fragments) => fragments[id]));
  }

  get states(): StatefulState[] {
    return this._states.state.items;
  }

  get states$(): Observable<StatefulState[]> {
    return this._states.state.items$;
  }

  get name(): string | undefined {
    return this._state.entry("name");
  }

  get name$(): Observable<string | undefined> {
    return this._state.entry$("name");
  }

  // restore method
  restore({
    template,
    props,
    states,
    fragments,
    editors,
    ...stateData
  }: ComponentData): void {
    const { stage, preview } = editors || {};

    this._state.setRecord(stateData);
    this._template.restore(template);
    this._props.restore(props || []);
    this._fragments.restore(fragments || []);
    this._states.restore(states || []);
    this.stage.restore(stage || {});
    this.preview.restore(preview || {});
  }
}
