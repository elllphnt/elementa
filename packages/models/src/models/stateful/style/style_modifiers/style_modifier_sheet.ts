import {
  StyleModifierDefinitionData,
  StyleModifierSheetData,
} from "@elllphnt/elementa-base";
import { File, Project, StyleModifierSheet } from "@elllphnt/elementa-core";
import {
  combineLatestMerged,
  keyManager,
  RecordState,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import { StatefulModel } from "../../_base.js";

export class StatefulStyleModifierSheet
  extends StatefulModel<StyleModifierSheetData>
  implements StyleModifierSheet
{
  project: Project;

  private _state: RecordState<StyleModifierSheetData>;

  get modifiers(): StyleModifierDefinitionData[] {
    return this._state.entry("modifiers") || [];
  }

  get modifiers$(): Observable<StyleModifierDefinitionData[]> {
    return this._state
      .entry$("modifiers")
      .pipe(map((modifiers) => modifiers || []));
  }

  get data(): StyleModifierSheetData {
    return {
      ...this._state.record,
    };
  }

  get data$(): Observable<StyleModifierSheetData> {
    return combineLatestMerged([this._state.record$]);
  }

  constructor({ init, file }: { init: StyleModifierSheetData; file: File }) {
    const { ...stateData } = init;
    super({ key: keyManager.next("style-modifier-sheet") });

    this.project = file.project;

    this._state = new RecordState({
      init: stateData,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  addModifier(definition: StyleModifierDefinitionData) {
    const modifiers = this._state.entry("modifiers") || [];
    this._state.set("modifiers", [...modifiers, definition]);
  }

  removeModifier(id: string): void {
    const modifiers = this._state.entry("modifiers") || [];
    const updatedModifiers = modifiers.filter((modifier) => modifier.id !== id);
    this._state.set("modifiers", updatedModifiers);
  }

  restore(data: StyleModifierSheetData): void {
    const { ...stateData } = data;
    this._state.setRecord(stateData);
  }
}
