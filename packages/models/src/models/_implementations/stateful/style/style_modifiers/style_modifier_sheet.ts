import {
  StyleModifierDefinitionData,
  StyleModifierSheetData,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, map, Observable } from "rxjs";
import {
  StyleModifierDefinition,
  StyleModifierSheet,
} from "~/models/style/_.js";
import { File, Project } from "~/project/_.js";
import { StatefulModel } from "../../_base.js";
import { StatefulStyleModifierDefinition } from "./style_modifier_definition.js";

export class StatefulStyleModifierSheet
  extends StatefulModel<StyleModifierSheetData>
  implements StyleModifierSheet
{
  project: Project;

  private _state: RecordState<Omit<StyleModifierSheetData, "modifiers">>;
  private _modifiers: AggregatedModelList<StatefulStyleModifierDefinition>;

  get modifiers(): StyleModifierDefinition[] {
    return this._modifiers.state.items;
  }

  get modifiers$(): Observable<StyleModifierDefinition[]> {
    return this._modifiers.state.items$;
  }

  get data(): StyleModifierSheetData {
    return {
      ...this._state.record,
      modifiers: this._modifiers.data,
    };
  }

  get data$(): Observable<StyleModifierSheetData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        modifiers: this._modifiers.data$,
      }),
    ]);
  }

  constructor({ init, file }: { init: StyleModifierSheetData; file: File }) {
    const { modifiers, ...stateData } = init;
    super({ key: keyManager.next("style-modifier-sheet") });

    this.project = file.project;

    this._state = new RecordState({
      init: stateData,
    });

    this._modifiers = new AggregatedModelList({
      init: modifiers || [],
      create: (data) => new StatefulStyleModifierDefinition({ init: data }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._modifiers.dispose();
    });
  }

  modifier(id: string): StyleModifierDefinition | undefined {
    return this._modifiers.state.items.find((m) => m.id === id);
  }

  modifier$(id: string): Observable<StyleModifierDefinition | undefined> {
    return this.modifiers$.pipe(
      map((modifiers) => modifiers.find((m) => m.id === id))
    );
  }

  modifierByName(name: string): StyleModifierDefinition | undefined {
    return this._modifiers.state.items.find((m) => m.name === name);
  }

  modifierByName$(
    name: string
  ): Observable<StyleModifierDefinition | undefined> {
    return this.modifiers$.pipe(
      map((modifiers) => modifiers.find((m) => m.name === name))
    );
  }

  addModifier(
    definition: StyleModifierDefinitionData
  ): StyleModifierDefinition {
    return this._modifiers.add(definition);
  }

  removeModifier(id: string): void {
    this._modifiers.remove(id);
  }

  restore(data: StyleModifierSheetData): void {
    const { modifiers, ...stateData } = data;
    this._state.setRecord(stateData);
    this._modifiers.restore(modifiers || []);
  }
}
